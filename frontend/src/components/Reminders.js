import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/utils/api';
import { Bell, X, Calendar, Clock, History } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [history, setHistory] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchReminders();
    fetchHistory();
    const interval = setInterval(() => {
      fetchReminders();
      fetchHistory();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchReminders = async () => {
    try {
      const res = await api.get('/reminders');
      setReminders(res.data);
    } catch (error) {
      console.error('Failed to fetch reminders');
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get('/notifications/history');
      setHistory(res.data);
    } catch (error) {
      console.error('Failed to fetch notification history');
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.post(`/notifications/${notificationId}/read`);
      await fetchHistory();
    } catch (error) {
      console.error('Failed to mark as read');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative glass-heavy rounded-full p-2 hover:bg-white/60 transition-all"
        data-testid="reminders-bell"
      >
        <Bell className="w-5 h-5 text-slate-700" />
        {(reminders.length > 0 || history.filter(h => !h.read).length > 0) && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
            {reminders.length + history.filter(h => !h.read).length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-12 w-96 glass-heavy rounded-2xl shadow-xl overflow-hidden z-50"
            data-testid="reminders-dropdown"
          >
            <div className="bg-violet-500 p-4 flex items-center justify-between">
              <h3 className="font-semibold text-white">Notifications</h3>
              <button
                onClick={() => setShowDropdown(false)}
                className="text-white hover:bg-white/20 rounded-full p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="w-full bg-white/40 p-1">
                <TabsTrigger value="upcoming" className="flex-1 data-[state=active]:bg-white">
                  <Calendar className="w-4 h-4 mr-2" />
                  Upcoming
                </TabsTrigger>
                <TabsTrigger value="history" className="flex-1 data-[state=active]:bg-white">
                  <History className="w-4 h-4 mr-2" />
                  History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="max-h-96 overflow-y-auto p-4">
                {reminders.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                    <p className="text-slate-600 text-sm">No upcoming sessions</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reminders.map((reminder, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white/60 rounded-xl p-4"
                        data-testid={`reminder-${i}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            reminder.is_mentor ? 'bg-violet-100' : 'bg-sky-100'
                          }`}>
                            <Calendar className={`w-5 h-5 ${
                              reminder.is_mentor ? 'text-violet-600' : 'text-sky-600'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900 text-sm">
                              {reminder.session.skill}
                            </h4>
                            <p className="text-xs text-slate-600 mt-1">
                              {reminder.is_mentor ? 'Teaching session' : 'Learning session'}
                            </p>
                            <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                              <Clock className="w-3 h-3" />
                              <span>In {reminder.hours_until} hour{reminder.hours_until !== 1 ? 's' : ''}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="max-h-96 overflow-y-auto p-4">
                {history.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                    <p className="text-slate-600 text-sm">No notification history</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {history.map((notif) => (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`rounded-xl p-3 cursor-pointer transition-all ${
                          notif.read ? 'bg-white/40' : 'bg-violet-50'
                        }`}
                        onClick={() => !notif.read && markAsRead(notif.id)}
                        data-testid={`notification-${notif.id}`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-lg">{notif.icon}</span>
                          <div className="flex-1">
                            <p className={`text-sm ${notif.read ? 'text-slate-600' : 'text-slate-900 font-medium'}`}>
                              {notif.message}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {new Date(notif.created_at).toLocaleString()}
                            </p>
                          </div>
                          {!notif.read && (
                            <div className="w-2 h-2 bg-violet-500 rounded-full" />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Reminders;