"use client"

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { adminWithdrawalApi } from '@/lib/services/adminWithdrawalApi';
import { 
  Wallet, Loader2, Calendar, DollarSign, CheckCircle2, 
  Clock, XCircle, Eye, Filter, Download, User,
  AlertCircle, History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

const AdminWithdrawalsPage = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showDisburseDialog, setShowDisburseDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(15);

  useEffect(() => {
    loadWithdrawals();
  }, [currentPage, statusFilter]);

  const loadWithdrawals = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: perPage,
        status: statusFilter,
        date_from: dateFrom,
        date_to: dateTo,
      };
      
      const response = await adminWithdrawalApi.getWithdrawals(params);
      if (response.success) {
        setWithdrawals(response.data);
        setTotalPages(response.pagination.last_page);
      }
    } catch (error) {
      console.error('Error loading withdrawals:', error);
      toast.error('Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadWithdrawals();
  };

  const handleViewDetails = async (withdrawalId) => {
    try {
      const response = await adminWithdrawalApi.getWithdrawal(withdrawalId);
      if (response.success) {
        setSelectedWithdrawal(response.data);
        setShowDetailsDialog(true);
      }
    } catch (error) {
      toast.error('Failed to load withdrawal details');
    }
  };

  const handleApprove = async (withdrawalId) => {
    setActionLoading(true);
    try {
      const response = await adminWithdrawalApi.approveWithdrawal(withdrawalId);
      if (response.success) {
        toast.success('Withdrawal approved successfully');
        loadWithdrawals();
        setShowApproveDialog(false);
        if (selectedWithdrawal?.id === withdrawalId) {
          setShowDetailsDialog(false);
          setSelectedWithdrawal(null);
        }
      }
    } catch (error) {
      toast.error(error.message || 'Failed to approve withdrawal');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveClick = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowApproveDialog(true);
  };

  const handleDisburse = async (withdrawalId) => {
    setActionLoading(true);
    try {
      const response = await adminWithdrawalApi.disburseWithdrawal(withdrawalId);
      if (response.success) {
        toast.success('Withdrawal marked as disbursed successfully');
        loadWithdrawals();
        setShowDisburseDialog(false);
        if (selectedWithdrawal?.id === withdrawalId) {
          setShowDetailsDialog(false);
          setSelectedWithdrawal(null);
        }
      }
    } catch (error) {
      toast.error(error.message || 'Failed to disburse withdrawal');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisburseClick = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowDisburseDialog(true);
  };

  const handleRejectClick = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setRejectionReason('');
    setShowRejectDialog(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason || rejectionReason.trim().length < 10) {
      toast.error('Rejection reason must be at least 10 characters');
      return;
    }

    setActionLoading(true);
    try {
      const response = await adminWithdrawalApi.rejectWithdrawal(
        selectedWithdrawal.id,
        rejectionReason
      );
      if (response.success) {
        toast.success('Withdrawal rejected successfully');
        loadWithdrawals();
        setShowRejectDialog(false);
        setShowDetailsDialog(false);
        setSelectedWithdrawal(null);
        setRejectionReason('');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to reject withdrawal');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params = {
        status: statusFilter,
        date_from: dateFrom,
        date_to: dateTo,
      };
      
      await adminWithdrawalApi.exportWithdrawals(params);
      toast.success('Export started successfully');
    } catch (error) {
      toast.error('Failed to export withdrawals');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'requested': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      'approved': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'disbursed': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
      'rejected': 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    
    const icons = {
      'requested': <Clock className="h-3.5 w-3.5" />,
      'approved': <CheckCircle2 className="h-3.5 w-3.5" />,
      'disbursed': <CheckCircle2 className="h-3.5 w-3.5" />,
      'rejected': <XCircle className="h-3.5 w-3.5" />,
    };

    const style = styles[status] || styles['requested'];
    const icon = icons[status] || icons['requested'];

    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 w-fit ${style}`}>
        {icon}
        {status}
      </span>
    );
  };

  const getWithdrawalTypeBadge = (type) => {
    const styles = {
      'pre_event': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      'post_event': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      'general': 'bg-zinc-700/50 text-zinc-400 border-zinc-600/20',
    };

    const labels = {
      'pre_event': 'Pre-Event',
      'post_event': 'Post-Event',
      'general': 'General',
    };

    const style = styles[type] || styles['general'];
    const label = labels[type] || type;

    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${style}`}>
        {label}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return parseFloat(amount || 0).toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto pb-20 space-y-8 animate-in fade-in duration-500">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Withdrawal Management</h1>
            <p className="text-zinc-400 text-sm">Review and process organizer withdrawal requests</p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleExport}
            className="border-white/10 bg-white/5 hover:bg-white hover:text-black text-white h-10"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Filters Toolbar */}
        <div className="sticky top-24 z-20 flex flex-col gap-3 p-4 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex items-center gap-2 flex-1">
              <Filter className="h-4 w-4 text-zinc-500" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-sm text-zinc-300 focus:outline-none cursor-pointer hover:text-white transition-colors flex-1"
              >
                <option value="" className="bg-zinc-900">All Status</option>
                <option value="requested" className="bg-zinc-900">Requested</option>
                <option value="approved" className="bg-zinc-900">Approved</option>
                <option value="disbursed" className="bg-zinc-900">Disbursed</option>
                <option value="rejected" className="bg-zinc-900">Rejected</option>
              </select>
            </div>

            <div className="h-px w-full md:w-px md:h-6 bg-white/10 my-auto" />

            <div className="flex items-center gap-2 flex-1">
              <Calendar className="h-4 w-4 text-zinc-500" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-transparent text-sm text-zinc-300 focus:outline-none flex-1"
                placeholder="From"
              />
            </div>

            <div className="flex items-center gap-2 flex-1">
              <Calendar className="h-4 w-4 text-zinc-500" />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-transparent text-sm text-zinc-300 focus:outline-none flex-1"
                placeholder="To"
              />
            </div>
            
            <Button 
              type="button" 
              onClick={handleSearch} 
              className="bg-white text-black hover:bg-zinc-200 font-semibold h-9"
            >
              Apply Filters
            </Button>
          </div>
        </div>

        {/* Withdrawals Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl">
            <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4 border border-zinc-800 shadow-lg">
              <Wallet className="h-8 w-8 text-zinc-600" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No withdrawals found</h3>
            <p className="text-zinc-500 text-sm max-w-sm text-center">
              Withdrawal requests will appear here when organizers submit them.
            </p>
          </div>
        ) : (
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5 bg-zinc-900/80">
                    <th className="text-left px-4 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="text-left px-4 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Organizer
                    </th>
                    <th className="text-left px-4 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="text-left px-4 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="text-left px-4 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="text-left px-4 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-4 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Requested
                    </th>
                    <th className="text-center px-2 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {withdrawals.map((withdrawal) => (
                    <tr 
                      key={withdrawal.id}
                      className="hover:bg-zinc-800/50 transition-colors group"
                    >
                      <td className="px-4 py-4">
                        <span className="text-sm font-mono text-zinc-300">
                          #{withdrawal.id}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium text-white">
                            {withdrawal.user?.name || 'N/A'}
                          </span>
                          <span className="text-xs text-zinc-500">
                            {withdrawal.user?.email || 'N/A'}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className="text-sm text-zinc-300">
                          {withdrawal.event?.title || 'General Withdrawal'}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span className="text-sm font-bold text-white font-mono">
                          KES {formatCurrency(withdrawal.amount)}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        {getWithdrawalTypeBadge(withdrawal.withdrawal_type)}
                      </td>

                      <td className="px-4 py-4">
                        {getStatusBadge(withdrawal.status)}
                      </td>

                      <td className="px-4 py-4">
                        <span className="text-sm text-zinc-300">
                          {formatDate(withdrawal.requested_at)}
                        </span>
                      </td>

                      <td className="px-2 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewDetails(withdrawal.id)}
                            className="hover:bg-white hover:text-black text-zinc-400 hover:scale-105 transition-all text-xs h-8"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            View
                          </Button>
                          
                          {/* Quick Actions for Requested */}
                          {withdrawal.status === 'requested' && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleApproveClick(withdrawal)}
                                disabled={actionLoading}
                                className="hover:bg-blue-600 hover:text-white text-blue-400 hover:scale-105 transition-all text-xs h-8"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRejectClick(withdrawal)}
                                disabled={actionLoading}
                                className="hover:bg-red-600 hover:text-white text-red-400 hover:scale-105 transition-all text-xs h-8"
                              >
                                <XCircle className="h-3.5 w-3.5 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          
                          {/* Quick Action for Approved */}
                          {withdrawal.status === 'approved' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDisburseClick(withdrawal)}
                              disabled={actionLoading}
                              className="hover:bg-emerald-600 hover:text-white text-emerald-400 hover:scale-105 transition-all text-xs h-8"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                              Disburse
                            </Button>
                          )}
                        </div>
                      </td>
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

        {/* Withdrawal Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl p-0 gap-0">
            {selectedWithdrawal && (
              <>
                {/* Header */}
                <div className="p-6 border-b border-white/5 bg-zinc-900/50">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-primary" />
                        Withdrawal Request #{selectedWithdrawal.id}
                      </h2>
                      <p className="text-sm text-zinc-500 mt-1">
                        Requested on {formatDate(selectedWithdrawal.requested_at)}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      {getStatusBadge(selectedWithdrawal.status)}
                      {getWithdrawalTypeBadge(selectedWithdrawal.withdrawal_type)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                      <p className="text-xs text-zinc-500 mb-2 flex items-center gap-1.5">
                        <DollarSign className="h-3 w-3" />
                        Disbursement Amount
                      </p>
                      <p className="text-2xl font-bold text-white font-mono">
                        KES {formatCurrency(selectedWithdrawal.amount)}
                      </p>
                      {parseFloat(selectedWithdrawal.processing_fee || 0) > 0 && (
                        <div className="mt-2 pt-2 border-t border-zinc-700 space-y-1">
                          <div className="flex justify-between text-xs text-zinc-500">
                            <span>Transaction fee</span>
                            <span className="font-mono text-amber-400">KES {formatCurrency(selectedWithdrawal.processing_fee)}</span>
                          </div>
                          <div className="flex justify-between text-xs font-bold text-zinc-300">
                            <span>Total deducted</span>
                            <span className="font-mono">KES {formatCurrency(parseFloat(selectedWithdrawal.amount) + parseFloat(selectedWithdrawal.processing_fee || 0))}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                      <p className="text-xs text-zinc-500 mb-2 flex items-center gap-1.5">
                        <User className="h-3 w-3" />
                        Organizer
                      </p>
                      <p className="text-sm font-medium text-white">
                        {selectedWithdrawal.user?.name || 'N/A'}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {selectedWithdrawal.user?.email || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Event Information */}
                  {selectedWithdrawal.event && (
                    <div>
                      <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
                        Event Information
                      </h3>
                      <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-zinc-500">Event Name:</span>
                          <span className="text-sm font-medium text-white">
                            {selectedWithdrawal.event.title}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-zinc-500">Event Date:</span>
                          <span className="text-sm text-zinc-300">
                            {new Date(selectedWithdrawal.event.from).toLocaleDateString()}
                          </span>
                        </div>
                        {selectedWithdrawal.event.location && (
                          <div className="flex justify-between">
                            <span className="text-sm text-zinc-500">Location:</span>
                            <span className="text-sm text-zinc-300">
                              {selectedWithdrawal.event.location}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Payment Method */}
                  {selectedWithdrawal.payment_method && (
                    <div>
                      <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
                        Payment Method
                      </h3>
                      <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-zinc-500">Type:</span>
                          <span className="text-sm font-medium text-white uppercase">
                            {selectedWithdrawal.payment_method.payment_type}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-zinc-500">Account Holder:</span>
                          <span className="text-sm text-zinc-300">
                            {selectedWithdrawal.payment_method.account_holder_name || 'N/A'}
                          </span>
                        </div>
                        {selectedWithdrawal.payment_method.account_number && (
                          <div className="flex justify-between">
                            <span className="text-sm text-zinc-500">Account Number:</span>
                            <span className="text-sm text-zinc-300 font-mono">
                              {selectedWithdrawal.payment_method.account_number}
                            </span>
                          </div>
                        )}
                        {selectedWithdrawal.payment_method.mobile_number && (
                          <div className="flex justify-between">
                            <span className="text-sm text-zinc-500">Mobile Number:</span>
                            <span className="text-sm text-zinc-300 font-mono">
                              {selectedWithdrawal.payment_method.mobile_number}
                            </span>
                          </div>
                        )}
                        {selectedWithdrawal.payment_method.bank_name && (
                          <div className="flex justify-between">
                            <span className="text-sm text-zinc-500">Bank:</span>
                            <span className="text-sm text-zinc-300">
                              {selectedWithdrawal.payment_method.bank_name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Wallet Information */}
                  {selectedWithdrawal.wallet && (
                    <div>
                      <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
                        Wallet Information
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                          <p className="text-xs text-zinc-500 mb-1">Available Balance</p>
                          <p className="text-lg font-bold text-white font-mono">
                            KES {formatCurrency(selectedWithdrawal.wallet.available_balance)}
                          </p>
                        </div>
                        <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                          <p className="text-xs text-zinc-500 mb-1">Total Withdrawn</p>
                          <p className="text-lg font-bold text-white font-mono">
                            KES {formatCurrency(selectedWithdrawal.wallet.total_withdrawn)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Audit Trail */}
                  <div>
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <History className="h-3.5 w-3.5" />
                      Audit Trail
                    </h3>
                    <div className="space-y-2">
                      <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-zinc-500">Requested</span>
                          <span className="text-xs text-zinc-300">
                            {formatDate(selectedWithdrawal.requested_at)}
                          </span>
                        </div>
                      </div>
                      
                      {selectedWithdrawal.approved_at && (
                        <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-blue-400">Approved</span>
                            <span className="text-xs text-zinc-300">
                              {formatDate(selectedWithdrawal.approved_at)}
                            </span>
                          </div>
                          {selectedWithdrawal.approver && (
                            <div className="text-xs text-zinc-500">
                              By: {selectedWithdrawal.approver.name}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {selectedWithdrawal.disbursed_at && (
                        <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-emerald-400">Disbursed</span>
                            <span className="text-xs text-zinc-300">
                              {formatDate(selectedWithdrawal.disbursed_at)}
                            </span>
                          </div>
                          {selectedWithdrawal.disburser && (
                            <div className="text-xs text-zinc-500">
                              By: {selectedWithdrawal.disburser.name}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {selectedWithdrawal.rejected_at && (
                        <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-red-400">Rejected</span>
                            <span className="text-xs text-zinc-300">
                              {formatDate(selectedWithdrawal.rejected_at)}
                            </span>
                          </div>
                          {selectedWithdrawal.rejecter && (
                            <div className="text-xs text-zinc-500 mb-2">
                              By: {selectedWithdrawal.rejecter.name}
                            </div>
                          )}
                          {selectedWithdrawal.rejection_reason && (
                            <div className="text-xs text-zinc-400 mt-2 p-2 bg-zinc-900 rounded">
                              <span className="text-zinc-500">Reason: </span>
                              {selectedWithdrawal.rejection_reason}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedWithdrawal.notes && (
                    <div>
                      <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
                        Notes
                      </h3>
                      <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                        <p className="text-sm text-zinc-300">{selectedWithdrawal.notes}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex justify-between">
                  <Button 
                    onClick={() => setShowDetailsDialog(false)} 
                    variant="outline" 
                    className="border-zinc-700 text-zinc-300 hover:text-white"
                  >
                    Close
                  </Button>
                  
                  {selectedWithdrawal.status === 'requested' && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleRejectClick(selectedWithdrawal)}
                        variant="outline"
                        disabled={actionLoading}
                        className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        onClick={() => handleApproveClick(selectedWithdrawal)}
                        disabled={actionLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    </div>
                  )}
                  
                  {selectedWithdrawal.status === 'approved' && (
                    <Button
                      onClick={() => handleDisburseClick(selectedWithdrawal)}
                      disabled={actionLoading}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Mark as Disbursed
                    </Button>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Rejection Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-400">
                <AlertCircle className="h-5 w-5" />
                Reject Withdrawal Request
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                Please provide a reason for rejecting this withdrawal request. 
                The organizer will be notified via email.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-2 block">
                  Rejection Reason (minimum 10 characters)
                </label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter the reason for rejection..."
                  className="bg-zinc-900 border-zinc-800 text-white min-h-[120px]"
                  maxLength={500}
                />
                <p className="text-xs text-zinc-500 mt-1">
                  {rejectionReason.length}/500 characters
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectionReason('');
                }}
                disabled={actionLoading}
                className="border-zinc-700 text-zinc-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRejectSubmit}
                disabled={actionLoading || rejectionReason.trim().length < 10}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Confirm Rejection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Approve Confirmation Dialog */}
        <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
          <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-blue-400">
                <CheckCircle2 className="h-5 w-5" />
                Approve Withdrawal Request
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                Are you sure you want to approve this withdrawal request?
              </DialogDescription>
            </DialogHeader>
            
            {selectedWithdrawal && (
              <div className="space-y-4 py-4">
                <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-zinc-500">Organizer:</span>
                    <span className="text-sm font-medium text-white">
                      {selectedWithdrawal.user?.name || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-zinc-500">Amount:</span>
                    <span className="text-sm font-bold text-white font-mono">
                      KES {formatCurrency(selectedWithdrawal.amount)}
                    </span>
                  </div>
                  {selectedWithdrawal.event && (
                    <div className="flex justify-between">
                      <span className="text-sm text-zinc-500">Event:</span>
                      <span className="text-sm text-zinc-300">
                        {selectedWithdrawal.event.title}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-zinc-500">
                  Once approved, you can mark this withdrawal as disbursed after processing the payment.
                </p>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowApproveDialog(false)}
                disabled={actionLoading}
                className="border-zinc-700 text-zinc-300"
              >
                Cancel
              </Button>
              <Button
                onClick={() => selectedWithdrawal && handleApprove(selectedWithdrawal.id)}
                disabled={actionLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Confirm Approval
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Disburse Confirmation Dialog */}
        <Dialog open={showDisburseDialog} onOpenChange={setShowDisburseDialog}>
          <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
                Mark as Disbursed
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                Confirm that you have successfully transferred the funds to the organizer's account.
              </DialogDescription>
            </DialogHeader>
            
            {selectedWithdrawal && (
              <div className="space-y-4 py-4">
                <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-zinc-500">Organizer:</span>
                    <span className="text-sm font-medium text-white">
                      {selectedWithdrawal.user?.name || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-zinc-500">Amount:</span>
                    <span className="text-sm font-bold text-white font-mono">
                      KES {formatCurrency(selectedWithdrawal.amount)}
                    </span>
                  </div>
                  {selectedWithdrawal.payment_method && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-zinc-500">Payment Method:</span>
                        <span className="text-sm text-zinc-300 uppercase">
                          {selectedWithdrawal.payment_method.payment_type}
                        </span>
                      </div>
                      {selectedWithdrawal.payment_method.account_number && (
                        <div className="flex justify-between">
                          <span className="text-sm text-zinc-500">Account:</span>
                          <span className="text-sm text-zinc-300 font-mono">
                            {selectedWithdrawal.payment_method.account_number}
                          </span>
                        </div>
                      )}
                      {selectedWithdrawal.payment_method.mobile_number && (
                        <div className="flex justify-between">
                          <span className="text-sm text-zinc-500">Mobile:</span>
                          <span className="text-sm text-zinc-300 font-mono">
                            {selectedWithdrawal.payment_method.mobile_number}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="text-xs text-amber-400 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>
                      The organizer will be notified via email once you confirm. 
                      Make sure the payment has been successfully processed.
                    </span>
                  </p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDisburseDialog(false)}
                disabled={actionLoading}
                className="border-zinc-700 text-zinc-300"
              >
                Cancel
              </Button>
              <Button
                onClick={() => selectedWithdrawal && handleDisburse(selectedWithdrawal.id)}
                disabled={actionLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Confirm Disbursement
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminWithdrawalsPage;
