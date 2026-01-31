from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

JWT_SECRET = os.environ.get('JWT_SECRET', 'fallback_secret')
JWT_ALGORITHM = 'HS256'
security = HTTPBearer()

def create_token(user_id: str) -> str:
    payload = {
        'user_id': user_id,
        'exp': datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({'id': payload['user_id']}, {'_id': 0})
        if not user:
            raise HTTPException(status_code=401, detail='User not found')
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail='Token expired')
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail='Invalid token')

class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    coins: int = 0
    streak_count: int = 0
    last_activity: Optional[str] = None
    skills_can_teach: List[str] = []
    total_courses_completed: int = 0
    total_sessions_completed: int = 0

class Module(BaseModel):
    id: str
    title: str
    video_url: str
    questions: List[Dict]

class Course(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    title: str
    description: str
    thumbnail: str
    modules: List[Module]
    coin_reward: int = 100
    created_at: str

class EnrollmentResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    course_id: str
    progress: float = 0.0
    completed_modules: List[str] = []
    coins_earned: int = 0
    enrolled_at: str

class QuizSubmission(BaseModel):
    module_id: str
    course_id: str
    answers: List[Dict]

class SkillRequest(BaseModel):
    skill: str

class SessionBooking(BaseModel):
    mentor_id: str
    skill: str
    scheduled_at: str

class SessionRating(BaseModel):
    session_id: str
    rating: int
    feedback: Optional[str] = None

class DetailedRating(BaseModel):
    session_id: str
    overall_rating: int
    punctuality: int
    knowledge: int
    helpfulness: int
    feedback: Optional[str] = None

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None

class RewardRedemption(BaseModel):
    reward_id: str

@api_router.post('/auth/signup')
async def signup(req: SignupRequest):
    existing = await db.users.find_one({'email': req.email}, {'_id': 0})
    if existing:
        raise HTTPException(status_code=400, detail='Email already registered')
    
    hashed_pw = bcrypt.hashpw(req.password.encode('utf-8'), bcrypt.gensalt())
    user_id = str(uuid.uuid4())
    user = {
        'id': user_id,
        'email': req.email,
        'name': req.name,
        'password_hash': hashed_pw.decode('utf-8'),
        'coins': 0,
        'streak_count': 0,
        'last_activity': None,
        'skills_can_teach': [],
        'total_courses_completed': 0,
        'total_sessions_completed': 0,
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user)
    token = create_token(user_id)
    return {'token': token, 'user': UserProfile(**user)}

@api_router.post('/auth/login')
async def login(req: LoginRequest):
    user = await db.users.find_one({'email': req.email}, {'_id': 0})
    if not user:
        raise HTTPException(status_code=401, detail='Invalid credentials')
    
    if not bcrypt.checkpw(req.password.encode('utf-8'), user['password_hash'].encode('utf-8')):
        raise HTTPException(status_code=401, detail='Invalid credentials')
    
    token = create_token(user['id'])
    return {'token': token, 'user': UserProfile(**user)}

@api_router.get('/users/me', response_model=UserProfile)
async def get_profile(user=Depends(get_current_user)):
    return UserProfile(**user)

@api_router.get('/courses', response_model=List[Course])
async def get_courses():
    courses = await db.courses.find({}, {'_id': 0}).to_list(100)
    return courses

@api_router.get('/courses/{course_id}', response_model=Course)
async def get_course(course_id: str):
    course = await db.courses.find_one({'id': course_id}, {'_id': 0})
    if not course:
        raise HTTPException(status_code=404, detail='Course not found')
    return course

@api_router.post('/courses/{course_id}/enroll')
async def enroll_course(course_id: str, user=Depends(get_current_user)):
    course = await db.courses.find_one({'id': course_id}, {'_id': 0})
    if not course:
        raise HTTPException(status_code=404, detail='Course not found')
    
    existing = await db.enrollments.find_one({
        'user_id': user['id'],
        'course_id': course_id
    }, {'_id': 0})
    
    if existing:
        return EnrollmentResponse(**existing)
    
    enrollment = {
        'id': str(uuid.uuid4()),
        'user_id': user['id'],
        'course_id': course_id,
        'progress': 0.0,
        'completed_modules': [],
        'coins_earned': 0,
        'enrolled_at': datetime.now(timezone.utc).isoformat()
    }
    await db.enrollments.insert_one(enrollment)
    return EnrollmentResponse(**enrollment)

@api_router.post('/quizzes/submit')
async def submit_quiz(submission: QuizSubmission, user=Depends(get_current_user)):
    course = await db.courses.find_one({'id': submission.course_id}, {'_id': 0})
    if not course:
        raise HTTPException(status_code=404, detail='Course not found')
    
    module = next((m for m in course['modules'] if m['id'] == submission.module_id), None)
    if not module:
        raise HTTPException(status_code=404, detail='Module not found')
    
    correct_count = 0
    for i, answer in enumerate(submission.answers):
        if i < len(module['questions']):
            if answer.get('answer') == module['questions'][i].get('correct_answer'):
                correct_count += 1
    
    score = (correct_count / len(module['questions'])) * 100 if module['questions'] else 0
    passed = score >= 70
    
    quiz_attempt = {
        'id': str(uuid.uuid4()),
        'user_id': user['id'],
        'module_id': submission.module_id,
        'course_id': submission.course_id,
        'score': score,
        'passed': passed,
        'completed_at': datetime.now(timezone.utc).isoformat()
    }
    await db.quiz_attempts.insert_one(quiz_attempt)
    
    if passed:
        enrollment = await db.enrollments.find_one({
            'user_id': user['id'],
            'course_id': submission.course_id
        }, {'_id': 0})
        
        if enrollment and submission.module_id not in enrollment['completed_modules']:
            enrollment['completed_modules'].append(submission.module_id)
            enrollment['progress'] = (len(enrollment['completed_modules']) / len(course['modules'])) * 100
            
            coins_for_module = 20
            enrollment['coins_earned'] += coins_for_module
            
            await db.enrollments.update_one(
                {'id': enrollment['id']},
                {'$set': enrollment}
            )
            
            await db.users.update_one(
                {'id': user['id']},
                {'$inc': {'coins': coins_for_module}}
            )
            
            if enrollment['progress'] >= 100:
                bonus_coins = course.get('coin_reward', 100) - enrollment['coins_earned']
                if bonus_coins > 0:
                    await db.users.update_one(
                        {'id': user['id']},
                        {'$inc': {'coins': bonus_coins, 'total_courses_completed': 1}}
                    )
                    enrollment['coins_earned'] += bonus_coins
    
    return {'score': score, 'passed': passed, 'coins_earned': 20 if passed else 0}

@api_router.get('/enrollments', response_model=List[EnrollmentResponse])
async def get_enrollments(user=Depends(get_current_user)):
    enrollments = await db.enrollments.find({'user_id': user['id']}, {'_id': 0}).to_list(100)
    return enrollments

@api_router.post('/skills/add')
async def add_skill(skill_req: SkillRequest, user=Depends(get_current_user)):
    await db.users.update_one(
        {'id': user['id']},
        {'$addToSet': {'skills_can_teach': skill_req.skill}}
    )
    return {'message': 'Skill added successfully'}

@api_router.get('/p2p/mentors')
async def get_mentors(skill: Optional[str] = None):
    query = {}
    if skill:
        query['skills_can_teach'] = skill
    else:
        query['skills_can_teach'] = {'$exists': True, '$ne': []}
    
    mentors = await db.users.find(query, {'_id': 0, 'password_hash': 0}).to_list(100)
    return mentors

@api_router.post('/p2p/sessions/book')
async def book_session(booking: SessionBooking, user=Depends(get_current_user)):
    if booking.mentor_id == user['id']:
        raise HTTPException(status_code=400, detail='Cannot book session with yourself')
    
    session = {
        'id': str(uuid.uuid4()),
        'mentor_id': booking.mentor_id,
        'learner_id': user['id'],
        'skill': booking.skill,
        'scheduled_at': booking.scheduled_at,
        'status': 'scheduled',
        'rating': None,
        'feedback': None,
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    await db.p2p_sessions.insert_one(session)
    return session

@api_router.get('/p2p/sessions/my')
async def get_my_sessions(user=Depends(get_current_user)):
    sessions = await db.p2p_sessions.find({
        '$or': [
            {'mentor_id': user['id']},
            {'learner_id': user['id']}
        ]
    }, {'_id': 0}).to_list(100)
    return sessions

class DetailedRating(BaseModel):
    session_id: str
    overall_rating: int
    punctuality: int
    knowledge: int
    helpfulness: int
    feedback: Optional[str] = None

@api_router.post('/p2p/sessions/rate')
async def rate_session(rating: DetailedRating, user=Depends(get_current_user)):
    session = await db.p2p_sessions.find_one({'id': rating.session_id}, {'_id': 0})
    if not session:
        raise HTTPException(status_code=404, detail='Session not found')
    
    if session['learner_id'] != user['id']:
        raise HTTPException(status_code=403, detail='Only learner can rate session')
    
    rating_data = {
        'overall_rating': rating.overall_rating,
        'punctuality': rating.punctuality,
        'knowledge': rating.knowledge,
        'helpfulness': rating.helpfulness,
        'feedback': rating.feedback,
        'status': 'completed'
    }
    
    await db.p2p_sessions.update_one(
        {'id': rating.session_id},
        {'$set': rating_data}
    )
    
    mentor_sessions = await db.p2p_sessions.find({
        'mentor_id': session['mentor_id'],
        'status': 'completed'
    }, {'_id': 0}).to_list(100)
    
    if mentor_sessions:
        avg_rating = sum(s.get('overall_rating', 0) for s in mentor_sessions) / len(mentor_sessions)
        await db.users.update_one(
            {'id': session['mentor_id']},
            {'$set': {'mentor_rating': round(avg_rating, 1), 'total_ratings': len(mentor_sessions)}}
        )
    
    await db.users.update_one(
        {'id': session['learner_id']},
        {'$inc': {'total_sessions_completed': 1, 'coins': 10}}
    )
    
    return {'message': 'Session rated successfully', 'coins_earned': 10}

@api_router.get('/leaderboard')
async def get_leaderboard():
    users = await db.users.find(
        {},
        {'_id': 0, 'id': 1, 'name': 1, 'coins': 1, 'total_courses_completed': 1, 'total_sessions_completed': 1}
    ).sort('coins', -1).limit(50).to_list(50)
    return users

@api_router.get('/rewards')
async def get_rewards():
    rewards = await db.rewards.find({}, {'_id': 0}).to_list(100)
    return rewards

@api_router.post('/rewards/redeem')
async def redeem_reward(redemption: RewardRedemption, user=Depends(get_current_user)):
    reward = await db.rewards.find_one({'id': redemption.reward_id}, {'_id': 0})
    if not reward:
        raise HTTPException(status_code=404, detail='Reward not found')
    
    if user['coins'] < reward['coin_cost']:
        raise HTTPException(status_code=400, detail='Insufficient coins')
    
    await db.users.update_one(
        {'id': user['id']},
        {'$inc': {'coins': -reward['coin_cost']}}
    )
    
    user_reward = {
        'id': str(uuid.uuid4()),
        'user_id': user['id'],
        'reward_id': reward['id'],
        'redeemed_at': datetime.now(timezone.utc).isoformat()
    }
    await db.user_rewards.insert_one(user_reward)
    
    return {'message': 'Reward redeemed successfully'}

@api_router.get('/ai/recommendations')
async def get_ai_recommendations(user=Depends(get_current_user)):
    enrollments = await db.enrollments.find({'user_id': user['id']}, {'_id': 0}).to_list(100)
    completed_courses = [e for e in enrollments if e['progress'] >= 100]
    
    all_courses = await db.courses.find({}, {'_id': 0, 'title': 1}).to_list(100)
    completed_titles = [c['course_id'] for c in completed_courses]
    
    chat = LlmChat(
        api_key=os.environ.get('EMERGENT_LLM_KEY'),
        session_id=f"recommendations_{user['id']}",
        system_message="You are an AI learning advisor. Recommend 3 courses based on user profile."
    ).with_model("openai", "gpt-4o")
    
    user_msg = UserMessage(
        text=f"User has completed {len(completed_courses)} courses. Skills they teach: {', '.join(user['skills_can_teach']) if user['skills_can_teach'] else 'None'}. Recommend 3 relevant learning paths in a brief, encouraging way."
    )
    
    try:
        response = await chat.send_message(user_msg)
        return {'recommendations': response}
    except Exception as e:
        return {'recommendations': 'Keep learning! Explore our course catalog to discover new skills.'}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()