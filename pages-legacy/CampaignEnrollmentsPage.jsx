"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { DashboardLayout } from '@/components/DashboardLayout';
import { campaignApi } from '@/lib/services/campaignApi';
import { affiliateApi } from '@/lib/services/affiliateApi';
import {
  ArrowLeft, UserPlus, Trash2, Loader2, Mail,
  DollarSign, Users,CheckCircle2,
  MoreVertical, Shield, Clock, XCircle, Check, X, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

const CampaignEnrollmentsPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [manualInfluencers, setManualInfluencers] = useState([]);
  const [availableInfluencers, setAvailableInfluencers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const [formData, setFormData] = useState({
    influencer_id: '',
    commission_type: 'percentage',
    commission_value: '',
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [campaignRes, enrollmentsRes, manualRes, influencersRes] = await Promise.all([
        campaignApi.getCampaign(id),
        affiliateApi.getEnrollments(id).catch(() => ({ success: false, data: [] })),
        campaignApi.getEnrollments(id).catch(() => ({ success: false, data: [] })),
        campaignApi.getInfluencers().catch(() => ({ success: false, data: [] })),
      ]);

      if (campaignRes.success) setCampaign(campaignRes.data);
      // Filter out enrollments with missing affiliate data
      if (enrollmentsRes.success) {
        const validEnrollments = (enrollmentsRes.data || []).filter(e => e.affiliate?.user?.name);
        setEnrollments(validEnrollments);
      }
      if (manualRes.success) setManualInfluencers(manualRes.data || []);
      if (influencersRes.success) {
        const enrolledIds = (manualRes.data || []).map(e => e.id);
        setAvailableInfluencers((influencersRes.data || []).filter(inf => !enrolledIds.includes(inf.id)));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load campaign data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddInfluencer = async (e) => {
    e.preventDefault();
    try {
      const response = await campaignApi.addInfluencer(id, formData);
      if (response.success) {
        toast.success('Affiliate enrolled successfully');
        setShowDialog(false);
        setFormData({ influencer_id: '', commission_type: 'percentage', commission_value: '' });
        loadData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to enroll affiliate');
    }
  };

  const handleRemoveInfluencer = async (influencerId, name) => {
    if (!window.confirm(`Remove ${name} from this campaign?`)) return;
    try {
      const response = await campaignApi.removeInfluencer(id, influencerId);
      if (response.success) {
        toast.success('Affiliate removed');
        loadData();
      }
    } catch (error) {
      toast.error('Failed to remove affiliate');
    }
  };

  const handleApprove = async (enrollmentId) => {
    setProcessingId(enrollmentId);
    try {
      const response = await affiliateApi.approveEnrollment(enrollmentId);
      if (response.success) {
        toast.success('Affiliate approved');
        loadData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    setProcessingId(showRejectDialog);
    try {
      const response = await affiliateApi.rejectEnrollment(showRejectDialog, rejectReason);
      if (response.success) {
        toast.success('Affiliate rejected');
        setShowRejectDialog(null);
        setRejectReason('');
        loadData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject');
    } finally {
      setProcessingId(null);
    }
  };

  const pendingEnrollments = enrollments.filter(e => e.status === 'pending');
  const approvedEnrollments = enrollments.filter(e => e.status === 'approved');
  const rejectedEnrollments = enrollments.filter(e => e.status === 'rejected');

  const filteredEnrollments = activeTab === 'all' ? enrollments :
    activeTab === 'pending' ? pendingEnrollments :
    activeTab === 'approved' ? approvedEnrollments :
    rejectedEnrollments;

  const getStatusBadge = (status) => {
    const config = {
      pending: { color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Clock },
      approved: { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle2 },
      rejected: { color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: XCircle },
    };
    const c = config[status] || config.pending;
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border inline-flex items-center gap-1 ${c.color}`}>
        <c.icon className="h-3 w-3" />
        {status}
      </span>
    );
  };

  const StatCard = ({ icon: Icon, label, value, color, highlight }) => (
    <div className={`bg-zinc-900/50 backdrop-blur-sm border rounded-xl p-5 flex items-center gap-4 hover:border-white/10 transition-colors ${
      highlight ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/5'
    }`}>
      <div className={`p-3 rounded-lg bg-zinc-900 border border-white/5 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">{label}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto pb-20 space-y-8 animate-in fade-in duration-500">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <Button
              variant="link"
              onClick={() => router.push('/dashboard/affiliate')}
              className="text-zinc-400 hover:text-white pl-0 h-auto p-0 mb-1"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back to Campaigns
            </Button>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {campaign?.name} <span className="text-zinc-600 font-normal">/ Affiliates</span>
            </h1>
            <p className="text-zinc-400 text-sm">
              Manage affiliate enrollments, approve requests, and track performance.
            </p>
          </div>

          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 rounded-xl h-11 px-6">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Affiliate
              </Button>
            </DialogTrigger>

            <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-md shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Manually Add Affiliate
                </DialogTitle>
                <p className="text-sm text-zinc-500">
                  Select an influencer and set their commission rate.
                </p>
              </DialogHeader>

              <form onSubmit={handleAddInfluencer} className="space-y-6 mt-4">
                <div>
                  <label className="text-xs text-zinc-400 font-medium uppercase mb-2 block">Select Affiliate</label>
                  <select
                    name="influencer_id"
                    value={formData.influencer_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-primary/50 cursor-pointer"
                  >
                    <option value="">Choose an affiliate...</option>
                    {availableInfluencers.map(inf => (
                      <option key={inf.id} value={inf.id}>{inf.name}</option>
                    ))}
                  </select>
                  {availableInfluencers.length === 0 && (
                    <p className="text-xs text-amber-500 mt-2 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      All available influencers are already enrolled.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-400 font-medium uppercase mb-2 block">Commission Type</label>
                    <select
                      name="commission_type"
                      value={formData.commission_type}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-primary/50 cursor-pointer"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed (KES)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 font-medium uppercase mb-2 block">Value</label>
                    <div className="relative">
                      <input
                        type="number"
                        name="commission_value"
                        value={formData.commission_value}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="0.01"
                        className="w-full pl-3 pr-8 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-primary/50"
                        placeholder="0"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-medium">
                        {formData.commission_type === 'percentage' ? '%' : 'KES'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-white/5">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowDialog(false)}
                    className="flex-1 text-zinc-400 hover:text-white hover:bg-white/5"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-white text-black hover:bg-zinc-200 font-semibold"
                    disabled={availableInfluencers.length === 0}
                  >
                    Confirm
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Pending Approval Banner */}
        {pendingEnrollments.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-300">
                  {pendingEnrollments.length} affiliate{pendingEnrollments.length > 1 ? 's' : ''} awaiting approval
                </p>
                <p className="text-xs text-amber-400/60">Review and approve or reject their enrollment requests.</p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => setActiveTab('pending')}
              className="bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs border border-amber-500/20"
            >
              Review Now
            </Button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={Clock}
            label="Pending"
            value={pendingEnrollments.length}
            color="text-amber-400"
            highlight={pendingEnrollments.length > 0}
          />
          <StatCard
            icon={Users}
            label="Approved"
            value={approvedEnrollments.length}
            color="text-emerald-400"
          />
          <StatCard
            icon={XCircle}
            label="Rejected"
            value={rejectedEnrollments.length}
            color="text-red-400"
          />
          <StatCard
            icon={DollarSign}
            label="Commission"
            value={campaign?.commission_type === 'percentage'
              ? `${campaign?.commission_value}%`
              : `KES ${parseFloat(campaign?.commission_value || 0).toLocaleString()}`
            }
            color="text-primary"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 bg-zinc-900/80 border border-white/10 rounded-xl w-fit">
          {[
            { key: 'all', label: 'All', count: enrollments.length },
            { key: 'pending', label: 'Pending', count: pendingEnrollments.length },
            { key: 'approved', label: 'Approved', count: approvedEnrollments.length },
            { key: 'rejected', label: 'Rejected', count: rejectedEnrollments.length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === tab.key ? 'bg-white/10' :
                  tab.key === 'pending' && tab.count > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-800'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Enrollments List */}
        {filteredEnrollments.length === 0 && manualInfluencers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl">
            <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4 border border-zinc-800 shadow-lg">
              <Users className="h-8 w-8 text-zinc-600" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              {activeTab === 'pending' ? 'No pending requests' :
               activeTab === 'rejected' ? 'No rejected affiliates' :
               'No affiliates yet'}
            </h3>
            <p className="text-zinc-500 text-sm max-w-sm text-center mb-6">
              {activeTab === 'all'
                ? 'Affiliates will appear here when they request to join this campaign.'
                : `No ${activeTab} enrollments found.`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredEnrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                className={`group relative bg-zinc-900 border rounded-xl overflow-hidden transition-all duration-300 hover:bg-zinc-800/80 ${
                  enrollment.status === 'pending' ? 'border-amber-500/20 hover:border-amber-500/30' :
                  enrollment.status === 'approved' ? 'border-zinc-800 hover:border-zinc-700' :
                  'border-zinc-800/50 opacity-70 hover:opacity-100'
                }`}
              >
                {/* Status strip */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  enrollment.status === 'pending' ? 'bg-amber-500' :
                  enrollment.status === 'approved' ? 'bg-emerald-500' : 'bg-red-500'
                }`} />

                <div className="flex flex-col md:flex-row md:items-center p-5 pl-7 gap-4">
                  {/* Avatar & Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/5 flex items-center justify-center shrink-0">
                      <span className="text-base font-bold text-white">
                        {enrollment.affiliate?.user?.name?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-white">{enrollment.affiliate?.user?.name}</h3>
                        {getStatusBadge(enrollment.status)}
                      </div>
                      <p className="text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span className="truncate">{enrollment.affiliate?.user?.email}</span>
                      </p>
                      {enrollment.affiliate?.business_name && (
                        <p className="text-xs text-zinc-600 mt-0.5">{enrollment.affiliate.business_name}</p>
                      )}
                    </div>
                  </div>

                  {/* Applied date */}
                  <div className="text-xs text-zinc-500 md:text-right shrink-0">
                    {enrollment.applied_at && (
                      <p>Applied {new Date(enrollment.applied_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    )}
                    {enrollment.approved_at && (
                      <p className="text-emerald-500/70">Approved {new Date(enrollment.approved_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    )}
                    {enrollment.rejection_reason && (
                      <p className="text-red-400/70 mt-0.5 max-w-[200px]" title={enrollment.rejection_reason}>
                        Reason: {enrollment.rejection_reason.length > 30 ? enrollment.rejection_reason.substring(0, 30) + '...' : enrollment.rejection_reason}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {enrollment.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(enrollment.id)}
                          disabled={processingId === enrollment.id}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs h-8 px-4 rounded-lg"
                        >
                          {processingId === enrollment.id ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <Check className="h-3.5 w-3.5 mr-1" />
                          )}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setShowRejectDialog(enrollment.id); setRejectReason(''); }}
                          disabled={processingId === enrollment.id}
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs h-8 px-4 rounded-lg"
                        >
                          <X className="h-3.5 w-3.5 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    {enrollment.status === 'rejected' && (
                      <Button
                        size="sm"
                        onClick={() => handleApprove(enrollment.id)}
                        disabled={processingId === enrollment.id}
                        variant="outline"
                        className="border-zinc-700 text-zinc-400 hover:text-white text-xs h-8 px-4 rounded-lg"
                      >
                        Reconsider
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Manual influencers (legacy) */}
            {activeTab === 'all' && manualInfluencers.length > 0 && enrollments.length > 0 && (
              <div className="pt-4 border-t border-white/5 mt-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-3">Manually Added</p>
              </div>
            )}
            {(activeTab === 'all' ? manualInfluencers : []).map((influencer) => (
              <div
                key={`manual-${influencer.id}`}
                className="group relative bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 rounded-xl overflow-hidden transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-center p-5 gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/5 flex items-center justify-center shrink-0">
                      <span className="text-base font-bold text-white">{influencer.name?.charAt(0) || '?'}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{influencer.name}</h3>
                      <p className="text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5">
                        <Mail className="h-3 w-3" />
                        {influencer.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-center">
                      <span className="text-[10px] text-zinc-500 uppercase font-bold block">Commission</span>
                      <span className="text-white text-xs font-mono font-medium">
                        {influencer.pivot?.commission_type === 'percentage'
                          ? `${influencer.pivot?.commission_value}%`
                          : `KES ${parseFloat(influencer.pivot?.commission_value || 0).toLocaleString()}`
                        }
                      </span>
                    </div>
                    <div className="px-3 py-1.5 bg-purple-500/5 border border-purple-500/10 rounded-lg text-center">
                      <span className="text-[10px] text-purple-400 uppercase font-bold block">Conversions</span>
                      <span className="text-white text-xs font-mono font-medium">{influencer.pivot?.total_conversions || 0}</span>
                    </div>
                    <div className="px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/10 rounded-lg text-center">
                      <span className="text-[10px] text-emerald-400 uppercase font-bold block">Earnings</span>
                      <span className="text-white text-xs font-mono font-medium">KES {parseFloat(influencer.pivot?.total_earnings || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
                      <DropdownMenuItem
                        onClick={() => handleRemoveInfluencer(influencer.id, influencer.name)}
                        className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reject Dialog */}
        <Dialog open={!!showRejectDialog} onOpenChange={() => setShowRejectDialog(null)}>
          <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-400" />
                Reject Enrollment
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <label className="text-xs text-zinc-400 font-medium uppercase mb-2 block">Reason for Rejection</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows="3"
                  required
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-red-500/50 resize-none placeholder:text-zinc-700"
                  placeholder="Explain why this affiliate is being rejected..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="ghost"
                  onClick={() => setShowRejectDialog(null)}
                  className="flex-1 text-zinc-400 hover:text-white hover:bg-white/5"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={processingId === showRejectDialog}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold"
                >
                  {processingId === showRejectDialog ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Reject
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default CampaignEnrollmentsPage;
