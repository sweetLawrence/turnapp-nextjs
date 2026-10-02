"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/DashboardLayout';
import { affiliateApi } from '@/lib/services/affiliateApi';
import { authService } from '@/lib/services/authService';
import {
  Wallet, Loader2,
  ArrowLeft, Plus, Banknote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog";

const AffiliateWithdrawalsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState([]);
  const [summary, setSummary] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDialog, setShowDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    payment_method: '',
    payment_details: '',
    notes: '',
  });

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login', { state: { from: '/affiliate/withdrawals' } });
      return;
    }
    loadWithdrawals();
  }, [currentPage]);

  const loadWithdrawals = async () => {
    setLoading(true);
    try {
      const response = await affiliateApi.getWithdrawals({ page: currentPage, per_page: 15 });
      if (response.success) {
        setWithdrawals(response.data);
        setSummary(response.summary);
        setTotalPages(response.meta.last_page);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        router.push('/affiliate/register');
        return;
      }
      toast.error('Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = {
        amount: parseFloat(formData.amount),
        payment_method: formData.payment_method || undefined,
        payment_details: formData.payment_details || undefined,
        notes: formData.notes || undefined,
      };
      const response = await affiliateApi.requestWithdrawal(data);
      if (response.success) {
        toast.success(response.message);
        setShowDialog(false);
        setFormData({ amount: '', payment_method: '', payment_details: '', notes: '' });
        loadWithdrawals();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request withdrawal');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      'pending': { color: 'text-amber-400 bg-amber-500/10', label: 'Pending' },
      'approved': { color: 'text-blue-400 bg-blue-500/10', label: 'Approved' },
      'processing': { color: 'text-purple-400 bg-purple-500/10', label: 'Processing' },
      'completed': { color: 'text-emerald-400 bg-emerald-500/10', label: 'Completed' },
      'rejected': { color: 'text-red-400 bg-red-500/10', label: 'Rejected' },
    };
    const c = config[status] || config['pending'];
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${c.color}`}>
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
              <h1 className="text-3xl font-bold text-white tracking-tight">Withdrawals</h1>
              <p className="text-zinc-400 text-sm">Request payouts from your available balance</p>
            </div>
          </div>

          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 rounded-xl h-11 px-6">
                <Plus className="h-4 w-4 mr-2" />
                Request Withdrawal
              </Button>
            </DialogTrigger>

            <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  Request Withdrawal
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                {summary && (
                  <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
                    <p className="text-xs text-zinc-500 mb-1">Available Balance</p>
                    <p className="text-2xl font-bold text-white">KES {parseFloat(summary.available_balance || 0).toLocaleString()}</p>
                  </div>
                )}

                <div>
                  <label className="text-xs text-zinc-400 font-medium uppercase mb-2 block">Amount (KES)</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    required
                    min="1"
                    max={summary?.available_balance || 0}
                    step="0.01"
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-lg font-bold focus:outline-none focus:border-primary/50"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 font-medium uppercase mb-2 block">Payment Method</label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-primary/50 cursor-pointer"
                  >
                    <option value="">Use default</option>
                    <option value="mpesa">M-Pesa</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="paypal">PayPal</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-zinc-400 font-medium uppercase mb-2 block">Payment Details</label>
                  <input
                    type="text"
                    value={formData.payment_details}
                    onChange={(e) => setFormData(prev => ({ ...prev, payment_details: e.target.value }))}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-primary/50 placeholder:text-zinc-700"
                    placeholder="Phone number, bank account, or PayPal email"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 font-medium uppercase mb-2 block">Notes (Optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows="2"
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-primary/50 resize-none placeholder:text-zinc-700"
                    placeholder="Any additional notes..."
                  />
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
                    disabled={submitting}
                    className="flex-1 bg-white text-black hover:bg-zinc-200 font-semibold"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Submit Request
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-xl p-5">
              <p className="text-[10px] text-primary/70 uppercase tracking-wider font-bold mb-1">Available</p>
              <p className="text-2xl font-bold text-white">KES {parseFloat(summary.available_balance || 0).toLocaleString()}</p>
            </div>
            <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-5">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1">Pending Withdrawals</p>
              <p className="text-2xl font-bold text-amber-400">KES {parseFloat(summary.pending_withdrawals || 0).toLocaleString()}</p>
              <p className="text-xs text-zinc-600 mt-1">{summary.pending_count} request{summary.pending_count !== 1 ? 's' : ''}</p>
            </div>
            <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-5">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1">Total Withdrawn</p>
              <p className="text-2xl font-bold text-emerald-400">KES {parseFloat(summary.total_withdrawn || 0).toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Withdrawals List */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl">
            <Wallet className="h-10 w-10 text-zinc-600 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No withdrawals yet</h3>
            <p className="text-zinc-500 text-sm">Request your first payout when you have available balance.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {withdrawals.map((withdrawal) => (
              <div
                key={withdrawal.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                      <Banknote className="h-5 w-5 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">KES {parseFloat(withdrawal.amount).toLocaleString()}</p>
                      <p className="text-xs text-zinc-500">
                        via {withdrawal.payment_method || 'default method'} &middot; {new Date(withdrawal.requested_at || withdrawal.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {getStatusBadge(withdrawal.status)}
                    {withdrawal.rejection_reason && (
                      <p className="text-xs text-red-400 max-w-xs">{withdrawal.rejection_reason}</p>
                    )}
                  </div>
                </div>

                {withdrawal.notes && (
                  <p className="text-xs text-zinc-500 mt-3 pl-14">{withdrawal.notes}</p>
                )}
              </div>
            ))}
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
      </div>
    </DashboardLayout>
  );
};

export default AffiliateWithdrawalsPage;
