import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '@/utils/api';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Auth = ({ setToken }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      const response = await api.post(endpoint, formData);
      setToken(response.data.token);
      toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen ambient-bg flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-heavy rounded-3xl p-8 md:p-12 w-full max-w-md"
      >
        <h2 className="text-4xl font-bold text-slate-900 mb-2 text-center">
          {isLogin ? 'Welcome Back' : 'Join M²'}
        </h2>
        <p className="text-slate-600 text-center mb-8">
          {isLogin ? 'Continue your learning journey' : 'Start earning while you learn'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6" data-testid="auth-form">
          {!isLogin && (
            <div>
              <Label htmlFor="name" className="text-slate-700 font-medium">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-2 bg-white/50 border-slate-200 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl h-12"
                required={!isLogin}
                data-testid="auth-name-input"
              />
            </div>
          )}

          <div>
            <Label htmlFor="email" className="text-slate-700 font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-2 bg-white/50 border-slate-200 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl h-12"
              required
              data-testid="auth-email-input"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="mt-2 bg-white/50 border-slate-200 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl h-12"
              required
              data-testid="auth-password-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-full px-8 py-3 font-medium shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all disabled:opacity-50"
            data-testid="auth-submit-btn"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <p className="text-center mt-6 text-slate-600">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 text-violet-600 font-medium hover:text-violet-700"
            data-testid="auth-toggle-btn"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;