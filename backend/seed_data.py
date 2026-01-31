import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
import uuid

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def seed_courses():
    existing = await db.courses.count_documents({})
    if existing > 0:
        print('Courses already seeded')
        return
    
    courses = [
        {
            'id': str(uuid.uuid4()),
            'title': 'Python for Beginners',
            'description': 'Learn Python programming from scratch with hands-on projects and quizzes.',
            'thumbnail': 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400',
            'coin_reward': 100,
            'modules': [
                {
                    'id': str(uuid.uuid4()),
                    'title': 'Introduction to Python',
                    'video_url': 'https://www.youtube.com/embed/kqtD5dpn9C8',
                    'questions': [
                        {'question': 'What is Python?', 'options': ['A snake', 'A programming language', 'A game'], 'correct_answer': 'A programming language'},
                        {'question': 'Python is case-sensitive?', 'options': ['True', 'False'], 'correct_answer': 'True'}
                    ]
                },
                {
                    'id': str(uuid.uuid4()),
                    'title': 'Variables and Data Types',
                    'video_url': 'https://www.youtube.com/embed/LrOAl8vUFHY',
                    'questions': [
                        {'question': 'Which is a valid variable name?', 'options': ['1var', 'var_1', 'var-1'], 'correct_answer': 'var_1'},
                        {'question': 'What type is "Hello"?', 'options': ['int', 'str', 'bool'], 'correct_answer': 'str'}
                    ]
                }
            ],
            'created_at': '2026-01-01T00:00:00Z'
        },
        {
            'id': str(uuid.uuid4()),
            'title': 'Web Development Fundamentals',
            'description': 'Master HTML, CSS, and JavaScript to build modern websites.',
            'thumbnail': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400',
            'coin_reward': 150,
            'modules': [
                {
                    'id': str(uuid.uuid4()),
                    'title': 'HTML Basics',
                    'video_url': 'https://www.youtube.com/embed/qz0aGYrrlhU',
                    'questions': [
                        {'question': 'What does HTML stand for?', 'options': ['Hyper Text Markup Language', 'High Tech Modern Language'], 'correct_answer': 'Hyper Text Markup Language'},
                        {'question': 'Which tag is for headings?', 'options': ['<h1>', '<header>', '<head>'], 'correct_answer': '<h1>'}
                    ]
                },
                {
                    'id': str(uuid.uuid4()),
                    'title': 'CSS Styling',
                    'video_url': 'https://www.youtube.com/embed/1PnVor36_40',
                    'questions': [
                        {'question': 'CSS stands for?', 'options': ['Cascading Style Sheets', 'Computer Style Sheets'], 'correct_answer': 'Cascading Style Sheets'},
                        {'question': 'How to select class?', 'options': ['.classname', '#classname', 'classname'], 'correct_answer': '.classname'}
                    ]
                },
                {
                    'id': str(uuid.uuid4()),
                    'title': 'JavaScript Basics',
                    'video_url': 'https://www.youtube.com/embed/W6NZfCO5SIk',
                    'questions': [
                        {'question': 'JavaScript is a?', 'options': ['Scripting language', 'Markup language'], 'correct_answer': 'Scripting language'},
                        {'question': 'How to declare variable?', 'options': ['let x', 'var x', 'const x', 'All of above'], 'correct_answer': 'All of above'}
                    ]
                }
            ],
            'created_at': '2026-01-02T00:00:00Z'
        },
        {
            'id': str(uuid.uuid4()),
            'title': 'Data Science Essentials',
            'description': 'Learn data analysis, visualization, and machine learning basics.',
            'thumbnail': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
            'coin_reward': 200,
            'modules': [
                {
                    'id': str(uuid.uuid4()),
                    'title': 'Introduction to Data Science',
                    'video_url': 'https://www.youtube.com/embed/ua-CiDNNj30',
                    'questions': [
                        {'question': 'What is Data Science?', 'options': ['Field of study', 'Programming language'], 'correct_answer': 'Field of study'},
                        {'question': 'Python is used in data science?', 'options': ['Yes', 'No'], 'correct_answer': 'Yes'}
                    ]
                },
                {
                    'id': str(uuid.uuid4()),
                    'title': 'Data Visualization',
                    'video_url': 'https://www.youtube.com/embed/0P7QnIQDBJY',
                    'questions': [
                        {'question': 'Which library for visualization?', 'options': ['Matplotlib', 'NumPy', 'Pandas'], 'correct_answer': 'Matplotlib'},
                        {'question': 'Visualization helps understanding?', 'options': ['True', 'False'], 'correct_answer': 'True'}
                    ]
                }
            ],
            'created_at': '2026-01-03T00:00:00Z'
        }
    ]
    
    await db.courses.insert_many(courses)
    print(f'Seeded {len(courses)} courses')

async def seed_rewards():
    existing = await db.rewards.count_documents({})
    if existing > 0:
        print('Rewards already seeded')
        return
    
    rewards = [
        {
            'id': str(uuid.uuid4()),
            'name': 'Premium Notebook',
            'description': 'High-quality ruled notebook for your studies',
            'coin_cost': 100,
            'image': 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=300',
            'stock': 50
        },
        {
            'id': str(uuid.uuid4()),
            'name': 'Gel Pen Set',
            'description': 'Set of 5 smooth-writing gel pens',
            'coin_cost': 50,
            'image': 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=300',
            'stock': 100
        },
        {
            'id': str(uuid.uuid4()),
            'name': 'Study Planner',
            'description': 'Weekly study planner to organize your learning',
            'coin_cost': 80,
            'image': 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=300',
            'stock': 75
        },
        {
            'id': str(uuid.uuid4()),
            'name': 'Highlighter Set',
            'description': '6 vibrant colors for highlighting key concepts',
            'coin_cost': 40,
            'image': 'https://images.unsplash.com/photo-1614112644071-a129283e6ea1?w=300',
            'stock': 120
        },
        {
            'id': str(uuid.uuid4()),
            'name': 'Backpack',
            'description': 'Durable backpack for carrying your study materials',
            'coin_cost': 250,
            'image': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300',
            'stock': 30
        }
    ]
    
    await db.rewards.insert_many(rewards)
    print(f'Seeded {len(rewards)} rewards')

async def main():
    await seed_courses()
    await seed_rewards()
    client.close()
    print('Database seeded successfully!')

if __name__ == '__main__':
    asyncio.run(main())