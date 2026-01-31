import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/utils/api';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { Bell, BellOff, Clock, Award, MessageCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const NotificationSettings = () => {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({
    session_reminders: true,
    quiz_achievements: true,
    coin_earned: true,
    ai_tips: true,
    urgent_only: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const userRes = await api.get('/users/me');
      setUser(userRes.data);
      
      const settingsRes = await api.get('/notifications/settings');
      if (settingsRes.data) {
        setSettings(settingsRes.data);
      }
    } catch (error) {
      console.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    
    try {
      await api.post('/notifications/settings', newSettings);
      toast.success('Notification settings updated', {
        duration: 3000
      });
    } catch (error) {
      toast.error('Failed to update settings');
      setSettings(settings); // Revert on error
    }
  };

  if (loading) return <div className="min-h-screen ambient-bg flex items-center justify-center"><div className="text-2xl text-slate-600">Loading...</div></div>;

  return (
    <div className="min-h-screen ambient-bg">
      <Navbar user={user} />
      
      <div className="max-w-4xl mx-auto px-6 md:px-12 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">Notification Settings</h1>
          <p className="text-lg text-slate-600">Customize your notification preferences</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-heavy rounded-3xl p-8"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between py-4 border-b border-white/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <Label className="text-slate-900 font-semibold text-base">Session Reminders</Label>
                  <p className="text-sm text-slate-600">Get notified about upcoming P2P sessions</p>
                </div>
              </div>
              <Switch
                checked={settings.session_reminders}
                onCheckedChange={() => handleToggle('session_reminders')}
                data-testid="toggle-session-reminders"
              />
            </div>

            <div className="flex items-center justify-between py-4 border-b border-white/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <Label className="text-slate-900 font-semibold text-base">Quiz Achievements</Label>
                  <p className="text-sm text-slate-600">Celebrate when you pass quizzes and earn coins</p>
                </div>
              </div>
              <Switch
                checked={settings.quiz_achievements}
                onCheckedChange={() => handleToggle('quiz_achievements')}
                data-testid="toggle-quiz-achievements"
              />
            </div>

            <div className="flex items-center justify-between py-4 border-b border-white/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <span className="text-2xl">🪙</span>
                </div>
                <div>
                  <Label className="text-slate-900 font-semibold text-base">Coin Earnings</Label>
                  <p className="text-sm text-slate-600">Get notified when you earn coins</p>
                </div>
              </div>
              <Switch
                checked={settings.coin_earned}
                onCheckedChange={() => handleToggle('coin_earned')}
                data-testid="toggle-coin-earned"
              />
            </div>

            <div className="flex items-center justify-between py-4 border-b border-white/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-sky-600" />
                </div>
                <div>
                  <Label className="text-slate-900 font-semibold text-base">AI Study Tips</Label>
                  <p className="text-sm text-slate-600">Receive personalized learning suggestions</p>
                </div>
              </div>
              <Switch
                checked={settings.ai_tips}
                onCheckedChange={() => handleToggle('ai_tips')}
                data-testid="toggle-ai-tips"
              />
            </div>

            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <BellOff className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <Label className="text-slate-900 font-semibold text-base">Urgent Only Mode</Label>
                  <p className="text-sm text-slate-600">Only show critical notifications (sessions within 1 hour)</p>
                </div>
              </div>
              <Switch
                checked={settings.urgent_only}
                onCheckedChange={() => handleToggle('urgent_only')}
                data-testid="toggle-urgent-only"
              />
            </div>
          </div>

          <div className="mt-8 p-4 bg-violet-50 rounded-2xl">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-violet-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-slate-900 text-sm mb-1">About Notifications</h4>
                <p className="text-xs text-slate-600">
                  In-app toast notifications will appear in the top-right corner. You'll be automatically notified when sessions start within 1 hour, when you earn coins, and when important events occur.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotificationSettings;