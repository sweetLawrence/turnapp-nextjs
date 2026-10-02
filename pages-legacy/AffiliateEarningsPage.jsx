"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/DashboardLayout';
import { affiliateApi } from '@/lib/services/affiliateApi';
import { authService } from '@/lib/services/authService';
import {
  Loader2, Clock, CheckCircle2, CreditCard,
  XCircle, Filter, ArrowLeft, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const AffiliateEarningsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login', { state: { from: '/affiliate/earnings' } });
      return;
    }
    loadEarnings();
  }, [currentPage, statusFilter]);

  const loadEarnings = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: 15,
        status: statusFilter || undefined,
      };
      const response = await affiliateApi.getEarnings(params);
      if (response.success) {
        setEarnings(response.data);
        setSummary(response.summary);
        setTotalPages(response.meta.last_page);
        setTotal(response.meta.total);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        router.push('/affiliate/register');
        return;
      }
      toast.error('Failed to load earnings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      'pending': { color: 'text-amber-400 bg-amber-500/10', icon: Clock },
      'confirmed': { color: 'text-emerald-400 bg-emerald-500/10', icon: CheckCircle2 },
      'paid': { color: 'text-blue-400 bg-blue-500/10', icon: CreditCard },
      'cancelled': { color: 'text-red-400 bg-red-500/10', icon: XCircle },
    };
    const c = config[status] || config['pending'];
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${c.color}`}>
        <c.icon className="h-3 w-3" />
        {status}
      </span>
    );
  };

  const SummaryCard = ({ label, value, color }) => (
    <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4">
      <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto pb-20 space-y-8 animate-in fade-in duration-500">

        {/* Header */}
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
            <h1 className="text-3xl font-bold text-white tracking-tight">Earnings</h1>
            <p className="text-zinc-400 text-sm">Track your commissions and conversions</p>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <SummaryCard label="Total Earnings" value={`KES ${parseFloat(summary.total_earnings || 0).toLocaleString()}`} color="text-white" />
            <SummaryCard label="Pending" value={`KES ${parseFloat(summary.pending_earnings || 0).toLocaleString()}`} color="text-amber-400" />
            <SummaryCard label="Confirmed" value={`KES ${parseFloat(summary.confirmed_earnings || 0).toLocaleString()}`} color="text-emerald-400" />
            <SummaryCard label="Paid" value={`KES ${parseFloat(summary.paid_earnings || 0).toLocaleString()}`} color="text-blue-400" />
            <SummaryCard label="Total Conversions" value={summary.total_conversions} color="text-purple-400" />
          </div>
        )}

        {/* Filter */}
        <div className="flex items-center gap-3 p-2 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-xl">
          <Filter className="h-4 w-4 text-zinc-500 ml-2" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="bg-transparent text-sm text-zinc-400 focus:outline-none cursor-pointer flex-1 py-2"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <span className="text-xs text-zinc-600 pr-2">{total} results</span>
        </div>

        {/* Earnings Table */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : earnings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl">
            <TrendingUp className="h-10 w-10 text-zinc-600 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No earnings yet</h3>
            <p className="text-zinc-500 text-sm mb-4">Start promoting campaigns to earn commissions</p>
            <Button
              onClick={() => router.push('/affiliate/campaigns')}
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:text-white"
            >
              Browse Campaigns
            </Button>
          </div>
        ) : (
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold text-left px-5 py-3">Event</th>
                    <th className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold text-left px-5 py-3">Campaign</th>
                    <th className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold text-right px-5 py-3">Order</th>
                    <th className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold text-right px-5 py-3">Commission</th>
                    <th className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold text-center px-5 py-3">Rate</th>
                    <th className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold text-center px-5 py-3">Status</th>
                    <th className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold text-right px-5 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.map((earning) => (
                    <tr key={earning.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4 text-sm text-white">{earning.event || '-'}</td>
                      <td className="px-5 py-4 text-sm text-zinc-400">{earning.campaign || '-'}</td>
                      <td className="px-5 py-4 text-sm text-zinc-400 text-right">KES {parseFloat(earning.order_amount || 0).toLocaleString()}</td>
                      <td className="px-5 py-4 text-sm font-bold text-emerald-400 text-right">+KES {parseFloat(earning.commission_amount || 0).toLocaleString()}</td>
                      <td className="px-5 py-4 text-xs text-zinc-500 text-center">
                        {earning.commission_type === 'percentage' ? `${earning.commission_rate}%` : `KES ${earning.commission_rate}`}
                      </td>
                      <td className="px-5 py-4 text-center">{getStatusBadge(earning.status)}</td>
                      <td className="px-5 py-4 text-xs text-zinc-500 text-right">{new Date(earning.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

export default AffiliateEarningsPage;
