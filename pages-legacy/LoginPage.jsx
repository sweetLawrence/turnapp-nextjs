"use client"

import { useState } from 'react';
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authService } from '@/lib/services/authService';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const LoginPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const result = await authService.login(formData.email, formData.password);
      if (result.success) {
        toast.success('Welcome back!');
        const user = result.data.user;
        if (user.user_type === 'Affiliate') {
          router.push('/affiliate/dashboard');
        } else if (user.user_type === 'Organiser' || user.user_type === 'Admin') {
          router.push('/dashboard');
        } else {
          router.push('/');
        }
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        toast.error(err.response?.data?.message || 'Login failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-red-900/10 blur-[150px] rounded-full animate-pulse-glow" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-red-900/10 blur-[150px] rounded-full animate-pulse-glow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] bg-primary/5 blur-[100px] rounded-full" />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 relative z-10 py-12 sm:py-20">
        <div className="w-full max-w-[440px] animate-fadeIn">

          <div className="glass rounded-2xl p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden border border-white/5">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />

            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Welcome Back
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Sign in to manage your events
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-9 sm:pl-10 bg-black/30 border-white/10 h-11 sm:h-12 text-white text-sm placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                    required
                  />
                </div>
                {errors.email && <p className="text-[10px] sm:text-xs text-destructive ml-1">{errors.email[0]}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Password
                  </label>
                  <a
                    href="https://test.turnapp.events/forgot-password"
                    className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Forgot?
                  </a>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-9 sm:pl-10 pr-10 bg-black/30 border-white/10 h-11 sm:h-12 text-white text-sm placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-[10px] sm:text-xs text-destructive ml-1">{errors.password[0]}</p>}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-red hover:opacity-90 text-white font-semibold h-11 sm:h-12 rounded-xl transition-all active:scale-[0.98] red-glow-strong smooth-transition mt-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="relative my-6 sm:my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-[10px] sm:text-xs uppercase tracking-wider">
                <span className="bg-card px-3 text-muted-foreground">
                  New here?
                </span>
              </div>
            </div>

            <Link href="/register">
              <Button
                variant="outline"
                className="w-full border-white/10 text-white hover:bg-white/5 hover:border-primary/50 h-11 sm:h-12 transition-all"
              >
                Create an Account
              </Button>
            </Link>
          </div>

          <p className="text-center text-[10px] sm:text-xs text-muted-foreground mt-6 uppercase tracking-widest">
            <span className="brand-logo">TURN APP</span> &bull; Premium Event Management
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;