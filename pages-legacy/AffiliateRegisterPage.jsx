"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar';
import { affiliateApi } from '@/lib/services/affiliateApi';
import { authService } from '@/lib/services/authService';
import {
  Users, Loader2, Clock, Building2,
  CreditCard, FileText, ArrowRight, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const AffiliateRegisterPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [affiliateStatus, setAffiliateStatus] = useState(null);
  const [formData, setFormData] = useState({
    business_name: '',
    bio: '',
    payment_method: '',
    payment_details: '',
  });

  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const response = await affiliateApi.getStatus();
      if (response.success) {
        setAffiliateStatus(response.data);
        if (response.data.status === 'active') {
          router.push('/affiliate/dashboard', { replace: true });
        }
      }
    } catch (error) {
      console.error('Error checking status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await affiliateApi.register(formData);
      if (response.success) {
        toast.success(response.message);
        router.push('/affiliate/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register');
    } finally {
      setSubmitting(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    // Already registered but not active
    if (affiliateStatus?.has_affiliate && affiliateStatus.status !== 'active') {
      return (
        <div className="w-full max-w-md animate-fadeIn">
          <div className="glass rounded-2xl p-8 shadow-2xl relative overflow-hidden border border-white/5">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
                <Clock className="h-8 w-8 text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">
                Application {affiliateStatus.status === 'pending' ? 'Pending' : 'Suspended'}
              </h2>
              <p className="text-zinc-400 text-sm mb-6">
                {affiliateStatus.status === 'pending'
                  ? "Your affiliate application is under review. You'll be notified once it's approved."
                  : 'Your affiliate account has been suspended. Please contact support for more information.'}
              </p>
              {affiliateStatus.referral_code && (
                <p className="text-xs text-zinc-500">
                  Your referral code: <span className="font-mono text-zinc-300">{affiliateStatus.referral_code}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full max-w-lg animate-fadeIn">
        <div className="glass rounded-2xl p-8 shadow-2xl relative overflow-hidden border border-white/5">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />

          {/* Hero */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Become an Affiliate</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Earn commissions by promoting events and get paid for every ticket sold.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { icon: CreditCard, title: 'Earn Commissions', desc: 'Per sale' },
              { icon: FileText, title: 'Track Performance', desc: 'Real-time' },
              { icon: Building2, title: 'Flexible Payouts', desc: 'Your method' },
            ].map((item, i) => (
              <div key={i} className="glass-light border border-white/5 rounded-xl p-3 text-center">
                <item.icon className="h-5 w-5 text-primary mx-auto mb-1.5" />
                <p className="text-[11px] font-bold text-white">{item.title}</p>
                <p className="text-[10px] text-zinc-500">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Form or Sign-in prompt */}
          {!isAuthenticated ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-zinc-400">Sign in to apply as an affiliate.</p>
              <div className="flex gap-3">
                <Button
                  onClick={() => router.push('/login', { state: { from: '/affiliate/register' } })}
                  className="flex-1 bg-gradient-red hover:opacity-90 text-white font-semibold h-11 rounded-xl"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => router.push('/register', { state: { from: '/affiliate/register' } })}
                  variant="outline"
                  className="flex-1 border-white/10 text-white hover:bg-white/5 hover:border-primary/50 h-11"
                >
                  Create Account
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground ml-1 mb-2 block">
                  Business Name (Optional)
                </label>
                <input
                  type="text"
                  name="business_name"
                  value={formData.business_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
                  placeholder="Your business or brand name"
                />
              </div>

              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground ml-1 mb-2 block">
                  Bio / About You
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 resize-none transition-all placeholder:text-muted-foreground"
                  placeholder="Tell us about yourself and how you plan to promote events..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground ml-1 mb-2 block">
                    Payment Method
                  </label>
                  <select
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 cursor-pointer transition-all"
                  >
                    <option value="">Select method</option>
                    <option value="mpesa">M-Pesa</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="paypal">PayPal</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground ml-1 mb-2 block">
                    Payment Details
                  </label>
                  <input
                    type="text"
                    name="payment_details"
                    value={formData.payment_details}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
                    placeholder="Phone / account / email"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-red hover:opacity-90 text-white font-semibold h-11 sm:h-12 rounded-xl transition-all active:scale-[0.98] red-glow-strong smooth-transition mt-2"
              >
                {submitting ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</>
                ) : (
                  <>Apply Now <ArrowRight className="h-4 w-4 ml-2" /></>
                )}
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-[10px] sm:text-xs text-muted-foreground mt-6 uppercase tracking-widest">
          <span className="brand-logo">TURN APP</span> &bull; Premium Event Management
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-red-900/10 blur-[150px] rounded-full animate-pulse-glow" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-red-900/10 blur-[150px] rounded-full animate-pulse-glow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] bg-primary/5 blur-[100px] rounded-full" />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 relative z-10 py-12 sm:py-20">
        <button
          onClick={() => router.push('/dashboard')}
          className="fixed top-20 left-4 sm:left-8 z-20 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200 text-sm font-medium backdrop-blur-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        {renderContent()}
      </div>
    </div>
  );
};

export default AffiliateRegisterPage;
