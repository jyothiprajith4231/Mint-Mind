import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '@/utils/api';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { Package, MapPin, Phone, User, Mail, CheckCircle, Coins } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const OrderCheckout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const reward = location.state?.reward;
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  
  const [shippingInfo, setShippingInfo] = useState({
    full_name: '',
    email: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    notes: ''
  });

  useEffect(() => {
    if (!reward) {
      navigate('/store');
      return;
    }
    fetchUser();
  }, [reward, navigate]);

  const fetchUser = async () => {
    try {
      const res = await api.get('/users/me');
      setUser(res.data);
      setShippingInfo(prev => ({
        ...prev,
        full_name: res.data.name,
        email: res.data.email
      }));
    } catch (error) {
      toast.error('Failed to load user data');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/orders/create', {
        reward_id: reward.id,
        reward_name: reward.name,
        coin_cost: reward.coin_cost,
        shipping_info: shippingInfo
      });

      setOrderId(response.data.order_id);
      setOrderComplete(true);
      
      toast.success('Order placed successfully!', {
        description: 'Your reward will be shipped soon',
        duration: 5000,
        icon: '🎉'
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  if (!user || !reward) {
    return (
      <div className="min-h-screen ambient-bg flex items-center justify-center">
        <div className="text-2xl text-slate-600 dark:text-slate-400">Loading...</div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen ambient-bg">
        <Navbar user={user} />
        <div className="max-w-3xl mx-auto px-6 md:px-12 py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-heavy rounded-3xl p-12 text-center"
            data-testid="order-success"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400" />
            </motion.div>
            
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-4">
              Order Confirmed!
            </h1>
            
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-2">
              Your order has been placed successfully
            </p>
            
            <div className="bg-violet-50 dark:bg-violet-900/20 rounded-2xl p-6 my-8">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Order ID</p>
              <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">{orderId}</p>
            </div>

            <div className="glass-light rounded-2xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <img 
                  src={reward.image} 
                  alt={reward.name}
                  className="w-20 h-20 rounded-xl object-cover"
                />
                <div className="text-left flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-50">{reward.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{reward.description}</p>
                </div>
              </div>
            </div>

            <div className="text-left glass-light rounded-2xl p-6 mb-8">
              <h4 className="font-semibold text-slate-900 dark:text-slate-50 mb-4">Shipping To:</h4>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                {shippingInfo.full_name}<br />
                {shippingInfo.address_line1}<br />
                {shippingInfo.address_line2 && <>{shippingInfo.address_line2}<br /></>}
                {shippingInfo.city}, {shippingInfo.state} - {shippingInfo.postal_code}<br />
                {shippingInfo.country}<br />
                <span className="text-slate-600 dark:text-slate-400">Phone: {shippingInfo.phone}</span>
              </p>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
              You'll receive a confirmation email at <span className="font-medium">{shippingInfo.email}</span> with tracking details.
            </p>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/store')}
                className="glass-heavy rounded-full px-6 py-3 font-medium text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60 transition-all"
                data-testid="back-to-store-btn"
              >
                Back to Store
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-full px-6 py-3 font-medium"
                data-testid="go-to-dashboard-btn"
              >
                Go to Dashboard
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ambient-bg">
      <Navbar user={user} />
      
      <div className="max-w-5xl mx-auto px-6 md:px-12 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-50 mb-2">Checkout</h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">Complete your order details</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-heavy rounded-3xl p-6"
            data-testid="order-summary"
          >
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-6 flex items-center gap-2">
              <Package className="w-6 h-6 text-violet-600" />
              Order Summary
            </h3>
            
            <div className="mb-6">
              <img 
                src={reward.image} 
                alt={reward.name}
                className="w-full h-48 object-cover rounded-2xl mb-4"
              />
              <h4 className="font-semibold text-slate-900 dark:text-slate-50 mb-2">{reward.name}</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{reward.description}</p>
            </div>

            <div className="border-t border-white/30 dark:border-slate-600/30 pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-700 dark:text-slate-300">Cost:</span>
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-500" />
                  <span className="font-bold text-amber-500 text-xl">{reward.coin_cost}</span>
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
                <p className="text-sm text-green-700 dark:text-green-400 font-medium">FREE Shipping</p>
              </div>
            </div>
          </motion.div>

          {/* Shipping Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2 glass-heavy rounded-3xl p-8"
          >
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-6 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-violet-600" />
              Shipping Information
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6" data-testid="checkout-form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="full_name" className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </Label>
                  <Input
                    id="full_name"
                    value={shippingInfo.full_name}
                    onChange={(e) => handleChange('full_name', e.target.value)}
                    className="mt-2 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-600 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl h-12"
                    required
                    data-testid="input-full-name"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={shippingInfo.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="mt-2 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-600 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl h-12"
                    required
                    data-testid="input-email"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone" className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={shippingInfo.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="mt-2 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-600 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl h-12"
                  placeholder="+91 1234567890"
                  required
                  data-testid="input-phone"
                />
              </div>

              <div>
                <Label htmlFor="address_line1" className="text-slate-700 dark:text-slate-300 font-medium">
                  Address Line 1
                </Label>
                <Input
                  id="address_line1"
                  value={shippingInfo.address_line1}
                  onChange={(e) => handleChange('address_line1', e.target.value)}
                  className="mt-2 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-600 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl h-12"
                  placeholder="Street address, building, apartment"
                  required
                  data-testid="input-address1"
                />
              </div>

              <div>
                <Label htmlFor="address_line2" className="text-slate-700 dark:text-slate-300 font-medium">
                  Address Line 2 (Optional)
                </Label>
                <Input
                  id="address_line2"
                  value={shippingInfo.address_line2}
                  onChange={(e) => handleChange('address_line2', e.target.value)}
                  className="mt-2 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-600 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl h-12"
                  placeholder="Landmark, area"
                  data-testid="input-address2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="city" className="text-slate-700 dark:text-slate-300 font-medium">
                    City
                  </Label>
                  <Input
                    id="city"
                    value={shippingInfo.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="mt-2 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-600 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl h-12"
                    required
                    data-testid="input-city"
                  />
                </div>

                <div>
                  <Label htmlFor="state" className="text-slate-700 dark:text-slate-300 font-medium">
                    State
                  </Label>
                  <Input
                    id="state"
                    value={shippingInfo.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    className="mt-2 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-600 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl h-12"
                    required
                    data-testid="input-state"
                  />
                </div>

                <div>
                  <Label htmlFor="postal_code" className="text-slate-700 dark:text-slate-300 font-medium">
                    Postal Code
                  </Label>
                  <Input
                    id="postal_code"
                    value={shippingInfo.postal_code}
                    onChange={(e) => handleChange('postal_code', e.target.value)}
                    className="mt-2 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-600 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl h-12"
                    required
                    data-testid="input-postal"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes" className="text-slate-700 dark:text-slate-300 font-medium">
                  Delivery Notes (Optional)
                </Label>
                <textarea
                  id="notes"
                  value={shippingInfo.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className="mt-2 w-full bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-600 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl p-3 min-h-[80px] resize-none"
                  placeholder="Any special delivery instructions..."
                  data-testid="input-notes"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/store')}
                  className="flex-1 glass-heavy rounded-full px-6 py-3 font-medium text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60 transition-all"
                  data-testid="cancel-order-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-full px-6 py-3 font-medium disabled:opacity-50"
                  data-testid="place-order-btn"
                >
                  {loading ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OrderCheckout;