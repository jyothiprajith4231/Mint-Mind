import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/utils/api';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { ShoppingBag, Coins } from 'lucide-react';

const Store = () => {
  const [user, setUser] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, rewardsRes] = await Promise.all([
        api.get('/users/me'),
        api.get('/rewards')
      ]);
      setUser(userRes.data);
      setRewards(rewardsRes.data);
    } catch (error) {
      toast.error('Failed to load store');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (reward) => {
    if (user.coins < reward.coin_cost) {
      toast.error('Insufficient coins!', {
        description: `You need ${reward.coin_cost - user.coins} more coins`,
        duration: 4000
      });
      return;
    }

    // Navigate to checkout page with reward data
    navigate('/checkout', { state: { reward } });
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
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">Reward Store</h1>
          <p className="text-lg text-slate-600">Redeem your coins for real study accessories</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-heavy rounded-3xl p-6 mb-8 flex items-center justify-between"
          data-testid="store-balance-card"
        >
          <div>
            <h3 className="text-xl font-semibold text-slate-900 mb-1">Your Balance</h3>
            <div className="flex items-center gap-2">
              <Coins className="w-8 h-8 text-amber-500" />
              <span className="text-4xl font-bold text-amber-500">{user.coins}</span>
            </div>
          </div>
          <ShoppingBag className="w-16 h-16 text-violet-200" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rewards.map((reward, index) => {
            const canAfford = user.coins >= reward.coin_cost;
            return (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.01 }}
                className={`glass-heavy rounded-3xl overflow-hidden ${
                  !canAfford ? 'opacity-60' : ''
                }`}
                data-testid={`reward-card-${reward.id}`}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={reward.image} 
                    alt={reward.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-amber-500 text-white rounded-full px-3 py-1 text-sm font-semibold flex items-center gap-1">
                    <Coins className="w-4 h-4" />
                    <span>{reward.coin_cost}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{reward.name}</h3>
                  <p className="text-slate-600 mb-4 text-sm">{reward.description}</p>
                  <p className="text-xs text-slate-500 mb-4">Stock: {reward.stock}</p>
                  <button
                    onClick={() => handleRedeem(reward)}
                    disabled={!canAfford}
                    className="w-full bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-full px-6 py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid={`redeem-btn-${reward.id}`}
                  >
                    {canAfford ? 'Redeem Now' : 'Not Enough Coins'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Store;