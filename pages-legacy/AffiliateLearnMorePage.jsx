"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import {
  Users, DollarSign, BarChart3, CreditCard, ArrowRight,
  TrendingUp, CheckCircle2, Zap,
  Star, Sparkles, Megaphone, Settings, UserCheck, PieChart,
  ArrowLeftRight, ClipboardList, Link2, Wallet, ArrowDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const AffiliateLearnMorePage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('organizer');

  const organizerSteps = [
    {
      step: '01',
      icon: Megaphone,
      title: 'Create a Campaign',
      desc: 'From your organizer dashboard, go to Affiliates and create a new campaign for your event. Set the event, commission type, and rate.',
    },
    {
      step: '02',
      icon: Settings,
      title: 'Set Commission Rules',
      desc: 'Choose between percentage or fixed-rate commissions. Set the duration, and customize terms for your affiliates.',
    },
    {
      step: '03',
      icon: UserCheck,
      title: 'Approve Affiliates',
      desc: 'Review affiliate applications and approve the ones that fit your event. Each approved affiliate gets a unique referral link.',
    },
    {
      step: '04',
      icon: PieChart,
      title: 'Track & Pay',
      desc: 'Monitor affiliate performance in real time — clicks, conversions, and revenue. Pay commissions directly from your dashboard.',
    },
  ];

  const affiliateSteps = [
    {
      step: '01',
      icon: ArrowLeftRight,
      title: 'Switch to Affiliate Mode',
      desc: 'Already an organizer? Use "Switch to Affiliate" in your dashboard sidebar. New users can register as an affiliate in under a minute.',
    },
    {
      step: '02',
      icon: ClipboardList,
      title: 'Browse & Join Campaigns',
      desc: 'Explore active campaigns from event organizers. Find events that match your audience and request to join.',
    },
    {
      step: '03',
      icon: Link2,
      title: 'Share Your Referral Link',
      desc: 'Once approved, get a unique referral link for each campaign. Share it on social media, WhatsApp, email — anywhere.',
    },
    {
      step: '04',
      icon: Wallet,
      title: 'Earn & Withdraw',
      desc: 'Every ticket sold through your link earns you a commission. Track earnings in real time and withdraw via M-Pesa, bank, or PayPal.',
    },
  ];

  const benefits = [
    { icon: DollarSign, title: 'Competitive Commissions', desc: 'Earn percentage or fixed-rate commissions on every sale you drive.' },
    { icon: BarChart3, title: 'Real-Time Analytics', desc: 'Track clicks, conversions, and earnings with a live dashboard.' },
    { icon: CreditCard, title: 'Flexible Payouts', desc: 'Get paid via M-Pesa, bank transfer, or PayPal. You choose.' },
    { icon: TrendingUp, title: 'Multiple Campaigns', desc: 'Join as many campaigns as you want. More campaigns, more earnings.' },
    { icon: Zap, title: 'Instant Referral Links', desc: 'Get your unique link immediately after approval. Start sharing right away.' },
    { icon: CheckCircle2, title: 'No Upfront Cost', desc: 'Completely free to join. You only need your network and your drive.' },
  ];

  const stats = [
    { value: '10K+', label: 'Affiliates' },
    { value: '25%', label: 'Avg. Commission' },
    { value: '48hr', label: 'Payout Speed' },
    { value: '500+', label: 'Campaigns' },
  ];

  return (
    <div className="min-h-screen bg-background relative">
      <Navbar />

      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-red-900/10 blur-[150px] rounded-full animate-pulse-glow" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-red-900/10 blur-[150px] rounded-full animate-pulse-glow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] bg-primary/5 blur-[100px] rounded-full" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-28 sm:pt-36 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs font-bold uppercase tracking-wider mb-8 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Affiliate Program
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-[1.1] mb-6">
            Earn Money Promoting<br />
            <span className="bg-gradient-to-r from-red-400 via-primary to-red-600 bg-clip-text text-transparent">Events You Love</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto mb-10 leading-relaxed">
            Join the TurnApp affiliate program and earn commissions for every ticket sold through your referral links.
            No inventory, no risk — just share and earn.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button
              onClick={() => router.push('/affiliate/register')}
              className="bg-gradient-red hover:opacity-90 text-white font-semibold h-13 px-10 rounded-xl red-glow-strong smooth-transition hover:scale-105 text-base"
            >
              Get Started <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="border-white/10 text-zinc-300 hover:bg-white/5 hover:text-white h-13 px-8 rounded-xl text-base"
            >
              Learn How It Works
            </Button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map((stat, i) => (
              <div key={i} className="glass border border-white/5 rounded-xl px-4 py-5 text-center hover:border-primary/20 transition-all duration-300">
                <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent mb-1">{stat.value}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-zinc-400 text-xs font-medium uppercase tracking-wider mb-4">
              Simple Process
            </div>
            <h2 className="text-xl md:text-3xl font-bold text-foreground mb-3">How It Works</h2>
            <p className="text-muted-foreground text-sm md:text-base">See how organizers and affiliates work together</p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center justify-center mb-10">
            <div className="inline-flex items-center bg-white/5 border border-white/10 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('organizer')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeTab === 'organizer'
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Megaphone className="h-4 w-4" />
                For Organizers
              </button>
              <button
                onClick={() => setActiveTab('affiliate')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeTab === 'affiliate'
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Users className="h-4 w-4" />
                For Affiliates
              </button>
            </div>
          </div>

          {/* Tab Description */}
          <div className="text-center mb-10">
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              {activeTab === 'organizer'
                ? 'Set up affiliate campaigns for your events and let others help you sell more tickets.'
                : 'Join campaigns, share your referral links, and earn commissions on every ticket sold.'}
            </p>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connecting line for desktop */}
            <div className="hidden lg:block absolute top-16 left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

            {(activeTab === 'organizer' ? organizerSteps : affiliateSteps).map((item, i) => (
              <div key={`${activeTab}-${i}`} className="relative group animate-fadeIn">
                <div className="glass border border-white/5 rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 h-full group-hover:bg-white/[0.03] group-hover:-translate-y-1">
                  <div className="text-[56px] font-black text-white/[0.04] absolute top-2 right-4 leading-none select-none group-hover:text-primary/[0.06] transition-colors duration-300">{item.step}</div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 group-hover:bg-primary/15 group-hover:border-primary/30 group-hover:scale-110 transition-all duration-300">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden lg:flex absolute top-16 -right-3 transform -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-zinc-900 border border-white/10 items-center justify-center">
                    <ArrowRight className="h-3 w-3 text-primary/60" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Flow connector between tabs */}
          {activeTab === 'organizer' && (
            <div className="flex flex-col items-center mt-10 animate-fadeIn">
              <ArrowDown className="h-5 w-5 text-primary/40 animate-bounce" />
              <p className="text-xs text-muted-foreground mt-2">
                Once your campaign is live, affiliates can join and start promoting
              </p>
              <button
                onClick={() => setActiveTab('affiliate')}
                className="mt-3 text-primary text-xs font-medium hover:underline flex items-center gap-1"
              >
                See the affiliate side <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          )}
          {activeTab === 'affiliate' && (
            <div className="flex flex-col items-center mt-10 animate-fadeIn">
              <p className="text-xs text-muted-foreground">
                Organizers create campaigns that you can browse and join
              </p>
              <button
                onClick={() => setActiveTab('organizer')}
                className="mt-3 text-primary text-xs font-medium hover:underline flex items-center gap-1"
              >
                See the organizer side <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Benefits */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-zinc-400 text-xs font-medium uppercase tracking-wider mb-4">
              <Star className="h-3 w-3" />
              Benefits
            </div>
            <h2 className="text-xl md:text-3xl font-bold text-foreground mb-3">Why Join?</h2>
            <p className="text-muted-foreground text-sm md:text-base">Everything you need to succeed as an affiliate</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map((item, i) => (
              <div key={i} className="group glass border border-white/5 rounded-2xl p-7 hover:border-primary/30 transition-all duration-300 hover:bg-white/[0.03] hover:-translate-y-1 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 group-hover:bg-primary/15 group-hover:border-primary/30 group-hover:scale-110 transition-all duration-300">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="glass border border-primary/20 rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[80px] rounded-full" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/10 blur-[80px] rounded-full" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs font-bold uppercase tracking-wider mb-6">
                <Sparkles className="h-3.5 w-3.5" />
                Free to Join
              </div>
              <h2 className="text-xl md:text-3xl font-bold text-foreground mb-4">Ready to Start Earning?</h2>
              <p className="text-muted-foreground text-sm sm:text-base mb-10 max-w-lg mx-auto leading-relaxed">
                Create your free affiliate account today and start promoting events to earn commissions.
              </p>
              <Button
                onClick={() => router.push('/affiliate/register')}
                className="bg-gradient-red hover:opacity-90 text-white font-semibold h-13 px-12 rounded-xl red-glow-strong smooth-transition hover:scale-105 text-base"
              >
                Get Started <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AffiliateLearnMorePage;
