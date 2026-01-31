import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Trophy, Users, Coins } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen ambient-bg relative overflow-hidden">
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1763615445655-5e1fc4c549d4?w=1920)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }} />
      
      <div className="relative z-10">
        <nav className="flex items-center justify-between px-6 md:px-12 py-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-slate-900"
          >
            M²
          </motion.div>
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/auth')}
            className="glass-heavy rounded-full px-6 py-2 text-slate-800 hover:bg-white/60 transition-all"
            data-testid="nav-signin-btn"
          >
            Sign In
          </motion.button>
        </nav>

        <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-6">
                Learn. Teach.
                <br />
                <span className="bg-gradient-to-r from-violet-600 to-violet-500 bg-clip-text text-transparent">
                  Earn Rewards.
                </span>
              </h1>
              <p className="text-lg leading-relaxed text-slate-600 mb-8 max-w-lg">
                M² transforms passive learning into active engagement. Watch courses, ace quizzes, teach peers, and earn coins for real study rewards.
              </p>
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/auth')}
                  className="bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-full px-8 py-3 font-medium shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all"
                  data-testid="hero-get-started-btn"
                >
                  Get Started
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="glass-heavy rounded-full px-8 py-3 font-medium text-slate-700 hover:bg-white/60 transition-all"
                  data-testid="hero-learn-more-btn"
                >
                  Learn More
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <img 
                src="https://images.unsplash.com/photo-1758270705518-b61b40527e76?w=800" 
                alt="Students collaborating"
                className="rounded-3xl shadow-2xl"
              />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-24"
          >
            {[
              { icon: Sparkles, title: 'AI-Powered', desc: 'Personalized learning paths' },
              { icon: Trophy, title: 'Gamified', desc: 'Earn coins & rewards' },
              { icon: Users, title: 'Peer Learning', desc: 'Teach and learn together' },
              { icon: Coins, title: 'Real Rewards', desc: 'Redeem study accessories' }
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5, scale: 1.01 }}
                className="glass-heavy rounded-3xl p-8 text-center"
                data-testid={`feature-card-${i}`}
              >
                <feature.icon className="w-12 h-12 mx-auto mb-4 text-violet-600" />
                <h3 className="text-2xl font-medium text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Landing;