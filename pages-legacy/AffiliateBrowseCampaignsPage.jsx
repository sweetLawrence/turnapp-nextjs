"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/DashboardLayout';
import { affiliateApi } from '@/lib/services/affiliateApi';
import { authService } from '@/lib/services/authService';
import {
  Search, Loader2, Target, Calendar, DollarSign,
  CheckCircle2, Clock, XCircle, ArrowRight, Copy,
  Percent, Users, AlertCircle,
  Sparkles, TrendingUp, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog";

const AffiliateBrowseCampaignsPage = () => {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [enrolling, setEnrolling] = useState(null);
  const [referralDialog, setReferralDialog] = useState(null);
  const [affiliateStatus, setAffiliateStatus] = useState(null);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login', { state: { from: '/affiliate/campaigns' } });
      return;
    }
    checkAffiliateStatus();
    loadCampaigns();
  }, [currentPage, filterStatus]);

  const checkAffiliateStatus = async () => {
    try {
      const response = await affiliateApi.getStatus();
      if (response.success) {
        setAffiliateStatus(response.data?.status);
      }
    } catch (error) {
      console.error('Error checking affiliate status:', error);
    }
  };

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: 12,
        search: searchTerm,
        filter_status: filterStatus !== 'all' ? filterStatus : undefined,
      };
      const response = await affiliateApi.getCampaigns(params);
      if (response.success) {
        setCampaigns(response.data);
        setTotalPages(response.meta.last_page);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        router.push('/affiliate/register');
        return;
      }
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadCampaigns();
  };

  const handleEnroll = async (campaignId) => {
    setEnrolling(campaignId);
    try {
      const response = await affiliateApi.enrollInCampaign(campaignId);
      if (response.success) {
        toast.success(response.message);
        loadCampaigns();
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to enroll';
      // If it's a status issue, update the local state
      if (error.response?.status === 403 && msg.includes('active')) {
        setAffiliateStatus('pending');
      }
      toast.error(msg);
    } finally {
      setEnrolling(null);
    }
  };

  const handleGetReferralLink = async (campaignId) => {
    try {
      const response = await affiliateApi.getReferralLink(campaignId);
      if (response.success) {
        setReferralDialog(response.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to get referral link');
    }
  };

  const copyLink = (link) => {
    navigator.clipboard.writeText(link);
    toast.success('Referral link copied!');
  };

  const getStatusConfig = (status) => {
    const config = {
      'available': { color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: Target, label: 'Available' },
      'pending': { color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Clock, label: 'Pending' },
      'approved': { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle2, label: 'Enrolled' },
      'rejected': { color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: XCircle, label: 'Rejected' },
    };
    return config[status] || config['available'];
  };

  const isAccountInactive = affiliateStatus && affiliateStatus !== 'active';

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto pb-20 space-y-6 animate-in fade-in duration-500">

        {/* Account Status Banner */}
        {isAccountInactive && (
          <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-300">Account {affiliateStatus === 'pending' ? 'Pending Approval' : 'Not Active'}</p>
              <p className="text-xs text-amber-400/70 mt-0.5">
                {affiliateStatus === 'pending'
                  ? 'Your affiliate account is being reviewed. You can browse campaigns but cannot join until approved.'
                  : 'Your affiliate account is not active. Please contact support for assistance.'
                }
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Browse Campaigns</h1>
            <p className="text-zinc-400 text-sm">Discover campaigns to join and start earning commissions.</p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push('/affiliate/my-campaigns')}
            className="border-zinc-700 text-zinc-300 hover:text-white"
          >
            My Campaigns <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Toolbar */}
        <form onSubmit={handleSearch} className="flex gap-3 p-2 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search campaigns or events..."
              className="w-full pl-10 pr-4 py-2 bg-transparent text-white placeholder-zinc-500 text-sm focus:outline-none"
            />
          </div>
          <div className="h-6 w-px bg-white/10 my-auto" />
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="bg-transparent text-sm text-zinc-400 focus:outline-none cursor-pointer px-2"
          >
            <option value="all">All</option>
            <option value="available">Available</option>
            <option value="enrolled">Enrolled</option>
          </select>
        </form>

        {/* Campaign Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl">
            <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4 border border-zinc-800">
              <Target className="h-8 w-8 text-zinc-600" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No campaigns found</h3>
            <p className="text-zinc-500 text-sm max-w-sm text-center">
              {searchTerm ? 'Try a different search term.' : 'Check back later for new campaigns from organizers.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {campaigns.map((campaign) => {
              const statusConfig = getStatusConfig(campaign.enrollment_status);
              const StatusIcon = statusConfig.icon;
              const isEnrolled = campaign.enrollment_status === 'approved';
              const isPending = campaign.enrollment_status === 'pending';

              return (
                <div
                  key={campaign.id}
                  className={`relative bg-zinc-900/80 border rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 group flex flex-col ${
                    isEnrolled
                      ? 'border-emerald-500/20 hover:border-emerald-500/40'
                      : isPending
                        ? 'border-amber-500/15 hover:border-amber-500/30'
                        : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {/* Top gradient accent */}
                  <div className={`h-1 w-full ${
                    isEnrolled ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                    isPending ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
                    'bg-gradient-to-r from-primary/60 to-primary'
                  }`} />

                  {/* Event Banner */}
                  <div className="h-28 bg-gradient-to-br from-zinc-800/50 to-zinc-900 relative overflow-hidden">
                    {campaign.event?.poster ? (
                      <img src={campaign.event.poster} alt="" className="w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-zinc-800/80 flex items-center justify-center">
                          <Target className="h-5 w-5 text-zinc-600" />
                        </div>
                      </div>
                    )}
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 backdrop-blur-sm ${statusConfig.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1 space-y-4">
                    {/* Campaign Info */}
                    <div>
                      <h3 className="text-base font-bold text-white mb-1 group-hover:text-primary/90 transition-colors">{campaign.name}</h3>
                      {campaign.event && (
                        <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          <span className="truncate">{campaign.event.title}</span>
                        </p>
                      )}
                    </div>

                    {campaign.description && (
                      <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">{campaign.description}</p>
                    )}

                    {/* Commission Highlight */}
                    <div className="flex items-center gap-3 py-3 px-4 bg-zinc-950/80 rounded-xl border border-zinc-800/80">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isEnrolled ? 'bg-emerald-500/10' : 'bg-primary/10'
                      }`}>
                        {campaign.commission_type === 'percentage' ? (
                          <Percent className={`h-4 w-4 ${isEnrolled ? 'text-emerald-400' : 'text-primary'}`} />
                        ) : (
                          <DollarSign className={`h-4 w-4 ${isEnrolled ? 'text-emerald-400' : 'text-primary'}`} />
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Commission</p>
                        <p className="text-sm font-bold text-white">
                          {campaign.commission_type === 'percentage'
                            ? `${parseFloat(campaign.commission_value)}%`
                            : `KES ${parseFloat(campaign.commission_value).toLocaleString()}`
                          }
                          <span className="text-zinc-600 font-normal text-[10px] ml-1">
                            / sale
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        {campaign.starts_at && new Date(campaign.starts_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {campaign.ends_at && (
                          <> — {new Date(campaign.ends_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</>
                        )}
                      </span>
                      {campaign.max_affiliates && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {campaign.available_slots != null
                            ? `${campaign.available_slots} slots`
                            : `${campaign.max_affiliates} max`
                          }
                        </span>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="pt-1 mt-auto">
                      {campaign.enrollment_status === 'available' ? (
                        <Button
                          onClick={() => handleEnroll(campaign.id)}
                          disabled={enrolling === campaign.id || !campaign.available_slots || isAccountInactive}
                          className="w-full bg-primary hover:bg-primary/90 text-white font-semibold text-xs h-10 rounded-xl transition-all hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50"
                        >
                          {enrolling === campaign.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                          ) : (
                            <Sparkles className="h-3.5 w-3.5 mr-2" />
                          )}
                          {!campaign.available_slots ? 'No Slots Available' :
                           isAccountInactive ? 'Account Not Active' : 'Join Campaign'}
                        </Button>
                      ) : campaign.enrollment_status === 'approved' ? (
                        <Button
                          onClick={() => handleGetReferralLink(campaign.id)}
                          className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/30 font-semibold text-xs h-10 rounded-xl transition-all"
                        >
                          <Share2 className="h-3.5 w-3.5 mr-2" />
                          Get Referral Link
                        </Button>
                      ) : campaign.enrollment_status === 'pending' ? (
                        <Button
                          disabled
                          className="w-full bg-amber-500/5 text-amber-400/70 border border-amber-500/10 font-medium text-xs h-10 rounded-xl cursor-not-allowed"
                        >
                          <Clock className="h-3.5 w-3.5 mr-2" />
                          Awaiting Approval
                        </Button>
                      ) : campaign.enrollment_status === 'rejected' ? (
                        <Button
                          onClick={() => handleEnroll(campaign.id)}
                          disabled={isAccountInactive}
                          variant="outline"
                          className="w-full border-zinc-700 text-zinc-400 hover:text-white text-xs h-10 rounded-xl"
                        >
                          Re-apply
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-6 border-t border-white/5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300"
            >
              Previous
            </Button>
            <span className="text-xs text-zinc-500 font-medium">
              Page <span className="text-white">{currentPage}</span> of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300"
            >
              Next
            </Button>
          </div>
        )}

        {/* Referral Link Dialog */}
        <Dialog open={!!referralDialog} onOpenChange={() => setReferralDialog(null)}>
          <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                <Share2 className="h-5 w-5 text-emerald-400" />
                Your Referral Link
              </DialogTitle>
            </DialogHeader>
            {referralDialog && (
              <div className="space-y-5 mt-2">
                <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800 space-y-1">
                  <p className="text-xs text-zinc-500">Campaign: <span className="text-zinc-300 font-medium">{referralDialog.campaign.name}</span></p>
                  <p className="text-xs text-zinc-500">Event: <span className="text-zinc-300 font-medium">{referralDialog.campaign.event}</span></p>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium mb-2 block">Referral URL</label>
                  <div className="flex items-center gap-2 p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                    <input
                      type="text"
                      readOnly
                      value={referralDialog.referral_link}
                      className="flex-1 bg-transparent text-sm text-white font-mono focus:outline-none truncate"
                    />
                    <Button
                      size="sm"
                      onClick={() => copyLink(referralDialog.referral_link)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs shrink-0 rounded-lg"
                    >
                      <Copy className="h-3 w-3 mr-1" /> Copy
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                  <p className="text-xs text-emerald-400/80 flex items-start gap-2">
                    <TrendingUp className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    Share this link on social media, WhatsApp, email, or anywhere. You earn a commission for every ticket sold through it.
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AffiliateBrowseCampaignsPage;
