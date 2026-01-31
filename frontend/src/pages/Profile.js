import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/utils/api';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { User, Coins, Award, Users } from 'lucide-react';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const userRes = await api.get('/users/me');
      setUser(userRes.data);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen ambient-bg flex items-center justify-center"><div className="text-2xl text-slate-600">Loading...</div></div>;

  return (
    <div className="min-h-screen ambient-bg">
      <Navbar user={user} />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">My Profile</h1>
          <p className="text-lg text-slate-600">View your learning journey</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 glass-heavy rounded-3xl p-8"
            data-testid="profile-info-card"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-violet-500 to-violet-600 flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
                <p className="text-slate-600">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/60 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="w-5 h-5 text-amber-500" />
                  <span className="text-sm text-slate-600">Total Coins</span>
                </div>
                <p className="text-3xl font-bold text-amber-500">{user.coins}</p>
              </div>
              <div className="bg-white/60 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-violet-600" />
                  <span className="text-sm text-slate-600">Courses Completed</span>
                </div>
                <p className="text-3xl font-bold text-violet-600">{user.total_courses_completed}</p>
              </div>
              <div className="bg-white/60 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-sky-600" />
                  <span className="text-sm text-slate-600">P2P Sessions</span>
                </div>
                <p className="text-3xl font-bold text-sky-600">{user.total_sessions_completed}</p>
              </div>
              <div className="bg-white/60 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-slate-600">Streak</span>
                </div>
                <p className="text-3xl font-bold text-orange-500">{user.streak_count} days</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-heavy rounded-3xl p-8"
            data-testid="skills-card"
          >
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Skills I Can Teach</h3>
            {user.skills_can_teach.length === 0 ? (
              <p className="text-slate-600 text-sm">No skills added yet</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {user.skills_can_teach.map((skill, i) => (
                  <span key={i} className="bg-violet-100 text-violet-700 px-3 py-2 rounded-full text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;