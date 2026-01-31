import requests
import sys
import json
from datetime import datetime, timedelta

class M2APITester:
    def __init__(self, base_url="https://m-squared.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True)
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                self.log_test(name, False, f"Expected {expected_status}, got {response.status_code}. Response: {response.text[:200]}")
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_auth_signup(self):
        """Test user signup"""
        timestamp = datetime.now().strftime('%H%M%S')
        signup_data = {
            "email": f"test_user_{timestamp}@example.com",
            "password": "TestPass123!",
            "name": f"Test User {timestamp}"
        }
        
        success, response = self.run_test(
            "Auth - Signup",
            "POST",
            "auth/signup",
            200,
            data=signup_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            return True, signup_data
        return False, {}

    def test_auth_login(self, email, password):
        """Test user login"""
        login_data = {"email": email, "password": password}
        
        success, response = self.run_test(
            "Auth - Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            return True
        return False

    def test_get_profile(self):
        """Test get user profile"""
        success, response = self.run_test(
            "Users - Get Profile",
            "GET",
            "users/me",
            200
        )
        return success, response

    def test_get_courses(self):
        """Test get all courses"""
        success, response = self.run_test(
            "Courses - Get All",
            "GET",
            "courses",
            200
        )
        return success, response

    def test_get_course_detail(self, course_id):
        """Test get course detail"""
        success, response = self.run_test(
            f"Courses - Get Detail ({course_id})",
            "GET",
            f"courses/{course_id}",
            200
        )
        return success, response

    def test_enroll_course(self, course_id):
        """Test course enrollment"""
        success, response = self.run_test(
            f"Courses - Enroll ({course_id})",
            "POST",
            f"courses/{course_id}/enroll",
            200
        )
        return success, response

    def test_get_enrollments(self):
        """Test get user enrollments"""
        success, response = self.run_test(
            "Enrollments - Get All",
            "GET",
            "enrollments",
            200
        )
        return success, response

    def test_submit_quiz(self, course_id, module_id, answers):
        """Test quiz submission"""
        quiz_data = {
            "module_id": module_id,
            "course_id": course_id,
            "answers": answers
        }
        
        success, response = self.run_test(
            f"Quiz - Submit ({module_id})",
            "POST",
            "quizzes/submit",
            200,
            data=quiz_data
        )
        return success, response

    def test_add_skill(self, skill):
        """Test adding a skill"""
        skill_data = {"skill": skill}
        
        success, response = self.run_test(
            f"P2P - Add Skill ({skill})",
            "POST",
            "skills/add",
            200,
            data=skill_data
        )
        return success, response

    def test_get_mentors(self):
        """Test get mentors"""
        success, response = self.run_test(
            "P2P - Get Mentors",
            "GET",
            "p2p/mentors",
            200
        )
        return success, response

    def test_book_session(self, mentor_id, skill):
        """Test booking a P2P session"""
        scheduled_time = (datetime.now() + timedelta(days=1)).isoformat()
        booking_data = {
            "mentor_id": mentor_id,
            "skill": skill,
            "scheduled_at": scheduled_time
        }
        
        success, response = self.run_test(
            f"P2P - Book Session",
            "POST",
            "p2p/sessions/book",
            200,
            data=booking_data
        )
        return success, response

    def test_get_my_sessions(self):
        """Test get user sessions"""
        success, response = self.run_test(
            "P2P - Get My Sessions",
            "GET",
            "p2p/sessions/my",
            200
        )
        return success, response

    def test_rate_session(self, session_id):
        """Test rating a session"""
        rating_data = {
            "session_id": session_id,
            "rating": 5,
            "feedback": "Great session!"
        }
        
        success, response = self.run_test(
            f"P2P - Rate Session ({session_id})",
            "POST",
            "p2p/sessions/rate",
            200,
            data=rating_data
        )
        return success, response

    def test_get_leaderboard(self):
        """Test get leaderboard"""
        success, response = self.run_test(
            "Leaderboard - Get All",
            "GET",
            "leaderboard",
            200
        )
        return success, response

    def test_get_rewards(self):
        """Test get rewards"""
        success, response = self.run_test(
            "Store - Get Rewards",
            "GET",
            "rewards",
            200
        )
        return success, response

    def test_redeem_reward(self, reward_id):
        """Test redeem reward"""
        redemption_data = {"reward_id": reward_id}
        
        success, response = self.run_test(
            f"Store - Redeem Reward ({reward_id})",
            "POST",
            "rewards/redeem",
            200,
            data=redemption_data
        )
        return success, response

    def test_ai_recommendations(self):
        """Test AI recommendations"""
        success, response = self.run_test(
            "AI - Get Recommendations",
            "GET",
            "ai/recommendations",
            200
        )
        return success, response

def main():
    print("🚀 Starting M² (Mind Meld) API Testing...")
    print("=" * 60)
    
    tester = M2APITester()
    
    # Test Authentication Flow
    print("\n📝 Testing Authentication...")
    signup_success, signup_data = tester.test_auth_signup()
    if not signup_success:
        print("❌ Signup failed, stopping tests")
        return 1
    
    # Test login with the same credentials
    login_success = tester.test_auth_login(signup_data['email'], signup_data['password'])
    if not login_success:
        print("❌ Login failed, stopping tests")
        return 1
    
    # Test Profile
    print("\n👤 Testing User Profile...")
    tester.test_get_profile()
    
    # Test Courses
    print("\n📚 Testing Courses...")
    courses_success, courses_data = tester.test_get_courses()
    
    course_id = None
    if courses_success and courses_data:
        course_id = courses_data[0]['id']
        tester.test_get_course_detail(course_id)
        tester.test_enroll_course(course_id)
        tester.test_get_enrollments()
        
        # Test quiz submission with first module
        if courses_data[0]['modules']:
            module = courses_data[0]['modules'][0]
            # Create dummy answers for all questions
            answers = [{"answer": q['options'][0]} for q in module['questions']]
            tester.test_submit_quiz(course_id, module['id'], answers)
    
    # Test P2P Learning
    print("\n🤝 Testing P2P Learning...")
    tester.test_add_skill("Python Programming")
    mentors_success, mentors_data = tester.test_get_mentors()
    tester.test_get_my_sessions()
    
    # Test Leaderboard
    print("\n🏆 Testing Leaderboard...")
    tester.test_get_leaderboard()
    
    # Test Store
    print("\n🛒 Testing Store...")
    rewards_success, rewards_data = tester.test_get_rewards()
    
    # Test AI Recommendations
    print("\n🤖 Testing AI Recommendations...")
    tester.test_ai_recommendations()
    
    # Print Results
    print("\n" + "=" * 60)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    # Print failed tests
    failed_tests = [t for t in tester.test_results if not t['success']]
    if failed_tests:
        print("\n❌ Failed Tests:")
        for test in failed_tests:
            print(f"  - {test['test']}: {test['details']}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())