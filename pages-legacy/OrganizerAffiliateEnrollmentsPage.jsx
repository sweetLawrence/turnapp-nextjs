"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { DashboardLayout } from '@/components/DashboardLayout';
import { affiliateApi } from '@/lib/services/affiliateApi';
import { authService } from '@/lib/services/authService';
import {
  Users, Loader2, CheckCircle2, XCircle, Clock,
  ArrowLeft, DollarSign, Percent, Hash, UserCheck, UserX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog";

const OrganizerAffiliateEnrollmentsPage = () => {
  const router = useRouter();
  const { campaignId } = useParams();
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [campaign, setCampaign] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [rejectDialog, setRejectDialog] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [commissionDialog, setCommissionDialog] = useState(null);
  const [commissionForm, setCommissionForm] = useState({
    commission_type: 'percentage',
    commission_value: '',
  });
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }
    loadEnrollments();
  }, [campaignId, statusFilter]);

  const loadEnrollments = async () => {
    setLoading(true);
    try {
      const params = { status: statusFilter || undefined };
      const response = await affiliateApi.getEnrollments(campaignId, params);
      if (response.success) {
        setEnrollments(response.data);
        setCampaign(response.campaign);
        setPendingCount(response.pending_count);
      }
    } catch (error) {
      toast.error('Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (enrollmentId) => {
    setProcessing(enrollmentId);
    try {
      const response = await affiliateApi.approveEnrollment(enrollmentId);
      if (response.success) {
        toast.success('Enrollment approved');
        loadEnrollments();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason');
      return;
    }
    setProcessing(rejectDialog);
    try {
      const response = await affiliateApi.rejectEnrollment(rejectDialog, rejectReason);
      if (response.success) {
        toast.success('Enrollment rejected');
        setRejectDialog(null);
        setRejectReason('');
        loadEnrollments();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject');
    } finally {
      setProcessing(null);
    }
  };

  const handleSetCommission = async () => {
    setProcessing(commissionDialog);
    try {
      const response = await affiliateApi.setCustomCommission(commissionDialog, commissionForm);
      if (response.success) {
        toast.success('Custom commission set');
        setCommissionDialog(null);
        setCommissionForm({ commission_type: 'percentage', commission_value: '' });
        loadEnrollments();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to set commission');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      'pending': { color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: Clock },
      'approved': { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 },
      'rejected': { color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: XCircle },
      'suspended': { color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20', icon: XCircle },
    };
    const c = config[status] || config['pending'];
    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${c.color}`}>
        <c.icon className="h-3 w-3" />
        {status}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto pb-20 space-y-8 animate-in fade-in duration-500">

        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard/affiliate')}
            className="text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Affiliate Enrollments</h1>
            {campaign && (
              <p className="text-zinc-400 text-sm">
                {campaign.name} &middot; Default: {campaign.commission_type === 'percentage' ? `${campaign.commission_value}%` : `KES ${campaign.commission_value}`}
              </p>
            )}
          </div>
          {pendingCount > 0 && (
            <span className="ml-auto px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs font-bold text-amber-400">
              {pendingCount} pending
            </span>
          )}
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {['', 'pending', 'approved', 'rejected'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className={statusFilter === status
                ? 'bg-white text-black'
                : 'border-zinc-800 text-zinc-400 hover:text-white hover:bg-white/5'
              }
            >
              {status || 'All'}
            </Button>
          ))}
        </div>

        {/* Enrollments */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : enrollments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl">
            <Users className="h-10 w-10 text-zinc-600 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No enrollments</h3>
            <p className="text-zinc-500 text-sm">No affiliate enrollments for this campaign yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {enrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-white">
                      {enrollment.affiliate.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-white">{enrollment.affiliate.user.name}</p>
                        {getStatusBadge(enrollment.status)}
                      </div>
                      <p className="text-xs text-zinc-500">{enrollment.affiliate.user.email}</p>
                      {enrollment.affiliate.business_name && (
                        <p className="text-xs text-zinc-600">{enrollment.affiliate.business_name}</p>
                      )}
                      <p className="text-xs text-zinc-600 font-mono mt-1">Code: {enrollment.affiliate.referral_code}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Commission info */}
                    <div className="text-right">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Commission</p>
                      <p className="text-sm font-bold text-white">
                        {enrollment.custom_commission_type
                          ? (enrollment.custom_commission_type === 'percentage'
                              ? `${enrollment.custom_commission_value}%`
                              : `KES ${enrollment.custom_commission_value}`)
                          : 'Default'
                        }
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {enrollment.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(enrollment.id)}
                            disabled={processing === enrollment.id}
                            className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 text-xs h-8"
                          >
                            {processing === enrollment.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserCheck className="h-3 w-3 mr-1" />}
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => setRejectDialog(enrollment.id)}
                            variant="outline"
                            className="border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs h-8"
                          >
                            <UserX className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      {enrollment.status === 'approved' && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setCommissionDialog(enrollment.id);
                            if (enrollment.custom_commission_type) {
                              setCommissionForm({
                                commission_type: enrollment.custom_commission_type,
                                commission_value: enrollment.custom_commission_value || '',
                              });
                            }
                          }}
                          variant="outline"
                          className="border-zinc-700 text-zinc-400 hover:text-white text-xs h-8"
                        >
                          <DollarSign className="h-3 w-3 mr-1" />
                          Set Commission
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {enrollment.rejection_reason && (
                  <p className="text-xs text-red-400 mt-3 pl-14">Rejection reason: {enrollment.rejection_reason}</p>
                )}
                {enrollment.affiliate.bio && (
                  <p className="text-xs text-zinc-600 mt-2 pl-14">{enrollment.affiliate.bio}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Reject Dialog */}
        <Dialog open={!!rejectDialog} onOpenChange={() => { setRejectDialog(null); setRejectReason(''); }}>
          <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-white">Reject Enrollment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <label className="text-xs text-zinc-400 font-medium uppercase mb-2 block">Reason</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows="3"
                  required
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-primary/50 resize-none placeholder:text-zinc-700"
                  placeholder="Explain why this application is being rejected..."
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => { setRejectDialog(null); setRejectReason(''); }}
                  className="flex-1 text-zinc-400"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={processing === rejectDialog}
                  className="flex-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                >
                  {processing === rejectDialog ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Reject
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Commission Dialog */}
        <Dialog open={!!commissionDialog} onOpenChange={() => { setCommissionDialog(null); setCommissionForm({ commission_type: 'percentage', commission_value: '' }); }}>
          <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-white">Set Custom Commission</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <label className="text-xs text-zinc-400 font-medium uppercase mb-2 block">Type</label>
                <select
                  value={commissionForm.commission_type}
                  onChange={(e) => setCommissionForm(prev => ({ ...prev, commission_type: e.target.value }))}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-primary/50 cursor-pointer"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-medium uppercase mb-2 block">
                  Value {commissionForm.commission_type === 'percentage' ? '(%)' : '(KES)'}
                </label>
                <input
                  type="number"
                  value={commissionForm.commission_value}
                  onChange={(e) => setCommissionForm(prev => ({ ...prev, commission_value: e.target.value }))}
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-primary/50"
                  placeholder="0.00"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setCommissionDialog(null)}
                  className="flex-1 text-zinc-400"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSetCommission}
                  disabled={processing === commissionDialog}
                  className="flex-1 bg-white text-black hover:bg-zinc-200 font-semibold"
                >
                  {processing === commissionDialog ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default OrganizerAffiliateEnrollmentsPage;
