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

async def add_more_courses():
    new_courses = [
        {
            'id': str(uuid.uuid4()),
            'title': 'Digital Marketing Mastery',
            'description': 'Learn SEO, social media marketing, email campaigns, and analytics to grow your online presence.',
            'thumbnail': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
            'coin_reward': 150,
            'modules': [
                {
                    'id': str(uuid.uuid4()),
                    'title': 'Introduction to Digital Marketing',
                    'video_url': 'https://www.youtube.com/embed/nU-IIXBWlS4',
                    'questions': [
                        {'question': 'What is digital marketing?', 'options': ['Online marketing', 'TV ads', 'Print media'], 'correct_answer': 'Online marketing'},
                        {'question': 'SEO stands for?', 'options': ['Search Engine Optimization', 'Social Engine Optimization'], 'correct_answer': 'Search Engine Optimization'}
                    ]
                },
                {
                    'id': str(uuid.uuid4()),
                    'title': 'Social Media Strategy',
                    'video_url': 'https://www.youtube.com/embed/bChZGKih_lc',
                    'questions': [
                        {'question': 'Which platform is best for B2B?', 'options': ['LinkedIn', 'TikTok', 'Instagram'], 'correct_answer': 'LinkedIn'},
                        {'question': 'Content is?', 'options': ['King', 'Queen', 'Unnecessary'], 'correct_answer': 'King'}
                    ]
                }
            ],
            'created_at': '2026-01-04T00:00:00Z'
        },
        {
            'id': str(uuid.uuid4()),
            'title': 'Machine Learning Fundamentals',
            'description': 'Dive into ML algorithms, neural networks, and AI applications with hands-on Python projects.',
            'thumbnail': 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=400',
            'coin_reward': 200,
            'modules': [
                {
                    'id': str(uuid.uuid4()),
                    'title': 'Introduction to Machine Learning',
                    'video_url': 'https://www.youtube.com/embed/ukzFI9rgwfU',
                    'questions': [
                        {'question': 'What is machine learning?', 'options': ['AI subset', 'Database', 'Web framework'], 'correct_answer': 'AI subset'},
                        {'question': 'Supervised learning uses?', 'options': ['Labeled data', 'Unlabeled data'], 'correct_answer': 'Labeled data'}
                    ]
                },
                {
                    'id': str(uuid.uuid4()),
                    'title': 'Neural Networks Basics',
                    'video_url': 'https://www.youtube.com/embed/aircAruvnKk',
                    'questions': [
                        {'question': 'Neural networks mimic?', 'options': ['Human brain', 'Computer', 'Database'], 'correct_answer': 'Human brain'},
                        {'question': 'Activation function is?', 'options': ['Non-linear transformation', 'Linear function'], 'correct_answer': 'Non-linear transformation'}
                    ]
                },
                {
                    'id': str(uuid.uuid4()),
                    'title': 'Python for ML',
                    'video_url': 'https://www.youtube.com/embed/7eh4d6sabA0',
                    'questions': [
                        {'question': 'Popular ML library in Python?', 'options': ['scikit-learn', 'jQuery', 'Bootstrap'], 'correct_answer': 'scikit-learn'},
                        {'question': 'NumPy is used for?', 'options': ['Numerical computing', 'Web design'], 'correct_answer': 'Numerical computing'}
                    ]
                }
            ],
            'created_at': '2026-01-05T00:00:00Z'
        },
        {
            'id': str(uuid.uuid4()),
            'title': 'Graphic Design Essentials',
            'description': 'Master Adobe Photoshop, Illustrator, color theory, and typography for stunning designs.',
            'thumbnail': 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400',
            'coin_reward': 120,
            'modules': [
                {
                    'id': str(uuid.uuid4()),
                    'title': 'Design Principles',
                    'video_url': 'https://www.youtube.com/embed/YqQx75OPRa0',
                    'questions': [
                        {'question': 'What is contrast in design?', 'options': ['Difference between elements', 'Similarity', 'Repetition'], 'correct_answer': 'Difference between elements'},
                        {'question': 'White space is?', 'options': ['Important', 'Waste of space'], 'correct_answer': 'Important'}
                    ]
                },
                {
                    'id': str(uuid.uuid4()),
                    'title': 'Color Theory',
                    'video_url': 'https://www.youtube.com/embed/_2LLXnUdUIc',
                    'questions': [
                        {'question': 'Primary colors are?', 'options': ['Red, Blue, Yellow', 'Green, Orange, Purple'], 'correct_answer': 'Red, Blue, Yellow'},
                        {'question': 'Complementary colors are?', 'options': ['Opposite on color wheel', 'Adjacent'], 'correct_answer': 'Opposite on color wheel'}
                    ]
                }
            ],
            'created_at': '2026-01-06T00:00:00Z'
        },
        {
            'id': str(uuid.uuid4()),
            'title': 'Mobile App Development',
            'description': 'Build iOS and Android apps using React Native, Flutter, and modern development practices.',
            'thumbnail': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400',
            'coin_reward': 180,
            'modules': [
                {
                    'id': str(uuid.uuid4()),
                    'title': 'Introduction to Mobile Development',
                    'video_url': 'https://www.youtube.com/embed/0-S5a0eXPoc',
                    'questions': [
                        {'question': 'React Native uses?', 'options': ['JavaScript', 'Java', 'Swift'], 'correct_answer': 'JavaScript'},
                        {'question': 'Cross-platform means?', 'options': ['Works on multiple OS', 'Single OS only'], 'correct_answer': 'Works on multiple OS'}
                    ]
                },
                {
                    'id': str(uuid.uuid4()),
                    'title': 'UI/UX for Mobile',
                    'video_url': 'https://www.youtube.com/embed/RFv7AKPe4xI',
                    'questions': [
                        {'question': 'Mobile-first design means?', 'options': ['Design for mobile first', 'Design for desktop first'], 'correct_answer': 'Design for mobile first'},
                        {'question': 'Touch targets should be?', 'options': ['44x44 pixels minimum', 'Any size'], 'correct_answer': '44x44 pixels minimum'}
                    ]
                }
            ],
            'created_at': '2026-01-07T00:00:00Z'
        },
        {
            'id': str(uuid.uuid4()),
            'title': 'Cybersecurity Basics',
            'description': 'Learn network security, encryption, ethical hacking, and how to protect systems from threats.',
            'thumbnail': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400',
            'coin_reward': 160,
            'modules': [
                {
                    'id': str(uuid.uuid4()),
                    'title': 'Introduction to Cybersecurity',
                    'video_url': 'https://www.youtube.com/embed/inWWhr5tnEA',
                    'questions': [
                        {'question': 'What is phishing?', 'options': ['Email scam', 'Virus', 'Firewall'], 'correct_answer': 'Email scam'},
                        {'question': 'Strong password includes?', 'options': ['Letters, numbers, symbols', 'Just letters'], 'correct_answer': 'Letters, numbers, symbols'}
                    ]
                },
                {
                    'id': str(uuid.uuid4()),
                    'title': 'Network Security',
                    'video_url': 'https://www.youtube.com/embed/qiQR5rTSshw',
                    'questions': [
                        {'question': 'What is a firewall?', 'options': ['Network security system', 'Hardware component'], 'correct_answer': 'Network security system'},
                        {'question': 'HTTPS uses?', 'options': ['Encryption', 'No encryption'], 'correct_answer': 'Encryption'}
                    ]
                }
            ],
            'created_at': '2026-01-08T00:00:00Z'
        },
        {
            'id': str(uuid.uuid4()),
            'title': 'Blockchain & Cryptocurrency',
            'description': 'Understand blockchain technology, Bitcoin, Ethereum, smart contracts, and DeFi basics.',
            'thumbnail': 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400',
            'coin_reward': 140,
            'modules': [
                {
                    'id': str(uuid.uuid4()),
                    'title': 'Blockchain Fundamentals',
                    'video_url': 'https://www.youtube.com/embed/qOVAbKKSH10',
                    'questions': [
                        {'question': 'Blockchain is?', 'options': ['Distributed ledger', 'Centralized database'], 'correct_answer': 'Distributed ledger'},
                        {'question': 'Bitcoin was created in?', 'options': ['2009', '2015', '2020'], 'correct_answer': '2009'}
                    ]
                },
                {
                    'id': str(uuid.uuid4()),
                    'title': 'Smart Contracts',
                    'video_url': 'https://www.youtube.com/embed/ZE2HxTmxfrI',
                    'questions': [
                        {'question': 'Smart contracts run on?', 'options': ['Blockchain', 'Traditional servers'], 'correct_answer': 'Blockchain'},
                        {'question': 'Ethereum supports?', 'options': ['Smart contracts', 'Only currency'], 'correct_answer': 'Smart contracts'}
                    ]
                }
            ],
            'created_at': '2026-01-09T00:00:00Z'
        }
    ]
    
    for course in new_courses:
        existing = await db.courses.find_one({'title': course['title']})
        if not existing:
            await db.courses.insert_one(course)
            print(f"Added: {course['title']}")
        else:
            print(f"Already exists: {course['title']}")
    
    total = await db.courses.count_documents({})
    print(f'\nTotal courses in database: {total}')
    client.close()

if __name__ == '__main__':
    asyncio.run(add_more_courses())
