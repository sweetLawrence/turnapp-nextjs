"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/DashboardLayout';
import { affiliateApi } from '@/lib/services/affiliateApi';
import { authService } from '@/lib/services/authService';
import {
  DollarSign, TrendingUp, MousePointerClick, Target,
  Loader2, RefreshCw, Copy, ArrowRight,
  Wallet, Clock, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const AffiliateDashboardPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login', { state: { from: '/affiliate/dashboard' } });
      return;
    }
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const response = await affiliateApi.getDashboard();
      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        router.push('/affiliate/register');
        return;
      }
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (data?.affiliate?.referral_code) {
      navigator.clipboard.writeText(data.affiliate.referral_code);
      toast.success('Referral code copied!');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        </div>
      </DashboardLayout>
    );
  }

  if (!data) return null;

  const StatCard = ({ icon: Icon, label, value, color, subtitle }) => (
    <div className="bg-zinc-900/50 backdrop-blur-sm border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2.5 rounded-lg bg-zinc-900 border border-white/5 ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">{label}</p>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {subtitle && <p className="text-xs text-zinc-500 mt-1">{subtitle}</p>}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto pb-20 space-y-8 animate-in fade-in duration-500">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Affiliate Dashboard</h1>
            <p className="text-zinc-400 text-sm">
              Welcome back{data.affiliate.business_name ? `, ${data.affiliate.business_name}` : ''}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl cursor-pointer hover:border-zinc-600 transition-colors"
              onClick={copyCode}
            >
              <span className="text-xs text-zinc-500">Referral Code:</span>
              <span className="font-mono font-bold text-white text-sm">{data.affiliate.referral_code}</span>
              <Copy className="h-3.5 w-3.5 text-zinc-500" />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={loadDashboard}
              className="text-zinc-400 hover:text-white"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="h-5 w-5 text-primary" />
              <span className="text-xs text-primary/70 uppercase tracking-wider font-bold">Available Balance</span>
            </div>
            <p className="text-3xl font-bold text-white">KES {parseFloat(data.balances.available_balance || 0).toLocaleString()}</p>
            <Button
              size="sm"
              onClick={() => router.push('/affiliate/withdrawals')}
              className="mt-4 bg-white/10 hover:bg-white/20 text-white text-xs"
            >
              Withdraw <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>

          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-5 w-5 text-amber-400" />
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Pending</span>
            </div>
            <p className="text-3xl font-bold text-white">KES {parseFloat(data.balances.pending_balance || 0).toLocaleString()}</p>
            <p className="text-xs text-zinc-500 mt-2">Awaiting confirmation</p>
          </div>

          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-5 w-5 text-emerald-400" />
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Total Earned</span>
            </div>
            <p className="text-3xl font-bold text-white">KES {parseFloat(data.balances.total_earnings || 0).toLocaleString()}</p>
            <p className="text-xs text-zinc-500 mt-2">Lifetime earnings</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={MousePointerClick} label="Total Clicks" value={data.stats.total_clicks} color="text-blue-400" />
          <StatCard icon={TrendingUp} label="Conversions" value={data.stats.total_conversions} color="text-purple-400" />
          <StatCard icon={Target} label="Conversion Rate" value={`${data.stats.conversion_rate}%`} color="text-emerald-400" />
          <StatCard icon={Users} label="Active Campaigns" value={data.stats.enrolled_campaigns} color="text-primary" />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/affiliate/campaigns')}
            className="bg-zinc-900/50 border border-white/5 rounded-xl p-5 text-left hover:border-primary/30 hover:bg-primary/5 transition-all group"
          >
            <Target className="h-5 w-5 text-primary mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">Browse Campaigns</h3>
            <p className="text-xs text-zinc-500">Find and join new campaigns</p>
          </button>
          <button
            onClick={() => router.push('/affiliate/earnings')}
            className="bg-zinc-900/50 border border-white/5 rounded-xl p-5 text-left hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group"
          >
            <DollarSign className="h-5 w-5 text-emerald-400 mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">View Earnings</h3>
            <p className="text-xs text-zinc-500">Track your commissions</p>
          </button>
          <button
            onClick={() => router.push('/affiliate/withdrawals')}
            className="bg-zinc-900/50 border border-white/5 rounded-xl p-5 text-left hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group"
          >
            <Wallet className="h-5 w-5 text-blue-400 mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">Withdrawals</h3>
            <p className="text-xs text-zinc-500">Request payouts</p>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Conversions */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Conversions</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/affiliate/earnings')}
                className="text-xs text-zinc-400 hover:text-white"
              >
                View All <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>

            {data.recent_conversions.length === 0 ? (
              <p className="text-zinc-600 text-sm text-center py-8">No conversions yet</p>
            ) : (
              <div className="space-y-3">
                {data.recent_conversions.map((conversion) => (
                  <div key={conversion.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-sm text-white font-medium">{conversion.event || 'Unknown Event'}</p>
                      <p className="text-xs text-zinc-500">{conversion.campaign}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-400">+KES {parseFloat(conversion.commission_amount).toLocaleString()}</p>
                      <span className={`text-[10px] uppercase tracking-wider font-bold ${
                        conversion.status === 'confirmed' ? 'text-emerald-400' :
                        conversion.status === 'pending' ? 'text-amber-400' :
                        conversion.status === 'paid' ? 'text-blue-400' : 'text-zinc-500'
                      }`}>
                        {conversion.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Campaigns */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Top Campaigns</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/affiliate/my-campaigns')}
                className="text-xs text-zinc-400 hover:text-white"
              >
                View All <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>

            {data.top_campaigns.length === 0 ? (
              <p className="text-zinc-600 text-sm text-center py-8">No campaign data yet</p>
            ) : (
              <div className="space-y-3">
                {data.top_campaigns.map((campaign, idx) => (
                  <div key={idx} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-zinc-600 w-5">#{idx + 1}</span>
                      <div>
                        <p className="text-sm text-white font-medium">{campaign.campaign_name || 'Campaign'}</p>
                        <p className="text-xs text-zinc-500">{campaign.conversions} conversions</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-white">KES {parseFloat(campaign.total_commission || 0).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AffiliateDashboardPage;
