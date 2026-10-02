"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { DashboardLayout } from '@/components/DashboardLayout';
import { campaignApi } from '@/lib/services/campaignApi';
import { 
  ArrowLeft, Loader2, TrendingUp, DollarSign, Users,
  Target, BarChart3, Award, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const CampaignAnalyticsPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [id]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const response = await campaignApi.getAnalytics(id);
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!analytics) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-zinc-400">Analytics not available</p>
        </div>
      </DashboardLayout>
    );
  }

  const topPerformer = analytics.influencer_performance.length > 0
    ? analytics.influencer_performance.reduce((prev, current) => 
        (current.total_conversions > prev.total_conversions) ? current : prev
      )
    : null;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto pb-20 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/affiliate')}
            className="text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">{analytics.campaign.name}</h1>
            <p className="text-zinc-400 mt-1">Campaign Performance Analytics</p>
          </div>
        </div>

        {/* Campaign Info */}
        <div className="bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-red-600 flex items-center justify-center">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white mb-1">Campaign Code</h2>
              <p className="text-2xl font-mono font-bold text-primary">{analytics.campaign.code}</p>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm uppercase font-bold tracking-wider border ${
              analytics.campaign.status === 'active' 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : analytics.campaign.status === 'paused'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
            }`}>
              {analytics.campaign.status}
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <Users className="h-6 w-6 text-blue-400" />
              <TrendingUp className="h-4 w-4 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{analytics.overview.total_influencers}</p>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Total Affiliates</p>
          </div>
          
          <div className="bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <BarChart3 className="h-6 w-6 text-purple-400" />
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{analytics.overview.total_conversions}</p>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Total Conversions</p>
          </div>
          
          <div className="bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <DollarSign className="h-6 w-6 text-emerald-400" />
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              {parseFloat(analytics.overview.total_earnings || 0).toLocaleString()}
            </p>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Total Earnings (KES)</p>
          </div>
          
          <div className="bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <Zap className="h-6 w-6 text-orange-400" />
              <TrendingUp className="h-4 w-4 text-orange-400" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{analytics.overview.used_count}</p>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Code Uses</p>
          </div>
        </div>

        {/* Top Performer */}
        {topPerformer && (
          <div className="bg-gradient-to-br from-primary/10 to-red-600/10 backdrop-blur-sm border border-primary/20 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-red-600 flex items-center justify-center">
                <Award className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-zinc-400 uppercase tracking-wider mb-1">Top Performer</p>
                <h3 className="text-2xl font-bold text-white mb-1">{topPerformer.name}</h3>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-zinc-300">
                    {topPerformer.total_conversions} Conversions
                  </span>
                  <span className="text-zinc-300">•</span>
                  <span className="text-emerald-400 font-medium">
                    KES {parseFloat(topPerformer.total_earnings || 0).toLocaleString()} Earned
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Affiliate Performance */}
        <div className="bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Affiliate Performance</h2>
          
          {analytics.influencer_performance.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400">No affiliates enrolled yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {analytics.influencer_performance
                .sort((a, b) => b.total_conversions - a.total_conversions)
                .map((influencer, index) => (
                  <div 
                    key={influencer.id}
                    className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-lg hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 text-white font-bold">
                      #{index + 1}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{influencer.name}</h3>
                      <p className="text-xs text-zinc-500">{influencer.email}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-zinc-400">Commission</p>
                      <p className="text-white font-medium">
                        {influencer.commission_type === 'percentage' ? (
                          <>{influencer.commission_value}%</>
                        ) : (
                          <>KES {parseFloat(influencer.commission_value).toLocaleString()}</>
                        )}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-zinc-400">Conversions</p>
                      <p className="text-2xl font-bold text-purple-400">{influencer.total_conversions}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-zinc-400">Earnings</p>
                      <p className="text-2xl font-bold text-emerald-400">
                        {parseFloat(influencer.total_earnings || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Performance Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Conversion Rate</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Total Uses</span>
                <span className="text-white font-medium">{analytics.overview.used_count}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Conversions</span>
                <span className="text-white font-medium">{analytics.overview.total_conversions}</span>
              </div>
              <div className="pt-3 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Conversion Rate</span>
                  <span className="text-2xl font-bold text-primary">
                    {analytics.overview.used_count > 0 
                      ? ((analytics.overview.total_conversions / analytics.overview.used_count) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Average Performance</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Avg Conversions per Affiliate</span>
                <span className="text-white font-medium">
                  {analytics.overview.total_influencers > 0
                    ? (analytics.overview.total_conversions / analytics.overview.total_influencers).toFixed(1)
                    : 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Avg Earnings per Affiliate</span>
                <span className="text-white font-medium">
                  KES {analytics.overview.total_influencers > 0
                    ? (analytics.overview.total_earnings / analytics.overview.total_influencers).toFixed(2)
                    : 0}
                </span>
              </div>
              <div className="pt-3 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Avg Earning per Conversion</span>
                  <span className="text-2xl font-bold text-emerald-400">
                    {analytics.overview.total_conversions > 0
                      ? (analytics.overview.total_earnings / analytics.overview.total_conversions).toFixed(2)
                      : 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CampaignAnalyticsPage;
