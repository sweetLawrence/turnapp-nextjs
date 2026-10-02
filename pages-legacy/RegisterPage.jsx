"use client"

import { useState } from 'react';
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authService } from '@/lib/services/authService';
import { User, Mail, Lock, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const RegisterPage = () => {
  const router = useRouter();
  const isAffiliateFlow = false;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validatePassword = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
    };
    return requirements;
  };

  const passwordRequirements = validatePassword(formData.password);
  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (formData.password !== formData.password_confirmation) {
      setErrors({ password_confirmation: ['Passwords do not match'] });
      setLoading(false);
      return;
    }

    try {
      const registerData = isAffiliateFlow
        ? { ...formData, user_type: 'Affiliate' }
        : formData;
      const result = await authService.register(registerData);

      if (result.success) {
        toast.success('Registration successful! Welcome to TurnApp.');
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Registration error:', err);

      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        const message = err.response?.data?.message || 'Registration failed. Please try again.';
        toast.error(message);
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
                {isAffiliateFlow ? 'Create Affiliate Account' : 'Create Account'}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {isAffiliateFlow
                  ? 'Sign up to start earning commissions'
                  : 'Start organizing amazing events today'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground ml-1">
                  Full Name
                </label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-9 sm:pl-10 bg-black/30 border-white/10 h-11 sm:h-12 text-white text-sm placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                    required
                  />
                </div>
                {errors.name && (
                  <p className="text-[10px] sm:text-xs text-destructive ml-1">{errors.name[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-9 sm:pl-10 bg-black/30 border-white/10 h-11 sm:h-12 text-white text-sm placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                    required
                  />
                </div>
                {errors.email && (
                  <p className="text-[10px] sm:text-xs text-destructive ml-1">{errors.email[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground ml-1">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
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
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                      <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[10px] sm:text-xs text-destructive ml-1">{errors.password[0]}</p>
                )}

                {formData.password && (
                  <div className="glass-light rounded-lg p-2.5 sm:p-3 mt-2 space-y-1 border border-white/5">
                    <p className="text-[10px] sm:text-xs font-medium text-white mb-1.5 sm:mb-2">Password must contain:</p>
                    <div className="space-y-0.5 sm:space-y-1">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <CheckCircle2
                          className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${passwordRequirements.length ? 'text-success' : 'text-muted-foreground'}`}
                        />
                        <span className={`text-[10px] sm:text-xs ${passwordRequirements.length ? 'text-success' : 'text-muted-foreground'}`}>
                          At least 8 characters
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <CheckCircle2
                          className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${passwordRequirements.uppercase ? 'text-success' : 'text-muted-foreground'}`}
                        />
                        <span className={`text-[10px] sm:text-xs ${passwordRequirements.uppercase ? 'text-success' : 'text-muted-foreground'}`}>
                          One uppercase letter
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <CheckCircle2
                          className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${passwordRequirements.lowercase ? 'text-success' : 'text-muted-foreground'}`}
                        />
                        <span className={`text-[10px] sm:text-xs ${passwordRequirements.lowercase ? 'text-success' : 'text-muted-foreground'}`}>
                          One lowercase letter
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <CheckCircle2
                          className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${passwordRequirements.number ? 'text-success' : 'text-muted-foreground'}`}
                        />
                        <span className={`text-[10px] sm:text-xs ${passwordRequirements.number ? 'text-success' : 'text-muted-foreground'}`}>
                          One number
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground ml-1">
                  Confirm Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password_confirmation"
                    name="password_confirmation"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    className="pl-9 sm:pl-10 pr-10 bg-black/30 border-white/10 h-11 sm:h-12 text-white text-sm placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                      <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </button>
                </div>
                {errors.password_confirmation && (
                  <p className="text-[10px] sm:text-xs text-destructive ml-1">{errors.password_confirmation[0]}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading || !isPasswordValid}
                className="w-full bg-gradient-red hover:opacity-90 text-white font-semibold h-11 sm:h-12 rounded-xl transition-all active:scale-[0.98] red-glow-strong smooth-transition mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-2" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <div className="relative my-6 sm:my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-[10px] sm:text-xs uppercase tracking-wider">
                <span className="bg-card px-3 text-muted-foreground">
                  Already have an account?
                </span>
              </div>
            </div>

            <Link href="/login">
              <Button
                variant="outline"
                className="w-full border-white/10 text-white hover:bg-white/5 hover:border-primary/50 h-11 sm:h-12 transition-all"
              >
                Sign In
              </Button>
            </Link>
          </div>

          <p className="text-center text-[10px] sm:text-xs text-muted-foreground mt-6 uppercase tracking-widest">
            <span className="brand-logo">TURN APP</span> &bull; Premium Event Management
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RegisterPage;