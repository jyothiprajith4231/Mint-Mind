import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/utils/api';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { Trophy, Coins, Medal } from 'lucide-react';

const Leaderboard = () => {
  const [user, setUser] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, leaderRes] = await Promise.all([
        api.get('/users/me'),
        api.get('/leaderboard')
      ]);
      setUser(userRes.data);
      setLeaderboard(leaderRes.data);
    } catch (error) {
      toast.error('Failed to load leaderboard');
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
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">Leaderboard</h1>
          <p className="text-lg text-slate-600">See where you rank among top learners</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-heavy rounded-3xl overflow-hidden"
          data-testid="leaderboard-table"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/40">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Student</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Coins</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Courses</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">P2P Sessions</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((student, index) => {
                  const isCurrentUser = student.id === user?.id;
                  return (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`border-t border-white/30 hover:bg-white/60 transition-all ${
                        isCurrentUser ? 'bg-violet-50/50' : ''
                      }`}
                      data-testid={`leaderboard-row-${index}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {index === 0 && <Trophy className="w-6 h-6 text-amber-500" />}
                          {index === 1 && <Medal className="w-6 h-6 text-slate-400" />}
                          {index === 2 && <Medal className="w-6 h-6 text-orange-600" />}
                          <span className="font-semibold text-slate-900">{index + 1}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">
                          {student.name}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded-full">You</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Coins className="w-5 h-5 text-amber-500" />
                          <span className="font-semibold text-slate-900">{student.coins}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700">{student.total_courses_completed}</td>
                      <td className="px-6 py-4 text-slate-700">{student.total_sessions_completed}</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Leaderboard;