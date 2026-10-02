"use client"

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { walletApi } from '@/lib/services/walletApi';
import { 
  Wallet, Loader2, DollarSign, TrendingUp, TrendingDown,
  RefreshCw, ArrowUpRight, ArrowDownRight, Calendar,
  BarChart3, Send, Plus, CreditCard, Landmark, History,
  Activity, ArrowRightLeft, Phone, Mail, MoreHorizontal,
  Trash2, Star, Cpu, Smartphone,
  Clock, Settings, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu";

const WalletPage = () => {
  const [wallet, setWallet] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [events, setEvents] = useState([]);
  const [notificationPreferences, setNotificationPreferences] = useState(null);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [showPaymentMethodDialog, setShowPaymentMethodDialog] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [savingPaymentMethod, setSavingPaymentMethod] = useState(false);
  const [paymentMethodErrors, setPaymentMethodErrors] = useState({});
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(10);

  // Withdrawal form state
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: '',
    payment_method_id: null, // Use saved payment method ID
    use_saved_method: true,
    event_id: null,
    withdrawal_type: null,
  });

  // Payment method form state
  const [paymentMethodForm, setPaymentMethodForm] = useState({
    payment_type: 'mobile_money',
    account_holder_name: '',
    mobile_provider: 'M-Pesa',
    mobile_number: '',
    bank_name: '',
    account_number: '',
    branch_name: '',
    swift_code: '',
    paypal_email: '',
    is_default: false,
  });

  useEffect(() => {
    loadWalletData();
  }, []);

  useEffect(() => {
    if (activeTab === 'transactions') {
      loadTransactions();
    } else if (activeTab === 'withdrawals') {
      loadWithdrawals();
    } else if (activeTab === 'analytics') {
      loadAnalytics();
    } else if (activeTab === 'payment-methods') {
      loadPaymentMethods();
    } else if (activeTab === 'events') {
      loadEvents();
    } else if (activeTab === 'settings') {
      loadNotificationPreferences();
    }
  }, [activeTab, currentPage]);

  const loadWalletData = async () => {
    setLoading(true);
    try {
      const [walletResponse, statsResponse] = await Promise.all([
        walletApi.getWallet(),
        walletApi.getStatistics()
      ]);
      
      if (walletResponse.success) {
        setWallet(walletResponse.data);
      }
      
      if (statsResponse.success) {
        setStatistics(statsResponse.data);
      }
    } catch (error) {
      console.error('Error loading wallet:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      const params = {
        page: currentPage,
        per_page: perPage,
      };
      
      const response = await walletApi.getTransactions(params);
      if (response.success) {
        setTransactions(response.data);
        setTotalPages(response.meta.last_page);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast.error('Failed to load transactions');
    }
  };

  const loadWithdrawals = async () => {
    try {
      const params = {
        page: currentPage,
        per_page: perPage,
      };
      
      const response = await walletApi.getWithdrawals(params);
      if (response.success) {
        setWithdrawals(response.data);
        setTotalPages(response.meta.last_page);
      }
    } catch (error) {
      console.error('Error loading withdrawals:', error);
      toast.error('Failed to load withdrawals');
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await walletApi.getAnalytics();
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics');
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const response = await walletApi.getPaymentMethods();
      if (response.success) {
        setPaymentMethods(response.data);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
      toast.error('Failed to load payment methods');
    }
  };

  const loadEvents = async () => {
    try {
      const response = await walletApi.getEvents();
      if (response.success) {
        setEvents(response.data);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error('Failed to load events');
    }
  };

  const loadNotificationPreferences = async () => {
    try {
      const response = await walletApi.getNotificationPreferences();
      if (response.success) {
        setNotificationPreferences(response.data);
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
      toast.error('Failed to load notification preferences');
    }
  };

  const handleUpdateNotificationPreference = async (key, value) => {
    setSavingPreferences(true);
    try {
      const response = await walletApi.updateNotificationPreferences({
        [key]: value
      });
      if (response.success) {
        setNotificationPreferences(response.data);
        toast.success('Notification preferences updated');
      }
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      toast.error('Failed to update notification preferences');
    } finally {
      setSavingPreferences(false);
    }
  };

  const handleAddPaymentMethod = async (e) => {
    e.preventDefault();
    setSavingPaymentMethod(true);
    setPaymentMethodErrors({});
    
    try {
      // Build payload with only relevant fields based on payment type
      const payload = {
        payment_type: paymentMethodForm.payment_type,
        account_holder_name: paymentMethodForm.account_holder_name,
        is_default: paymentMethodForm.is_default,
      };

      // Add type-specific fields
      if (paymentMethodForm.payment_type === 'mobile_money') {
        payload.mobile_provider = paymentMethodForm.mobile_provider;
        payload.mobile_number = paymentMethodForm.mobile_number;
      } else if (paymentMethodForm.payment_type === 'bank_transfer') {
        payload.bank_name = paymentMethodForm.bank_name;
        payload.account_number = paymentMethodForm.account_number;
        if (paymentMethodForm.branch_name) payload.branch_name = paymentMethodForm.branch_name;
        if (paymentMethodForm.swift_code) payload.swift_code = paymentMethodForm.swift_code;
      } else if (paymentMethodForm.payment_type === 'paypal') {
        payload.paypal_email = paymentMethodForm.paypal_email;
      }

      const response = await walletApi.addPaymentMethod(payload);
      if (response.success) {
        toast.success('Payment method added successfully');
        setShowPaymentMethodDialog(false);
        setPaymentMethodForm({
          payment_type: 'mobile_money',
          account_holder_name: '',
          mobile_provider: 'M-Pesa',
          mobile_number: '',
          bank_name: '',
          account_number: '',
          branch_name: '',
          swift_code: '',
          paypal_email: '',
          is_default: false,
        });
        loadPaymentMethods();
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        setPaymentMethodErrors(error.response.data.errors);
        toast.error(error.response.data.message || 'Please fix the validation errors');
      } else {
        toast.error(error.response?.data?.message || 'Failed to add payment method');
      }
    } finally {
      setSavingPaymentMethod(false);
    }
  };

  const handleDeletePaymentMethod = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment method?')) {
      return;
    }
    
    try {
      const response = await walletApi.deletePaymentMethod(id);
      if (response.success) {
        toast.success('Payment method deleted successfully');
        loadPaymentMethods();
      }
    } catch (error) {
      toast.error('Failed to delete payment method');
    }
  };

  const handleSetDefaultPaymentMethod = async (id) => {
    try {
      const response = await walletApi.updatePaymentMethod(id, { is_default: true });
      if (response.success) {
        toast.success('Default payment method updated');
        loadPaymentMethods();
      }
    } catch (error) {
      toast.error('Failed to update payment method');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await walletApi.refreshBalances();
      if (response.success) {
        toast.success('Balances refreshed');
        loadWalletData();
      }
    } catch (error) {
      toast.error('Failed to refresh balances');
    } finally {
      setRefreshing(false);
    }
  };

  const handleWithdrawal = async (e) => {
    e.preventDefault();
    setWithdrawing(true);
    
    try {
      const payload = {
        amount: withdrawalForm.amount,
        payment_method_id: withdrawalForm.payment_method_id,
      };
      
      // Add event-based withdrawal fields if event is selected
      if (withdrawalForm.event_id) {
        payload.event_id = withdrawalForm.event_id;
        payload.withdrawal_type = withdrawalForm.withdrawal_type;
      }
      
      const response = await walletApi.requestWithdrawal(payload);
      if (response.success) {
        toast.success('Withdrawal requested successfully');
        setShowWithdrawDialog(false);
        setWithdrawalForm({
          amount: '',
          payment_method_id: null,
          use_saved_method: true,
          event_id: null,
          withdrawal_type: null,
        });
        loadWalletData();
        if (activeTab === 'withdrawals') {
          loadWithdrawals();
        }
        if (activeTab === 'events') {
          loadEvents();
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit withdrawal request');
    } finally {
      setWithdrawing(false);
    }
  };

  // Load payment methods when withdrawal dialog opens
  useEffect(() => {
    if (showWithdrawDialog && paymentMethods.length === 0) {
      loadPaymentMethods();
    }
  }, [showWithdrawDialog]);

  const getTransactionIcon = (type) => {
    switch(type) {
      case 'sale':
      case 'earning':
        return <ArrowDownRight className="h-4 w-4 text-emerald-400" />;
      case 'withdrawal':
      case 'commission':
      case 'processing_fee':
        return <ArrowUpRight className="h-4 w-4 text-red-400" />;
      default:
        return <Activity className="h-4 w-4 text-zinc-400" />;
    }
  };

  const getWithdrawalStatusBadge = (status) => {
    const styles = {
      'requested': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      'approved': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'disbursed': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      'rejected': 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    
    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status] || styles['requested']}`}>
        {status}
      </span>
    );
  };

  const BalanceCard = ({ icon: Icon, label, value, color, subtext }) => (
    <div className="bg-zinc-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${color} opacity-[0.03] group-hover:opacity-[0.06] transition-opacity rounded-bl-full`} />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-zinc-900 border border-white/5">
            <Icon className="h-5 w-5 text-white" />
          </div>
          <span className="text-sm text-zinc-400 font-medium">{label}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white tracking-tight">
            KES {parseFloat(value || 0).toLocaleString()}
          </span>
        </div>
        {subtext && <p className="text-xs text-zinc-500 mt-2">{subtext}</p>}
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'transactions', label: 'Transactions', icon: ArrowRightLeft },
    { id: 'withdrawals', label: 'Withdrawals', icon: History },
    { id: 'payment-methods', label: 'Payouts', icon: CreditCard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

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
        
        {/* Header Section - Mobile Optimized */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Wallet</h1>
            <p className="text-zinc-400 text-sm">Manage earnings, payouts, and view financial history.</p>
          </div>
          <div className="flex flex-row gap-3 w-full md:w-auto">
            <Button 
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="flex-1 md:flex-none border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 h-10 px-4 rounded-xl"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Sync
            </Button>
            <Button 
              onClick={() => setShowWithdrawDialog(true)}
              className="flex-1 md:flex-none bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all h-10 px-4 rounded-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Withdraw
            </Button>
          </div>
        </div>

        {/* Balance Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <BalanceCard 
              icon={Wallet} 
              label="Available Balance" 
              value={statistics.available_balance} 
              color="from-emerald-500 to-teal-500"
              subtext="Ready for withdrawal"
            />
            <BalanceCard 
              icon={Clock} 
              label="Pending Balance" 
              value={statistics.pending_balance} 
              color="from-amber-500 to-orange-500"
              subtext="Available 24 hours after event ends"
            />
            <BalanceCard 
              icon={TrendingUp} 
              label="Lifetime Earnings" 
              value={statistics.total_earnings} 
              color="from-blue-500 to-indigo-500"
              subtext="Total revenue generated"
            />
          </div>
        )}

        {/* Navigation Tabs - Scrollable on Mobile */}
        <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex border-b border-white/5 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setCurrentPage(1);
                  }}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all relative ${
                    isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : ''}`} />
                  {tab.label}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && statistics && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white mb-4">Financial Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <Send className="h-4 w-4 text-zinc-500" />
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Total Withdrawn</span>
                  </div>
                  <p className="text-xl font-bold text-white">KES {parseFloat(statistics.total_withdrawn || 0).toLocaleString()}</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <Activity className="h-4 w-4 text-zinc-500" />
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Platform Fees</span>
                  </div>
                  <p className="text-xl font-bold text-white">KES {parseFloat(statistics.total_fees || 0).toLocaleString()}</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="h-4 w-4 text-zinc-500" />
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Net Profit</span>
                  </div>
                  <p className="text-xl font-bold text-white">
                    KES {(parseFloat(statistics.total_earnings || 0) - parseFloat(statistics.total_fees || 0)).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Event-Based Withdrawals</h3>
                  <p className="text-sm text-zinc-400">View withdrawal eligibility and available balance per event</p>
                </div>
              </div>

              {events.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-xl">
                  <Calendar className="h-12 w-12 text-zinc-600 mb-4" />
                  <p className="text-zinc-400 mb-2">No events with revenue found</p>
                  <p className="text-xs text-zinc-500">Events will appear here once they generate ticket sales</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {events.map((event) => {
                    const daysUntilEvent = event.days_until_event;
                    const isUpcoming = event.event_status === 'upcoming';
                    const isConcluded = event.event_status === 'concluded';
                    const canWithdraw = event.withdrawal_eligibility?.can_withdraw;
                    const withdrawalType = event.withdrawal_eligibility?.withdrawal_type;
                    const maxAmount = event.withdrawal_eligibility?.max_amount || 0;
                    const restrictions = event.withdrawal_eligibility?.restrictions || '';

                    return (
                      <div 
                        key={event.event_id}
                        className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 hover:bg-zinc-900/70 transition-all"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                          {/* Event Info */}
                          <div className="flex-1 space-y-3">
                            <div>
                              <h4 className="text-lg font-bold text-white mb-1">{event.event_title}</h4>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="h-4 w-4" />
                                  <span>{new Date(event.event_date).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}</span>
                                </div>
                                {isUpcoming && daysUntilEvent !== null && (
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="h-4 w-4" />
                                    <span className="font-medium">
                                      {daysUntilEvent === 0 ? 'Today' : 
                                       daysUntilEvent === 1 ? 'Tomorrow' : 
                                       `${daysUntilEvent} days away`}
                                    </span>
                                  </div>
                                )}
                                {isConcluded && (
                                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20">
                                    CONCLUDED
                                  </span>
                                )}
                                {event.is_legacy_event && (
                                  <span className="px-2 py-0.5 bg-zinc-700/60 text-zinc-400 text-xs font-bold rounded-full border border-zinc-600/40">
                                    LEGACY
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Financial Summary */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Total Revenue</p>
                                <p className="text-sm font-bold text-white">KES {parseFloat(event.total_revenue || 0).toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Platform Fee (5%)</p>
                                <p className="text-sm font-bold text-zinc-400">KES {parseFloat(event.platform_fee || 0).toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Withdrawn</p>
                                <p className="text-sm font-bold text-red-400">KES {parseFloat(event.withdrawn_amount || 0).toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Available</p>
                                <p className="text-sm font-bold text-emerald-400">KES {parseFloat(event.available_balance || 0).toLocaleString()}</p>
                              </div>
                            </div>

                            {/* Withdrawal Eligibility Status */}
                            <div className={`p-4 rounded-lg border ${
                              canWithdraw 
                                ? 'bg-emerald-500/5 border-emerald-500/20' 
                                : 'bg-amber-500/5 border-amber-500/20'
                            }`}>
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${
                                  canWithdraw ? 'bg-emerald-500/10' : 'bg-amber-500/10'
                                }`}>
                                  {canWithdraw ? (
                                    <TrendingUp className={`h-4 w-4 ${canWithdraw ? 'text-emerald-400' : 'text-amber-400'}`} />
                                  ) : (
                                    <Clock className="h-4 w-4 text-amber-400" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className={`text-sm font-bold mb-1 ${
                                    canWithdraw ? 'text-emerald-400' : 'text-amber-400'
                                  }`}>
                                    {canWithdraw ? 'Withdrawal Available' : 'Withdrawal Restricted'}
                                  </p>
                                  <p className="text-xs text-zinc-400">
                                    {restrictions}
                                  </p>
                                  {canWithdraw && withdrawalType === 'pre_event' && (
                                    <p className="text-xs text-zinc-500 mt-1">
                                      Maximum: KES {parseFloat(maxAmount).toLocaleString()} (30% of net revenue)
                                    </p>
                                  )}
                                  {canWithdraw && withdrawalType === 'post_event' && (
                                    <p className="text-xs text-zinc-500 mt-1">
                                      You can withdraw any amount up to your available balance
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Withdraw Button */}
                          <div className="flex-shrink-0">
                            <Button
                              onClick={() => {
                                setWithdrawalForm({
                                  amount: '',
                                  payment_method_id: null,
                                  use_saved_method: true,
                                  event_id: event.event_id,
                                  withdrawal_type: withdrawalType,
                                });
                                setShowWithdrawDialog(true);
                              }}
                              disabled={!canWithdraw || event.available_balance <= 0}
                              className={`w-full lg:w-auto ${
                                canWithdraw && event.available_balance > 0
                                  ? 'bg-primary hover:bg-primary/90'
                                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                              }`}
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Withdraw
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="bg-zinc-900/30 border border-white/5 rounded-xl overflow-hidden">
              {transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                  <ArrowRightLeft className="h-10 w-10 mb-3 opacity-20" />
                  <p className="text-sm">No transaction history found</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="p-4 hover:bg-zinc-900/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center group-hover:border-white/10 transition-colors">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{transaction.description}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-zinc-500">
                            <span className="capitalize">{transaction.type.replace('_', ' ')}</span>
                            {transaction.event && (
                              <>
                                <span className="hidden sm:inline w-1 h-1 rounded-full bg-zinc-700" />
                                <span className="truncate">{transaction.event.title}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:block sm:text-right pl-14 sm:pl-0">
                        <p className={`text-sm font-bold font-mono ${
                          ['sale', 'earning'].includes(transaction.type) ? 'text-emerald-400' : 'text-zinc-300'
                        }`}>
                          {['sale', 'earning'].includes(transaction.type) ? '+' : '-'} 
                          KES {parseFloat(Math.abs(transaction.amount)).toLocaleString()}
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Withdrawals Tab */}
          {activeTab === 'withdrawals' && (
            <div className="bg-zinc-900/30 border border-white/5 rounded-xl overflow-hidden">
              {withdrawals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                  <Send className="h-10 w-10 mb-3 opacity-20" />
                  <p className="text-sm">No withdrawal requests yet</p>
                  <Button variant="link" onClick={() => setShowWithdrawDialog(true)} className="text-primary mt-2">
                    Request Payout
                  </Button>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-zinc-900/50 border-b border-white/5">
                        <tr>
                          <th className="text-left px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                            Payment Method
                          </th>
                          <th className="text-left px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="text-left px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="text-left px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                            Requested
                          </th>
                          <th className="text-left px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                            Processed
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {withdrawals.map((withdrawal) => {
                          const getPaymentIcon = () => {
                            if (withdrawal.payment_method === 'mpesa') return <Smartphone className="h-4 w-4 text-green-500" />;
                            if (withdrawal.payment_method === 'paypal') return <Mail className="h-4 w-4 text-blue-500" />;
                            return <Landmark className="h-4 w-4 text-blue-500" />;
                          };
                          
                          const getPaymentLabel = () => {
                            if (withdrawal.payment_method === 'mpesa') return 'M-Pesa';
                            if (withdrawal.payment_method === 'paypal') return 'PayPal';
                            return 'Bank Transfer';
                          };

                          const getProcessedDate = () => {
                            if (withdrawal.disbursed_at) return new Date(withdrawal.disbursed_at).toLocaleDateString();
                            if (withdrawal.approved_at) return new Date(withdrawal.approved_at).toLocaleDateString();
                            if (withdrawal.rejected_at) return new Date(withdrawal.rejected_at).toLocaleDateString();
                            return '-';
                          };

                          return (
                            <tr key={withdrawal.id} className="hover:bg-zinc-900/50 transition-colors group">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center group-hover:border-white/10 transition-colors">
                                    {getPaymentIcon()}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-white">{getPaymentLabel()}</p>
                                    <p className="text-xs text-zinc-500">ID: #{withdrawal.id}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <p className="text-sm font-bold text-white font-mono">
                                  KES {parseFloat(withdrawal.amount).toLocaleString()}
                                </p>
                              </td>
                              <td className="px-6 py-4">
                                {getWithdrawalStatusBadge(withdrawal.status)}
                              </td>
                              <td className="px-6 py-4">
                                <p className="text-sm text-zinc-300">
                                  {new Date(withdrawal.requested_at).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-zinc-500">
                                  {new Date(withdrawal.requested_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </td>
                              <td className="px-6 py-4">
                                <p className="text-sm text-zinc-300">
                                  {getProcessedDate()}
                                </p>
                                {withdrawal.rejection_reason && (
                                  <p className="text-xs text-red-400 mt-1">
                                    {withdrawal.rejection_reason}
                                  </p>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden divide-y divide-white/5">
                    {withdrawals.map((withdrawal) => {
                      const getPaymentIcon = () => {
                        if (withdrawal.payment_method === 'mpesa') return <Smartphone className="h-4 w-4 text-green-500" />;
                        if (withdrawal.payment_method === 'paypal') return <Mail className="h-4 w-4 text-blue-500" />;
                        return <Landmark className="h-4 w-4 text-blue-500" />;
                      };
                      
                      const getPaymentLabel = () => {
                        if (withdrawal.payment_method === 'mpesa') return 'M-Pesa';
                        if (withdrawal.payment_method === 'paypal') return 'PayPal';
                        return 'Bank Transfer';
                      };

                      return (
                        <div key={withdrawal.id} className="p-4 hover:bg-zinc-900/50 transition-colors">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center">
                                {getPaymentIcon()}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">{getPaymentLabel()}</p>
                                <p className="text-xs text-zinc-500">
                                  {new Date(withdrawal.requested_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            {getWithdrawalStatusBadge(withdrawal.status)}
                          </div>
                          <div className="flex items-center justify-between pl-13">
                            <p className="text-sm font-bold text-white font-mono">
                              KES {parseFloat(withdrawal.amount).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Payment Methods Tab - Redesigned */}
          {activeTab === 'payment-methods' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <p className="text-sm text-zinc-400">Setup how you receive your payouts</p>
                <Button 
                  onClick={() => setShowPaymentMethodDialog(true)}
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payouts
                </Button>
              </div>

              {paymentMethods.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-xl">
                  <CreditCard className="h-12 w-12 text-zinc-600 mb-4" />
                  <p className="text-zinc-400 mb-4">No payouts saved yet</p>
                  <Button onClick={() => setShowPaymentMethodDialog(true)} variant="outline" className="border-zinc-700">
                    Add Your First Payout
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Card Design */}
                  {paymentMethods.map((method) => (
                    <div 
                      key={method.id}
                      className={`relative aspect-[1.586/1] rounded-2xl p-6 flex flex-col justify-between overflow-hidden shadow-2xl transition-all duration-300 hover:scale-[1.02] ${
                        method.payment_type === 'mpesa' || method.payment_type === 'mobile_money'
                          ? 'bg-gradient-to-br from-green-900 via-emerald-900 to-green-950 border border-emerald-500/20' 
                          : method.payment_type === 'paypal'
                          ? 'bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-950 border border-blue-500/20'
                          : 'bg-gradient-to-br from-zinc-800 via-zinc-900 to-black border border-white/10'
                      }`}
                    >
                      {/* Background Noise/Decoration */}
                      <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
                      <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-3xl" />

                      {/* Header */}
                      <div className="relative z-10 flex justify-between items-start">
                        <Cpu className="h-8 w-8 text-white/50" strokeWidth={1.5} />
                        <div className="text-right">
                          <span className="block text-lg font-bold text-white italic tracking-tighter">
                            {method.payment_type === 'mobile_money' ? 'M-PESA' : method.payment_type === 'paypal' ? 'PayPal' : 'BANK'}
                          </span>
                          {method.is_default && (
                            <span className="text-[10px] font-bold text-black bg-white/90 px-2 py-0.5 rounded shadow-sm">
                              DEFAULT
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="relative z-10 space-y-1">
                        <div className="text-white/60 text-xs font-mono uppercase">
                          {method.payment_type === 'bank_transfer' ? 'Account Number' : 'Account Identifier'}
                        </div>
                        <div className="text-lg sm:text-xl text-white font-mono tracking-widest truncate shadow-black drop-shadow-md">
                          {method.payment_type === 'mobile_money' ? method.mobile_number : 
                           method.payment_type === 'paypal' ? method.paypal_email : 
                           method.account_number}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="relative z-10 flex justify-between items-end">
                        <div>
                          <div className="text-[10px] text-white/50 uppercase">Card Holder</div>
                          <div className="text-sm font-medium text-white truncate max-w-[150px]">{method.account_holder_name}</div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 rounded-full">
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-zinc-950 border-zinc-800 text-white">
                            {!method.is_default && (
                              <DropdownMenuItem onClick={() => handleSetDefaultPaymentMethod(method.id)}>
                                <Star className="h-4 w-4 mr-2" /> Make Default
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleDeletePaymentMethod(method.id)} className="text-red-400 focus:text-red-400">
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}

                  {/* Add New Placeholder Card */}
                  <button
                    onClick={() => setShowPaymentMethodDialog(true)}
                    className="aspect-[1.586/1] rounded-2xl border-2 border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-900/20 hover:bg-zinc-900/50 flex flex-col items-center justify-center gap-3 transition-all group"
                  >
                    <div className="h-12 w-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Plus className="h-6 w-6 text-zinc-500 group-hover:text-white" />
                    </div>
                    <span className="text-sm font-medium text-zinc-500 group-hover:text-zinc-300">Add New Payout</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && analytics && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-2">Event Performance</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white">{analytics.total_events}</span>
                    <span className="text-sm text-zinc-500">Active Events</span>
                  </div>
                </div>
                {/* ... other stats similar to prev ... */}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Notification Preferences</h3>
                  <p className="text-sm text-zinc-400">Manage your email notification settings for financial transactions</p>
                </div>
              </div>

              {notificationPreferences === null ? (
                <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-xl">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                </div>
              ) : (
                <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 space-y-6">
                  {/* Financial Transactions Master Toggle */}
                  <div className="pb-6 border-b border-white/5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                          <Bell className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base font-bold text-white mb-1">Financial Transaction Notifications</h4>
                          <p className="text-sm text-zinc-400">
                            Receive email notifications for all financial activities including withdrawals, disbursements, and rejections
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleUpdateNotificationPreference('financial_transactions', !notificationPreferences.financial_transactions)}
                        disabled={savingPreferences}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-zinc-900 ${
                          notificationPreferences.financial_transactions ? 'bg-primary' : 'bg-zinc-700'
                        } ${savingPreferences ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notificationPreferences.financial_transactions ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Individual Notification Settings */}
                  <div className="space-y-4">
                    <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Specific Notifications</p>
                    
                    {/* Withdrawal Disbursed */}
                    <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-zinc-900/50 border border-white/5">
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-white mb-1">Withdrawal Disbursed</h5>
                        <p className="text-xs text-zinc-400">
                          Get notified when your withdrawal has been processed and funds have been sent to your account
                        </p>
                      </div>
                      <button
                        onClick={() => handleUpdateNotificationPreference('withdrawal_disbursed', !notificationPreferences.withdrawal_disbursed)}
                        disabled={savingPreferences || !notificationPreferences.financial_transactions}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-zinc-900 ${
                          notificationPreferences.withdrawal_disbursed && notificationPreferences.financial_transactions ? 'bg-primary' : 'bg-zinc-700'
                        } ${savingPreferences || !notificationPreferences.financial_transactions ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notificationPreferences.withdrawal_disbursed && notificationPreferences.financial_transactions ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Withdrawal Rejected */}
                    <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-zinc-900/50 border border-white/5">
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-white mb-1">Withdrawal Rejected</h5>
                        <p className="text-xs text-zinc-400">
                          Get notified when your withdrawal request has been rejected with the reason for rejection
                        </p>
                      </div>
                      <button
                        onClick={() => handleUpdateNotificationPreference('withdrawal_rejected', !notificationPreferences.withdrawal_rejected)}
                        disabled={savingPreferences || !notificationPreferences.financial_transactions}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-zinc-900 ${
                          notificationPreferences.withdrawal_rejected && notificationPreferences.financial_transactions ? 'bg-primary' : 'bg-zinc-700'
                        } ${savingPreferences || !notificationPreferences.financial_transactions ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notificationPreferences.withdrawal_rejected && notificationPreferences.financial_transactions ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Withdrawal Approved */}
                    <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-zinc-900/50 border border-white/5">
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-white mb-1">Withdrawal Approved</h5>
                        <p className="text-xs text-zinc-400">
                          Get notified when your withdrawal request has been approved by an administrator
                        </p>
                      </div>
                      <button
                        onClick={() => handleUpdateNotificationPreference('withdrawal_approved', !notificationPreferences.withdrawal_approved)}
                        disabled={savingPreferences || !notificationPreferences.financial_transactions}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-zinc-900 ${
                          notificationPreferences.withdrawal_approved && notificationPreferences.financial_transactions ? 'bg-primary' : 'bg-zinc-700'
                        } ${savingPreferences || !notificationPreferences.financial_transactions ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notificationPreferences.withdrawal_approved && notificationPreferences.financial_transactions ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-400 font-medium mb-1">Email Notifications</p>
                        <p className="text-xs text-zinc-400">
                          All notifications will be sent to your registered email address. Make sure your email is up to date in your profile settings.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {(activeTab === 'transactions' || activeTab === 'withdrawals') && totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="border-zinc-700 text-zinc-300 hover:text-white"
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
                className="border-zinc-700 text-zinc-300 hover:text-white"
              >
                Next
              </Button>
            </div>
          )}
        </div>

        {/* Withdrawal Dialog */}
        <Dialog 
          open={showWithdrawDialog} 
          onOpenChange={(open) => {
            setShowWithdrawDialog(open);
            if (!open) {
              // Reset form when closing
              setWithdrawalForm({
                amount: '',
                payment_method_id: null,
                use_saved_method: true,
                event_id: null,
                withdrawal_type: null,
              });
            }
          }}
        >
          <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-md w-full shadow-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                Request Withdrawal
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleWithdrawal} className="space-y-5 mt-4">
              {/* Event Selection (if opened from Events tab) */}
              {withdrawalForm.event_id && events.length > 0 && (
                <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                  {(() => {
                    const selectedEvent = events.find(e => e.event_id === withdrawalForm.event_id);
                    if (!selectedEvent) return null;
                    
                    return (
                      <>
                        <p className="text-xs text-zinc-500 uppercase font-bold mb-2">Selected Event</p>
                        <p className="text-sm font-bold text-white mb-1">{selectedEvent.event_title}</p>
                        <p className="text-xs text-zinc-400 mb-3">
                          {new Date(selectedEvent.event_date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800">
                          <div>
                            <p className="text-xs text-zinc-500 mb-1">Available Balance</p>
                            <p className="text-lg font-bold text-emerald-400">
                              KES {parseFloat(selectedEvent.available_balance || 0).toLocaleString()}
                            </p>
                          </div>
                          {withdrawalForm.withdrawal_type === 'pre_event' && (
                            <div>
                              <p className="text-xs text-zinc-500 mb-1">Max Withdrawal</p>
                              <p className="text-lg font-bold text-amber-400">
                                KES {parseFloat(selectedEvent.withdrawal_eligibility?.max_amount || 0).toLocaleString()}
                              </p>
                            </div>
                          )}
                        </div>
                        {withdrawalForm.withdrawal_type === 'pre_event' && (
                          <div className="mt-3 p-2 bg-amber-500/10 border border-amber-500/20 rounded text-xs text-amber-400">
                            Pre-event withdrawal: Maximum 30% of net revenue
                          </div>
                        )}
                        {withdrawalForm.withdrawal_type === 'post_event' && (
                          <div className="mt-3 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-xs text-emerald-400">
                            {selectedEvent?.is_legacy_event
                              ? 'Post-event withdrawal: Full balance available'
                              : 'Post-event withdrawal: Full balance available (24 hours after event)'}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}

              {/* General withdrawal (no event selected) */}
              {!withdrawalForm.event_id && (
                <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                  <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Available to Withdraw</p>
                  <p className="text-2xl font-bold text-white">KES {parseFloat(statistics?.available_balance || 0).toLocaleString()}</p>
                </div>
              )}

              {/* Event Selection Dropdown (if not pre-selected) */}
              {!withdrawalForm.event_id && events.length > 0 && (
                <div>
                  <label className="text-xs text-zinc-400 font-bold uppercase mb-2 block">
                    Select Event (Optional)
                  </label>
                  <select
                    value={withdrawalForm.event_id || ''}
                    onChange={(e) => {
                      const eventId = e.target.value ? parseInt(e.target.value) : null;
                      const selectedEvent = events.find(ev => ev.event_id === eventId);
                      setWithdrawalForm({
                        ...withdrawalForm,
                        event_id: eventId,
                        withdrawal_type: selectedEvent?.withdrawal_eligibility?.withdrawal_type || null,
                        amount: '', // Reset amount when changing event
                      });
                    }}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-primary"
                  >
                    <option value="">General Withdrawal (All Events)</option>
                    {events.filter(e => e.withdrawal_eligibility?.can_withdraw && e.available_balance > 0).map(event => (
                      <option key={event.event_id} value={event.event_id}>
                        {event.event_title} - KES {parseFloat(event.available_balance).toLocaleString()}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-zinc-500 mt-2">
                    Select a specific event for event-based withdrawal rules, or leave blank for general withdrawal
                  </p>
                </div>
              )}

              {/* Amount Input */}
              {(() => {
                const selectedEvent = events.find(e => e.event_id === withdrawalForm.event_id);
                const isLegacy = selectedEvent?.is_legacy_event ?? false;
                const minAmt = selectedEvent
                  ? (selectedEvent.withdrawal_eligibility?.min_amount ?? (isLegacy ? 100 : 500))
                  : 500;
                const fee = selectedEvent
                  ? (selectedEvent.withdrawal_eligibility?.transaction_fee ?? (isLegacy ? 0 : 150))
                  : 150;
                const amount = parseFloat(withdrawalForm.amount) || 0;
                const totalDeducted = amount + fee;

                return (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-zinc-400 font-bold uppercase mb-2 block">Amount (KES)</label>
                      <input
                        type="number"
                        min={minAmt}
                        step="0.01"
                        value={withdrawalForm.amount}
                        onChange={(e) => setWithdrawalForm({ ...withdrawalForm, amount: e.target.value })}
                        required
                        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono text-lg focus:outline-none focus:border-primary placeholder:text-zinc-700"
                        placeholder="0.00"
                      />
                      <p className="text-xs text-zinc-500 mt-2">Minimum withdrawal: KES {minAmt.toLocaleString()}</p>
                    </div>

                    {/* Fee breakdown */}
                    <div className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                      fee > 0
                        ? 'bg-zinc-900 border-zinc-700'
                        : 'bg-zinc-900/50 border-zinc-800'
                    }`}>
                      <div className="flex justify-between text-zinc-400">
                        <span>Withdrawal amount</span>
                        <span className="font-mono">KES {amount > 0 ? amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'}</span>
                      </div>
                      <div className={`flex justify-between ${fee > 0 ? 'text-amber-400' : 'text-zinc-500'}`}>
                        <span>Transaction fee{isLegacy ? ' (legacy event — waived)' : ''}</span>
                        <span className="font-mono">{fee > 0 ? `KES ${fee.toLocaleString()}` : 'KES 0.00'}</span>
                      </div>
                      <div className="flex justify-between text-white font-bold border-t border-zinc-700 pt-1.5 mt-1">
                        <span>Total deducted from wallet</span>
                        <span className="font-mono">KES {amount > 0 ? totalDeducted.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Payment Method Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs text-zinc-400 font-bold uppercase">Select Payment Method</label>
                  {paymentMethods.length > 0 && (
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      onClick={() => {
                        setShowWithdrawDialog(false);
                        setShowPaymentMethodDialog(true);
                      }}
                      className="text-xs text-primary hover:text-primary/80 h-auto p-0"
                    >
                      + Add New
                    </Button>
                  )}
                </div>

                {paymentMethods.length === 0 ? (
                  <div className="p-6 bg-zinc-900/50 border border-dashed border-zinc-800 rounded-xl text-center">
                    <CreditCard className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
                    <p className="text-sm text-zinc-400 mb-3">No payment methods saved</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowWithdrawDialog(false);
                        setShowPaymentMethodDialog(true);
                      }}
                      className="border-zinc-700 text-zinc-300"
                    >
                      Add Payment Method
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {paymentMethods.map((method) => {
                      const isSelected = withdrawalForm.payment_method_id === method.id;
                      const getMethodIcon = () => {
                        if (method.payment_type === 'mobile_money') return <Smartphone className="h-4 w-4" />;
                        if (method.payment_type === 'bank_transfer') return <Landmark className="h-4 w-4" />;
                        return <Mail className="h-4 w-4" />;
                      };
                      
                      const getMethodDetails = () => {
                        if (method.payment_type === 'mobile_money') return method.mobile_number;
                        if (method.payment_type === 'bank_transfer') return `${method.bank_name} - ${method.account_number}`;
                        return method.paypal_email;
                      };

                      return (
                        <div
                          key={method.id}
                          onClick={() => setWithdrawalForm({ ...withdrawalForm, payment_method_id: method.id })}
                          className={`p-4 border rounded-xl cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-primary/10 border-primary text-white'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary/20' : 'bg-zinc-800'}`}>
                              {getMethodIcon()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                                  {method.account_holder_name}
                                </p>
                                {method.is_default && (
                                  <span className="text-[9px] font-bold bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">
                                    DEFAULT
                                  </span>
                                )}
                              </div>
                              <p className={`text-xs truncate ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                                {getMethodDetails()}
                              </p>
                            </div>
                            {isSelected && (
                              <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                <div className="h-2 w-2 rounded-full bg-white" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/5">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowWithdrawDialog(false);
                    setWithdrawalForm({
                      amount: '',
                      payment_method_id: null,
                      use_saved_method: true,
                      event_id: null,
                      withdrawal_type: null,
                    });
                  }}
                  className="flex-1 text-zinc-400 hover:text-white hover:bg-white/5"
                  disabled={withdrawing}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold"
                  disabled={withdrawing || (paymentMethods.length > 0 && !withdrawalForm.payment_method_id)}
                >
                  {withdrawing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Withdrawal'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Payment Method Dialog */}
        <Dialog open={showPaymentMethodDialog} onOpenChange={setShowPaymentMethodDialog}>
          <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-md w-full shadow-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Add Payment Method
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleAddPaymentMethod} className="space-y-4 mt-4">
              {/* Payment Type */}
              <div>
                <label className="text-xs text-zinc-400 font-bold uppercase mb-2 block">Payment Type</label>
                <select
                  value={paymentMethodForm.payment_type}
                  onChange={(e) => {
                    setPaymentMethodForm({ ...paymentMethodForm, payment_type: e.target.value });
                    setPaymentMethodErrors({});
                  }}
                  required
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-primary"
                >
                  <option value="mobile_money">Mobile Money (M-Pesa)</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>

              {/* Account Holder Name - Required for all types */}
              <div>
                <label className="text-xs text-zinc-400 font-bold uppercase mb-2 block">
                  Account Holder Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={paymentMethodForm.account_holder_name}
                  onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, account_holder_name: e.target.value })}
                  required
                  className={`w-full px-4 py-3 bg-zinc-900 border rounded-xl text-white focus:outline-none focus:border-primary placeholder:text-zinc-700 ${
                    paymentMethodErrors.account_holder_name ? 'border-red-500' : 'border-zinc-800'
                  }`}
                  placeholder="Full name as per account"
                />
                {paymentMethodErrors.account_holder_name && (
                  <p className="text-xs text-red-400 mt-1">{paymentMethodErrors.account_holder_name[0]}</p>
                )}
              </div>

              {/* Mobile Money Fields */}
              {paymentMethodForm.payment_type === 'mobile_money' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div>
                    <label className="text-xs text-zinc-400 font-bold uppercase mb-2 block">Provider</label>
                    <select
                      value={paymentMethodForm.mobile_provider}
                      onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, mobile_provider: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-primary"
                    >
                      <option value="M-Pesa">M-Pesa</option>
                      <option value="Airtel Money">Airtel Money</option>
                      <option value="T-Kash">T-Kash</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 font-bold uppercase mb-2 block">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={paymentMethodForm.mobile_number}
                      onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, mobile_number: e.target.value })}
                      required
                      className={`w-full px-4 py-3 bg-zinc-900 border rounded-xl text-white focus:outline-none focus:border-primary placeholder:text-zinc-700 ${
                        paymentMethodErrors.mobile_number ? 'border-red-500' : 'border-zinc-800'
                      }`}
                      placeholder="254712345678"
                    />
                    {paymentMethodErrors.mobile_number && (
                      <p className="text-xs text-red-400 mt-1">{paymentMethodErrors.mobile_number[0]}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Bank Transfer Fields */}
              {paymentMethodForm.payment_type === 'bank_transfer' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div>
                    <label className="text-xs text-zinc-400 font-bold uppercase mb-2 block">
                      Bank Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={paymentMethodForm.bank_name}
                      onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, bank_name: e.target.value })}
                      required
                      className={`w-full px-4 py-3 bg-zinc-900 border rounded-xl text-white focus:outline-none focus:border-primary placeholder:text-zinc-700 ${
                        paymentMethodErrors.bank_name ? 'border-red-500' : 'border-zinc-800'
                      }`}
                      placeholder="e.g., Equity Bank"
                    />
                    {paymentMethodErrors.bank_name && (
                      <p className="text-xs text-red-400 mt-1">{paymentMethodErrors.bank_name[0]}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 font-bold uppercase mb-2 block">
                      Account Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={paymentMethodForm.account_number}
                      onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, account_number: e.target.value })}
                      required
                      className={`w-full px-4 py-3 bg-zinc-900 border rounded-xl text-white focus:outline-none focus:border-primary placeholder:text-zinc-700 ${
                        paymentMethodErrors.account_number ? 'border-red-500' : 'border-zinc-800'
                      }`}
                      placeholder="Account number"
                    />
                    {paymentMethodErrors.account_number && (
                      <p className="text-xs text-red-400 mt-1">{paymentMethodErrors.account_number[0]}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 font-bold uppercase mb-2 block">Branch Name</label>
                    <input
                      type="text"
                      value={paymentMethodForm.branch_name}
                      onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, branch_name: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-primary placeholder:text-zinc-700"
                      placeholder="Branch (optional)"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 font-bold uppercase mb-2 block">SWIFT Code</label>
                    <input
                      type="text"
                      value={paymentMethodForm.swift_code}
                      onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, swift_code: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-primary placeholder:text-zinc-700"
                      placeholder="SWIFT/BIC (optional)"
                    />
                  </div>
                </div>
              )}

              {/* PayPal Fields */}
              {paymentMethodForm.payment_type === 'paypal' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-xs text-zinc-400 font-bold uppercase mb-2 block">
                    PayPal Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={paymentMethodForm.paypal_email}
                    onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, paypal_email: e.target.value })}
                    required
                    className={`w-full px-4 py-3 bg-zinc-900 border rounded-xl text-white focus:outline-none focus:border-primary placeholder:text-zinc-700 ${
                      paymentMethodErrors.paypal_email ? 'border-red-500' : 'border-zinc-800'
                    }`}
                    placeholder="your@email.com"
                  />
                  {paymentMethodErrors.paypal_email && (
                    <p className="text-xs text-red-400 mt-1">{paymentMethodErrors.paypal_email[0]}</p>
                  )}
                </div>
              )}

              {/* Set as Default */}
              <div className="flex items-center gap-3 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                <input
                  type="checkbox"
                  id="is_default"
                  checked={paymentMethodForm.is_default}
                  onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, is_default: e.target.checked })}
                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-primary focus:ring-primary focus:ring-offset-0"
                />
                <label htmlFor="is_default" className="text-sm text-zinc-300 cursor-pointer">
                  Set as default payment method
                </label>
              </div>
              
              <div className="flex gap-3 pt-4 border-t border-white/5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowPaymentMethodDialog(false);
                    setPaymentMethodErrors({});
                  }}
                  className="flex-1 border-zinc-700 text-zinc-300 hover:text-white"
                  disabled={savingPaymentMethod}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={savingPaymentMethod}
                >
                  {savingPaymentMethod ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Method'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default WalletPage;