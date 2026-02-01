import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
import uuid
import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def seed_realistic_users():
    users_data = [
        {'name': 'Sarah Chen', 'email': 'sarah.chen@email.com', 'coins': 850, 'skills': ['Python', 'Data Science', 'Machine Learning'], 'courses': 12, 'sessions': 15},
        {'name': 'Marcus Johnson', 'email': 'marcus.j@email.com', 'coins': 720, 'skills': ['Web Development', 'React', 'JavaScript'], 'courses': 10, 'sessions': 12},
        {'name': 'Priya Sharma', 'email': 'priya.sharma@email.com', 'coins': 680, 'skills': ['Graphic Design', 'UI/UX', 'Figma'], 'courses': 9, 'sessions': 10},
        {'name': 'David Park', 'email': 'david.park@email.com', 'coins': 640, 'skills': ['Cybersecurity', 'Network Security'], 'courses': 8, 'sessions': 9},
        {'name': 'Emma Rodriguez', 'email': 'emma.rod@email.com', 'coins': 590, 'skills': ['Digital Marketing', 'SEO', 'Content Strategy'], 'courses': 8, 'sessions': 7},
        {'name': 'James Wilson', 'email': 'james.wilson@email.com', 'coins': 550, 'skills': ['Mobile Development', 'Flutter', 'React Native'], 'courses': 7, 'sessions': 6},
        {'name': 'Aisha Mohammed', 'email': 'aisha.m@email.com', 'coins': 510, 'skills': ['Blockchain', 'Cryptocurrency', 'Smart Contracts'], 'courses': 6, 'sessions': 8},
        {'name': 'Lucas Silva', 'email': 'lucas.silva@email.com', 'coins': 470, 'skills': ['Python', 'Web Scraping', 'Automation'], 'courses': 6, 'sessions': 5},
        {'name': 'Yuki Tanaka', 'email': 'yuki.tanaka@email.com', 'coins': 430, 'skills': ['Machine Learning', 'AI', 'TensorFlow'], 'courses': 5, 'sessions': 4},
        {'name': 'Sofia Martinez', 'email': 'sofia.mart@email.com', 'coins': 390, 'skills': ['Data Visualization', 'Tableau', 'Analytics'], 'courses': 5, 'sessions': 3},
    ]
    
    for user_data in users_data:
        existing = await db.users.find_one({'email': user_data['email']})
        if not existing:
            hashed_pw = bcrypt.hashpw('password123'.encode('utf-8'), bcrypt.gensalt())
            user = {
                'id': str(uuid.uuid4()),
                'email': user_data['email'],
                'name': user_data['name'],
                'password_hash': hashed_pw.decode('utf-8'),
                'coins': user_data['coins'],
                'streak_count': 5,
                'last_activity': None,
                'skills_can_teach': user_data['skills'],
                'total_courses_completed': user_data['courses'],
                'total_sessions_completed': user_data['sessions'],
                'mentor_rating': round(4.2 + (user_data['coins'] / 1000), 1),
                'total_ratings': user_data['sessions'],
                'created_at': '2026-01-01T00:00:00Z'
            }
            await db.users.insert_one(user)
            print(f"Added: {user_data['name']} - {user_data['coins']} coins")
        else:
            print(f"Already exists: {user_data['name']}")
    
    total_users = await db.users.count_documents({})
    print(f'\nTotal users in database: {total_users}')
    client.close()

if __name__ == '__main__':
    asyncio.run(seed_realistic_users())
