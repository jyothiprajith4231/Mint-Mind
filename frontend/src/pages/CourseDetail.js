import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/utils/api';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { Play, CheckCircle, Lock, Coins } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [activeModule, setActiveModule] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [userRes, courseRes] = await Promise.all([
        api.get('/users/me'),
        api.get(`/courses/${id}`)
      ]);
      setUser(userRes.data);
      setCourse(courseRes.data);

      const enrollRes = await api.get('/enrollments');
      const existingEnroll = enrollRes.data.find(e => e.course_id === id);
      setEnrollment(existingEnroll);

      if (!existingEnroll) {
        await handleEnroll();
      }
    } catch (error) {
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {\n      const res = await api.post(`/courses/${id}/enroll`);\n      setEnrollment(res.data);\n      toast.success('Enrolled successfully!', {\n        description: 'Start learning to earn coins!',\n        duration: 4000,\n        icon: '📚'\n      });\n    } catch (error) {\n      toast.error('Enrollment failed');\n    }\n  };

  const handleModuleClick = (module) => {
    setActiveModule(module);
  };

  const handleQuizSubmit = async () => {
    const answers = Object.entries(quizAnswers).map(([index, answer]) => ({ answer }));
    
    try {
      const res = await api.post('/quizzes/submit', {
        module_id: activeModule.id,
        course_id: id,
        answers
      });

      if (res.data.passed) {
        toast.success(`Quiz passed! Earned ${res.data.coins_earned} coins!`, {
          description: `Score: ${Math.round(res.data.score)}%`,
          duration: 5000,
          icon: '🎉'
        });
        await fetchData();
        setShowQuiz(false);
        setQuizAnswers({});
      } else {
        toast.error(`Score: ${Math.round(res.data.score)}%. Need 70% to pass.`, {
          description: 'Review the material and try again!',
          duration: 5000
        });
      }
    } catch (error) {
      toast.error('Quiz submission failed');
    }
  };

  if (loading) return <div className="min-h-screen ambient-bg flex items-center justify-center"><div className="text-2xl text-slate-600">Loading...</div></div>;
  if (!course) return <div className="min-h-screen ambient-bg flex items-center justify-center"><div className="text-2xl text-slate-600">Course not found</div></div>;

  return (
    <div className="min-h-screen ambient-bg">
      <Navbar user={user} />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">{course.title}</h1>
          <p className="text-lg text-slate-600 mb-4">{course.description}</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 glass-heavy rounded-full px-4 py-2">
              <Coins className="w-5 h-5 text-amber-500" />
              <span className="font-semibold text-slate-900">{course.coin_reward} coins reward</span>
            </div>
            {enrollment && (
              <div className="glass-heavy rounded-full px-4 py-2">
                <span className="font-semibold text-slate-900">{Math.round(enrollment.progress)}% completed</span>
              </div>
            )}
          </div>
        </motion.div>

        {activeModule ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-heavy rounded-3xl overflow-hidden mb-8"
            data-testid="video-player-section"
          >
            <div className="bg-slate-900 aspect-video">
              <iframe
                src={activeModule.video_url}
                title={activeModule.title}
                className="w-full h-full"
                allowFullScreen
                data-testid="video-iframe"
              />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">{activeModule.title}</h2>
              <button
                onClick={() => setShowQuiz(true)}
                disabled={enrollment?.completed_modules.includes(activeModule.id)}
                className="bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-full px-6 py-3 font-medium disabled:opacity-50"
                data-testid="take-quiz-btn"
              >
                {enrollment?.completed_modules.includes(activeModule.id) ? 'Quiz Completed' : 'Take Quiz'}
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="glass-heavy rounded-3xl p-12 text-center mb-8">
            <Play className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-600">Select a module to start learning</p>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-2xl font-semibold text-slate-900">Course Modules</h3>
          {course.modules.map((module, index) => {
            const isCompleted = enrollment?.completed_modules.includes(module.id);
            const isLocked = index > 0 && !enrollment?.completed_modules.includes(course.modules[index - 1].id);

            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => !isLocked && handleModuleClick(module)}
                className={`glass-heavy rounded-2xl p-6 cursor-pointer hover:bg-white/80 transition-all ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                data-testid={`module-${module.id}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {isCompleted ? (
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    ) : isLocked ? (
                      <Lock className="w-8 h-8 text-slate-400" />
                    ) : (
                      <Play className="w-8 h-8 text-violet-600" />
                    )}
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900">{module.title}</h4>
                      <p className="text-sm text-slate-600">{module.questions.length} questions</p>
                    </div>
                  </div>
                  {isCompleted && (
                    <div className="flex items-center gap-1 text-amber-500 font-semibold">
                      <Coins className="w-5 h-5" />
                      <span>20</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <Dialog open={showQuiz} onOpenChange={setShowQuiz}>
        <DialogContent className="glass-heavy max-w-2xl" data-testid="quiz-dialog">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900">Module Quiz</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            {activeModule?.questions.map((q, index) => (
              <div key={index} className="space-y-3" data-testid={`quiz-question-${index}`}>
                <p className="font-semibold text-slate-900">{index + 1}. {q.question}</p>
                <RadioGroup
                  value={quizAnswers[index]}
                  onValueChange={(value) => setQuizAnswers({ ...quizAnswers, [index]: value })}
                >
                  {q.options.map((option, optIndex) => (
                    <div key={optIndex} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`q${index}-opt${optIndex}`} data-testid={`quiz-option-${index}-${optIndex}`} />
                      <Label htmlFor={`q${index}-opt${optIndex}`} className="text-slate-700 cursor-pointer">{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
            <button
              onClick={handleQuizSubmit}
              disabled={Object.keys(quizAnswers).length !== activeModule?.questions.length}
              className="w-full bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-full px-6 py-3 font-medium disabled:opacity-50"
              data-testid="quiz-submit-btn"
            >
              Submit Quiz
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseDetail;