import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/utils/api';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { Users, Plus, Calendar, Star, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const P2P = () => {
  const [user, setUser] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [showBookSession, setShowBookSession] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [bookingData, setBookingData] = useState({ skill: '', scheduled_at: '' });
  const [showRateSession, setShowRateSession] = useState(false);
  const [ratingData, setRatingData] = useState({
    session_id: '',
    overall_rating: 5,
    punctuality: 5,
    knowledge: 5,
    helpfulness: 5,
    feedback: ''
  });
  const [mentorProfile, setMentorProfile] = useState({
    mentor_description: '',
    mentor_link: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, mentorsRes, sessionsRes] = await Promise.all([
        api.get('/users/me'),
        api.get('/p2p/mentors'),
        api.get('/p2p/sessions/my')
      ]);
      setUser(userRes.data);
      setMentors(mentorsRes.data);
      setSessions(sessionsRes.data);
      
      setMentorProfile({
        mentor_description: userRes.data.mentor_description || '',
        mentor_link: userRes.data.mentor_link || ''
      });
    } catch (error) {
      toast.error('Failed to load P2P data');
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;
    try {
      await api.post('/skills/add', { skill: newSkill });
      toast.success('Skill added successfully!');
      setNewSkill('');
      setShowAddSkill(false);
      await fetchData();
    } catch (error) {
      toast.error('Failed to add skill');
    }
  };

  const handleUpdateMentorProfile = async () => {
    try {
      await api.post('/mentor/profile', mentorProfile);
      toast.success('Mentor profile updated!', {
        description: 'Your profile is now more visible to learners',
        duration: 4000
      });
      setShowEditProfile(false);
      await fetchData();
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleBookSession = async () => {
    try {
      await api.post('/p2p/sessions/book', {
        mentor_id: selectedMentor.id,
        skill: bookingData.skill,
        scheduled_at: bookingData.scheduled_at
      });
      toast.success('Session booked successfully!', {
        description: `Your session with ${selectedMentor.name} has been scheduled.`,
        duration: 5000
      });
      
      // Send notification about upcoming session
      const sessionDate = new Date(bookingData.scheduled_at);
      const timeUntil = Math.round((sessionDate - new Date()) / (1000 * 60 * 60));
      if (timeUntil <= 24) {
        toast.info(`🔔 Reminder: Session starts in ${timeUntil} hours`, {
          duration: 6000
        });
      }
      
      setShowBookSession(false);
      setBookingData({ skill: '', scheduled_at: '' });
      await fetchData();
    } catch (error) {
      toast.error('Failed to book session');
    }
  };

  const handleRateSession = async () => {
    try {
      await api.post('/p2p/sessions/rate', ratingData);
      toast.success(`Session rated! Earned 10 coins!`, {
        description: 'Thank you for your feedback!',
        duration: 5000,
        icon: '🪙'
      });
      setShowRateSession(false);
      setRatingData({
        session_id: '',
        overall_rating: 5,
        punctuality: 5,
        knowledge: 5,
        helpfulness: 5,
        feedback: ''
      });
      await fetchData();
    } catch (error) {
      toast.error('Failed to rate session');
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
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">Peer-to-Peer Learning</h1>
          <p className="text-lg text-slate-600">Learn from peers and teach what you know</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-heavy rounded-3xl p-6"
            data-testid="my-skills-card"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-slate-900">My Skills</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowEditProfile(true)}
                  className="glass-heavy rounded-full p-2 hover:bg-white/60 transition-all"
                  data-testid="edit-mentor-profile-btn"
                  title="Edit mentor profile"
                >
                  <Edit className="w-4 h-4 text-violet-600" />
                </button>
                <button
                  onClick={() => setShowAddSkill(true)}
                  className="glass-heavy rounded-full p-2 hover:bg-white/60 transition-all"
                  data-testid="add-skill-btn"
                >
                  <Plus className="w-5 h-5 text-violet-600" />
                </button>
              </div>
            </div>
            {user.skills_can_teach.length === 0 ? (
              <p className="text-slate-600 text-sm">No skills added yet</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {user.skills_can_teach.map((skill, i) => (
                  <span key={i} className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-sm font-medium" data-testid={`skill-${i}`}>
                    {skill}
                  </span>
                ))}
              </div>
            )}
            {(user.mentor_description || user.mentor_link) && (
              <div className="mt-4 pt-4 border-t border-white/30">
                {user.mentor_description && (
                  <p className="text-sm text-slate-700 mb-2">{user.mentor_description}</p>
                )}
                {user.mentor_link && (
                  <a 
                    href={user.mentor_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-violet-600 hover:text-violet-700 underline"
                  >
                    View Portfolio/Profile →
                  </a>
                )}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-heavy rounded-3xl p-6"
            data-testid="mentors-count-card"
          >
            <Users className="w-8 h-8 text-violet-600 mb-2" />
            <h3 className="text-xl font-semibold text-slate-900 mb-1">Available Mentors</h3>
            <p className="text-3xl font-bold text-violet-600">{mentors.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-heavy rounded-3xl p-6"
            data-testid="sessions-count-card"
          >
            <Calendar className="w-8 h-8 text-violet-600 mb-2" />
            <h3 className="text-xl font-semibold text-slate-900 mb-1">My Sessions</h3>
            <p className="text-3xl font-bold text-violet-600">{sessions.length}</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Find Mentors</h2>
            <div className="space-y-4">
              {mentors.slice(0, 5).map((mentor, index) => (
                <div key={mentor.id} className="glass-heavy rounded-2xl p-6" data-testid={`mentor-${mentor.id}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-slate-900">{mentor.name}</h4>
                    {mentor.mentor_rating && (
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-semibold">{mentor.mentor_rating}</span>
                        <span className="text-xs text-slate-500">({mentor.total_ratings})</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {mentor.skills_can_teach.map((skill, i) => (
                      <span key={i} className="bg-sky-100 text-sky-700 px-2 py-1 rounded-full text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedMentor(mentor);
                      setShowBookSession(true);
                    }}
                    className="bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-full px-4 py-2 text-sm font-medium"
                    data-testid={`book-session-${mentor.id}`}
                  >
                    Book Session
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">My Sessions</h2>
            <div className="space-y-4">
              {sessions.length === 0 ? (
                <div className="glass-heavy rounded-2xl p-12 text-center">
                  <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                  <p className="text-slate-600">No sessions booked yet</p>
                </div>
              ) : (
                sessions.map((session) => (
                  <div key={session.id} className="glass-heavy rounded-2xl p-6" data-testid={`session-${session.id}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-slate-900">{session.skill}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        session.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {session.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">
                      Scheduled: {new Date(session.scheduled_at).toLocaleString()}
                    </p>
                    {session.status === 'scheduled' && session.learner_id === user.id && (
                      <button
                        onClick={() => {
                          setRatingData({ ...ratingData, session_id: session.id });
                          setShowRateSession(true);
                        }}
                        className="text-violet-600 hover:text-violet-700 font-medium text-sm"
                        data-testid={`rate-session-${session.id}`}
                      >
                        Rate Session
                      </button>
                    )}
                    {session.rating && (
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium">{session.overall_rating}/5</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <Dialog open={showAddSkill} onOpenChange={setShowAddSkill}>
        <DialogContent className="glass-heavy" data-testid="add-skill-dialog">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900">Add Skill</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="skill" className="text-slate-700 font-medium">Skill Name</Label>
              <Input
                id="skill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="mt-2 bg-white/50 border-slate-200 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl h-12"
                placeholder="e.g., Python, Web Design"
                data-testid="skill-input"
              />
            </div>
            <button
              onClick={handleAddSkill}
              className="w-full bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-full px-6 py-3 font-medium"
              data-testid="skill-submit-btn"
            >
              Add Skill
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showBookSession} onOpenChange={setShowBookSession}>
        <DialogContent className="glass-heavy" data-testid="book-session-dialog">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900">Book Session</DialogTitle>
          </DialogHeader>
          {selectedMentor && (
            <div className="space-y-4 mt-4">
              <p className="text-slate-700">Booking with: <span className="font-semibold">{selectedMentor.name}</span></p>
              <div>
                <Label htmlFor="session-skill" className="text-slate-700 font-medium">Skill</Label>
                <Input
                  id="session-skill"
                  value={bookingData.skill}
                  onChange={(e) => setBookingData({ ...bookingData, skill: e.target.value })}
                  className="mt-2 bg-white/50 border-slate-200 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl h-12"
                  placeholder="Select a skill"
                  data-testid="booking-skill-input"
                />
              </div>
              <div>
                <Label htmlFor="scheduled-at" className="text-slate-700 font-medium">Date & Time</Label>
                <Input
                  id="scheduled-at"
                  type="datetime-local"
                  value={bookingData.scheduled_at}
                  onChange={(e) => setBookingData({ ...bookingData, scheduled_at: e.target.value })}
                  className="mt-2 bg-white/50 border-slate-200 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl h-12"
                  data-testid="booking-datetime-input"
                />
              </div>
              <button
                onClick={handleBookSession}
                className="w-full bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-full px-6 py-3 font-medium"
                data-testid="booking-submit-btn"
              >
                Confirm Booking
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showRateSession} onOpenChange={setShowRateSession}>
        <DialogContent className="glass-heavy max-w-md" data-testid="rate-session-dialog">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900">Rate Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-slate-700 font-medium">Overall Rating</Label>
                  <span className="text-2xl font-bold text-violet-600">{ratingData.overall_rating}/5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={ratingData.overall_rating}
                  onChange={(e) => setRatingData({ ...ratingData, overall_rating: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                  data-testid="overall-rating-slider"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-slate-700 font-medium">Punctuality</Label>
                  <span className="text-lg font-semibold text-slate-600">{ratingData.punctuality}/5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={ratingData.punctuality}
                  onChange={(e) => setRatingData({ ...ratingData, punctuality: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                  data-testid="punctuality-rating-slider"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-slate-700 font-medium">Knowledge</Label>
                  <span className="text-lg font-semibold text-slate-600">{ratingData.knowledge}/5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={ratingData.knowledge}
                  onChange={(e) => setRatingData({ ...ratingData, knowledge: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                  data-testid="knowledge-rating-slider"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-slate-700 font-medium">Helpfulness</Label>
                  <span className="text-lg font-semibold text-slate-600">{ratingData.helpfulness}/5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={ratingData.helpfulness}
                  onChange={(e) => setRatingData({ ...ratingData, helpfulness: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                  data-testid="helpfulness-rating-slider"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="feedback" className="text-slate-700 font-medium">Feedback</Label>
              <textarea
                id="feedback"
                value={ratingData.feedback}
                onChange={(e) => setRatingData({ ...ratingData, feedback: e.target.value })}
                className="mt-2 w-full bg-white/50 border-slate-200 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl p-3 min-h-[100px] resize-none"
                placeholder="Share your experience with this mentor..."
                data-testid="feedback-input"
              />
            </div>
            <button
              onClick={handleRateSession}
              className="w-full bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-full px-6 py-3 font-medium"
              data-testid="rating-submit-btn"
            >
              Submit Rating
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default P2P;