import { LogOut, User, Coins, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

const Navbar = ({ user }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Courses', path: '/courses' },
    { label: 'P2P Learning', path: '/p2p' },
    { label: 'Leaderboard', path: '/leaderboard' },
    { label: 'Store', path: '/store' },
    { label: 'Settings', path: '/settings/notifications' }
  ];

  return (
    <nav className="glass-light border-b border-white/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-4">
        <div className="flex items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-2xl font-bold text-slate-900 cursor-pointer"
            onClick={() => navigate('/dashboard')}
            data-testid="navbar-logo"
          >
            M²
          </motion.div>

          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="text-slate-700 hover:text-violet-600 font-medium transition-colors"
                data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 glass-heavy rounded-full px-4 py-2" data-testid="navbar-coins">
              <Coins className="w-4 h-4 text-amber-500" />
              <span className="font-semibold text-slate-900">{user?.coins || 0}</span>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="glass-heavy rounded-full p-2 hover:bg-white/60 transition-all"
              data-testid="navbar-profile-btn"
            >
              <User className="w-5 h-5 text-slate-700" />
            </button>
            <button
              onClick={handleLogout}
              className="glass-heavy rounded-full p-2 hover:bg-white/60 transition-all"
              data-testid="navbar-logout-btn"
            >
              <LogOut className="w-5 h-5 text-slate-700" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;