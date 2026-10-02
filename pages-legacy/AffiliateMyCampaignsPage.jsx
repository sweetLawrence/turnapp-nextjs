"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/DashboardLayout';
import { affiliateApi } from '@/lib/services/affiliateApi';
import { authService } from '@/lib/services/authService';
import {
  Loader2, Target, ArrowLeft, Copy,
  MousePointerClick, TrendingUp, DollarSign, Clock,
  CheckCircle2, XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const AffiliateMyCampaignsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login', { state: { from: '/affiliate/my-campaigns' } });
      return;
    }
    loadMyCampaigns();
  }, []);

  const loadMyCampaigns = async () => {
    setLoading(true);
    try {
      const response = await affiliateApi.getMyCampaigns();
      if (response.success) {
        setCampaigns(response.data);
      }
    } catch (error) {
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleGetReferralLink = async (campaignId) => {
    try {
      const response = await affiliateApi.getReferralLink(campaignId);
      if (response.success) {
        navigator.clipboard.writeText(response.data.referral_link);
        toast.success('Referral link copied!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to get referral link');
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      'pending': { color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: Clock, label: 'Pending' },
      'approved': { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2, label: 'Active' },
      'rejected': { color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: XCircle, label: 'Rejected' },
      'suspended': { color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20', icon: XCircle, label: 'Suspended' },
    };
    const c = config[status] || config['pending'];
    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${c.color}`}>
        <c.icon className="h-3 w-3" />
        {c.label}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto pb-20 space-y-8 animate-in fade-in duration-500">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/affiliate/dashboard')}
              className="text-zinc-400 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">My Campaigns</h1>
              <p className="text-zinc-400 text-sm">Campaigns you've enrolled in and their performance</p>
            </div>
          </div>
          <Button
            onClick={() => router.push('/affiliate/campaigns')}
            variant="outline"
            className="border-zinc-700 text-zinc-300 hover:text-white"
          >
            <Target className="h-4 w-4 mr-2" />
            Browse More
          </Button>
        </div>

        {/* Campaigns */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl">
            <Target className="h-10 w-10 text-zinc-600 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No campaigns yet</h3>
            <p className="text-zinc-500 text-sm mb-4">Browse available campaigns and start earning</p>
            <Button
              onClick={() => router.push('/affiliate/campaigns')}
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:text-white"
            >
              Browse Campaigns
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((item) => (
              <div
                key={item.enrollment_id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center p-5 gap-6">

                  {/* Campaign Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-white truncate">{item.campaign.name}</h3>
                      {getStatusBadge(item.status)}
                    </div>
                    {item.campaign.event && (
                      <p className="text-xs text-zinc-500 flex items-center gap-1.5 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {item.campaign.event.title}
                        {item.campaign.event.venue && <> &middot; {item.campaign.event.venue}</>}
                      </p>
                    )}
                    <p className="text-xs text-zinc-600">
                      Commission: <span className="text-zinc-300 font-medium">
                        {item.campaign.commission_type === 'percentage'
                          ? `${item.campaign.commission_value}%`
                          : `KES ${parseFloat(item.campaign.commission_value).toLocaleString()}`}
                      </span>
                    </p>
                    {item.rejection_reason && (
                      <p className="text-xs text-red-400 mt-2">Reason: {item.rejection_reason}</p>
                    )}
                  </div>

                  {/* Stats */}
                  {item.status === 'approved' && (
                    <div className="flex items-center gap-6 md:border-l border-white/5 md:pl-6">
                      <div className="text-center">
                        <div className="flex items-center gap-1.5 justify-center">
                          <MousePointerClick className="h-4 w-4 text-blue-400" />
                          <span className="text-lg font-bold text-white">{item.stats.clicks}</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Clicks</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1.5 justify-center">
                          <TrendingUp className="h-4 w-4 text-purple-400" />
                          <span className="text-lg font-bold text-white">{item.stats.conversions}</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Sales</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1.5 justify-center">
                          <DollarSign className="h-4 w-4 text-emerald-400" />
                          <span className="text-lg font-bold text-white">KES {parseFloat(item.stats.earnings || 0).toLocaleString()}</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Earned</p>
                      </div>
                    </div>
                  )}

                  {/* Action */}
                  {item.status === 'approved' && (
                    <Button
                      onClick={() => handleGetReferralLink(item.campaign.id)}
                      variant="outline"
                      size="sm"
                      className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-xs shrink-0"
                    >
                      <Copy className="h-3 w-3 mr-1.5" />
                      Copy Link
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AffiliateMyCampaignsPage;
