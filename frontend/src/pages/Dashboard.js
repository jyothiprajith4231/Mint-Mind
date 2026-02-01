import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '@/utils/api';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { Coins, Flame, TrendingUp, BookOpen, Award } from 'lucide-react';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [recommendations, setRecommendations] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    checkNotifications();
    const interval = setInterval(checkNotifications, 300000); // Check every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const checkNotifications = async () => {
    try {
      const res = await api.get('/reminders');
      const urgentReminders = res.data.filter(r => r.hours_until <= 1);
      
      urgentReminders.forEach(reminder => {
        const message = reminder.is_mentor 
          ? `Teaching session "${reminder.session.skill}" starts in ${reminder.hours_until} hour${reminder.hours_until !== 1 ? 's' : ''}!`
          : `Learning session "${reminder.session.skill}" starts in ${reminder.hours_until} hour${reminder.hours_until !== 1 ? 's' : ''}!`;
        
        toast.info(message, {
          duration: 8000,
          icon: '🔔'
        });
      });
    } catch (error) {
      console.error('Failed to check notifications');
    }
  };

  const fetchData = async () => {
    try {
      const [userRes, enrollRes, recRes] = await Promise.all([
        api.get('/users/me'),
        api.get('/enrollments'),
        api.get('/ai/recommendations')
      ]);
      setUser(userRes.data);
      setEnrollments(enrollRes.data);
      setRecommendations(recRes.data.recommendations);
    } catch (error) {
      toast.error('Failed to load dashboard');
    }
  };

  if (!user) return <div className="min-h-screen ambient-bg flex items-center justify-center"><div className="text-2xl text-slate-600">Loading...</div></div>;

  return (
    <div className="min-h-screen ambient-bg">
      <Navbar user={user} />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">Welcome back, {user.name}!</h1>
          <p className="text-lg text-slate-600">Continue your learning journey</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-4 glass-heavy rounded-3xl p-8"
            data-testid="coins-card"
          >
            <div className="flex items-center gap-3 mb-2">
              <Coins className="w-8 h-8 text-amber-500" />
              <h3 className="text-xl font-semibold text-slate-900">Coins Balance</h3>
            </div>
            <p className="text-5xl font-bold text-amber-500 mt-4">{user.coins}</p>
            <p className="text-slate-600 mt-2">Keep learning to earn more!</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-4 glass-heavy rounded-3xl p-8"
            data-testid="streak-card"
          >
            <div className="flex items-center gap-3 mb-2">
              <Flame className="w-8 h-8 text-orange-500" />
              <h3 className="text-xl font-semibold text-slate-900">Streak</h3>
            </div>
            <p className="text-5xl font-bold text-orange-500 mt-4">{user.streak_count}</p>
            <p className="text-slate-600 mt-2">Days in a row</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="md:col-span-4 glass-heavy rounded-3xl p-8"
            data-testid="courses-completed-card"
          >
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-8 h-8 text-violet-600" />
              <h3 className="text-xl font-semibold text-slate-900">Completed</h3>
            </div>
            <p className="text-5xl font-bold text-violet-600 mt-4">{user.total_courses_completed}</p>
            <p className="text-slate-600 mt-2">Courses finished</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="md:col-span-8 md:row-span-2 glass-heavy rounded-3xl p-8"
            data-testid="enrollments-section"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-slate-900">My Courses</h3>
              <button
                onClick={() => navigate('/courses')}
                className="text-violet-600 hover:text-violet-700 font-medium"
                data-testid="browse-courses-btn"
              >
                Browse All
              </button>
            </div>
            {enrollments.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <p className="text-slate-600 mb-4">No courses enrolled yet</p>
                <button
                  onClick={() => navigate('/courses')}
                  className="bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-full px-6 py-2 font-medium"
                  data-testid="start-learning-btn"
                >
                  Start Learning
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {enrollments.slice(0, 3).map((enrollment) => (
                  <div key={enrollment.id} className="bg-white/60 rounded-2xl p-6 hover:bg-white/80 transition-all cursor-pointer" onClick={() => navigate(`/course/${enrollment.course_id}`)} data-testid={`enrollment-${enrollment.id}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-slate-900">Course Progress</h4>
                      <span className="text-sm text-violet-600 font-medium">{Math.round(enrollment.progress)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-violet-500 to-violet-600 h-2 rounded-full" style={{ width: `${enrollment.progress}%` }} />
                    </div>
                    <p className="text-sm text-slate-600 mt-2">{enrollment.coins_earned} coins earned</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="md:col-span-4 glass-heavy rounded-3xl p-8 relative overflow-hidden"
            data-testid="ai-recommendations-card"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-400/20 to-transparent rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">AI Recommendations</h3>
              </div>
              {recommendations ? (
                <div className="space-y-3">
                  {recommendations.split('\n').filter(line => line.trim()).map((line, i) => {
                    // Remove markdown symbols for cleaner display
                    let cleanLine = line.replace(/\*\*/g, '').replace(/###/g, '').trim();
                    
                    // Check if it's a numbered heading (1., 2., etc.)
                    const isNumberedHeading = cleanLine.match(/^(\d+)\.\s*(.+)$/);
                    
                    // Check if it's a bullet point
                    const isBullet = cleanLine.startsWith('-');
                    
                    if (isNumberedHeading) {
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 * i }}
                          className="flex items-start gap-3 mt-4"
                        >
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-white text-sm font-bold">{isNumberedHeading[1]}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900 text-base">{isNumberedHeading[2]}</h4>
                          </div>
                        </motion.div>
                      );
                    }
                    
                    if (isBullet) {
                      const bulletText = cleanLine.replace(/^-\s*/, '');
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 * i }}
                          className="flex items-start gap-2 pl-10"
                        >
                          <span className="text-violet-500 mt-1.5">•</span>
                          <p className="text-slate-700 text-sm leading-relaxed">{bulletText}</p>
                        </motion.div>
                      );
                    }
                    
                    // Regular text
                    if (cleanLine) {
                      return (
                        <motion.p
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 * i }}
                          className="text-slate-700 text-sm leading-relaxed"
                        >
                          {cleanLine}
                        </motion.p>
                      );
                    }
                    return null;
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-pulse text-slate-400">Loading recommendations...</div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;