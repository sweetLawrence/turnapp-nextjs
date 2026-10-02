"use client"

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { promoCodeApi } from '@/lib/services/promoCodeApi';
import { organizerEventApi } from '@/lib/services/organizerEventApi';
import { 
  Tag, Search, Plus, Edit, Trash2, Loader2, Calendar,
  Percent, DollarSign, CheckCircle2, XCircle, TrendingUp,
  TicketPercent, Copy, ArrowRight, Filter, MoreVertical,
  BarChart3, Power, PowerOff, Users, ShoppingCart, Activity
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu";

const PromoCodesPage = () => {
  const [promoCodes, setPromoCodes] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingPromoCode, setEditingPromoCode] = useState(null);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(10);
  const [totalPromoCodes, setTotalPromoCodes] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_amount: '',
    valid_from: '',
    valid_to: '',
    usage_limit: '',
    status: 'active',
    event_ids: [],
  });

  useEffect(() => {
    loadPromoCodes();
    loadEvents();
  }, [currentPage]);

  const loadPromoCodes = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: perPage,
        search: searchTerm,
      };
      
      const response = await promoCodeApi.getPromoCodes(params);
      if (response.success) {
        setPromoCodes(response.data);
        setTotalPages(response.meta.last_page);
        setTotalPromoCodes(response.meta.total);
      }
    } catch (error) {
      console.error('Error loading promo codes:', error);
      toast.error('Failed to load promo codes');
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      const response = await organizerEventApi.getEvents({ per_page: 100 });
      if (response.success) {
        setEvents(response.data);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEventSelection = (eventId) => {
    setFormData(prev => {
      const eventIds = prev.event_ids.includes(eventId)
        ? prev.event_ids.filter(id => id !== eventId)
        : [...prev.event_ids, eventId];
      return { ...prev, event_ids: eventIds };
    });
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discount_type: 'percentage',
      discount_amount: '',
      valid_from: '',
      valid_to: '',
      usage_limit: '',
      status: 'active',
      event_ids: [],
    });
    setEditingPromoCode(null);
  };

  const handleEdit = (promoCode) => {
    setEditingPromoCode(promoCode);
    
    // Format dates properly for date inputs (YYYY-MM-DD)
    const formatDateForInput = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };
    
    setFormData({
      code: promoCode.code,
      discount_type: promoCode.discount_type,
      discount_amount: promoCode.discount_amount,
      valid_from: formatDateForInput(promoCode.valid_from),
      valid_to: formatDateForInput(promoCode.valid_to),
      usage_limit: promoCode.usage_limit || '',
      status: promoCode.status,
      event_ids: promoCode.events?.map(e => e.id) || [],
    });
    setShowDialog(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const data = {
        ...formData,
        usage_limit: formData.usage_limit || null,
      };

      if (editingPromoCode) {
        const response = await promoCodeApi.updatePromoCode(editingPromoCode.id, data);
        if (response.success) {
          toast.success('Promo code updated');
          setShowDialog(false);
          resetForm();
          loadPromoCodes();
        }
      } else {
        const response = await promoCodeApi.createPromoCode(data);
        if (response.success) {
          toast.success('Promo code created');
          setShowDialog(false);
          resetForm();
          loadPromoCodes();
        }
      }
    } catch (error) {
      console.error('Error saving promo code:', error);
      toast.error(error.response?.data?.message || 'Failed to save promo code');
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete promo code "${code}"?`)) return;
    try {
      const response = await promoCodeApi.deletePromoCode(id);
      if (response.success) {
        toast.success('Promo code deleted');
        loadPromoCodes();
      }
    } catch (error) {
      toast.error('Failed to delete promo code');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const response = await promoCodeApi.togglePromoCodeStatus(id);
      if (response.success) {
        toast.success(response.message);
        loadPromoCodes();
      }
    } catch (error) {
      toast.error('Failed to toggle promo code status');
    }
  };

  const handleViewAnalytics = async (promoCode) => {
    setLoadingAnalytics(true);
    setShowAnalyticsModal(true);
    setAnalyticsData(null);
    
    try {
      const response = await promoCodeApi.getPromoCodeAnalytics(promoCode.id);
      if (response.success) {
        setAnalyticsData(response.data);
      }
    } catch (error) {
      toast.error('Failed to load analytics');
      setShowAnalyticsModal(false);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  };

  const getStatusBadge = (status) => {
    const isActive = status === 'active';
    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${
        isActive 
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
      }`}>
        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-400'}`} />
        {status}
      </span>
    );
  };

  // Stat Card Component
  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-zinc-900/50 backdrop-blur-sm border border-white/5 rounded-xl p-5 flex items-center gap-4 hover:border-white/10 transition-colors">
      <div className={`p-3 rounded-lg bg-zinc-900 border border-white/5 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">{label}</p>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto pb-20 space-y-8 animate-in fade-in duration-500">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Promotions</h1>
            <p className="text-zinc-400 text-sm">Create discounts to boost ticket sales and track performance.</p>
          </div>
          
          <Dialog open={showDialog} onOpenChange={(open) => {
            setShowDialog(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 rounded-xl h-11 px-6">
                <Plus className="h-4 w-4 mr-2" />
                Create Code
              </Button>
            </DialogTrigger>
            
            {/* Create/Edit Modal */}
            <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-2xl shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <TicketPercent className="h-5 w-5 text-primary" />
                  {editingPromoCode ? 'Edit Promo Code' : 'Create New Discount'}
                </DialogTitle>
                <p className="text-sm text-zinc-500">
                  Configure the discount details and validity.
                </p>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Code Input */}
                  <div className="col-span-full md:col-span-1">
                    <label className="text-xs text-zinc-400 font-medium uppercase mb-2 block">Promo Code</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="code"
                        value={formData.code}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-4 pr-10 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 uppercase font-mono tracking-wide placeholder:text-zinc-700 transition-all"
                        placeholder="SUMMER2024"
                      />
                      <Tag className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                    </div>
                  </div>
                  
                  {/* Usage Limit */}
                  <div className="col-span-full md:col-span-1">
                    <label className="text-xs text-zinc-400 font-medium uppercase mb-2 block">Max Uses</label>
                    <input
                      type="number"
                      name="usage_limit"
                      value={formData.usage_limit}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-primary/50 transition-all placeholder:text-zinc-700"
                      placeholder="Unlimited"
                    />
                  </div>

                  {/* Discount Type & Amount */}
                  <div className="col-span-full grid grid-cols-2 gap-4 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                    <div>
                      <label className="text-xs text-zinc-500 mb-2 block">Type</label>
                      <select
                        name="discount_type"
                        value={formData.discount_type}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-zinc-700 cursor-pointer"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (KES)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 mb-2 block">Amount</label>
                      <div className="relative">
                        <input
                          type="number"
                          name="discount_amount"
                          value={formData.discount_amount}
                          onChange={handleInputChange}
                          required
                          min="0"
                          step="0.01"
                          className="w-full pl-3 pr-8 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-primary/50"
                          placeholder="0"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">
                          {formData.discount_type === 'percentage' ? '%' : 'KES'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Validity Dates */}
                  <div>
                    <label className="text-xs text-zinc-400 font-medium uppercase mb-2 block">Valid From</label>
                    <input
                      type="date"
                      name="valid_from"
                      value={formData.valid_from}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-primary/50 transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-zinc-400 font-medium uppercase mb-2 block">Valid To</label>
                    <input
                      type="date"
                      name="valid_to"
                      value={formData.valid_to}
                      onChange={handleInputChange}
                      required
                      min={formData.valid_from}
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-primary/50 transition-all"
                    />
                  </div>
                  
                  {editingPromoCode && (
                    <div className="col-span-full">
                      <label className="text-xs text-zinc-400 font-medium uppercase mb-2 block">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-primary/50 transition-all cursor-pointer"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  )}

                  {/* Event Selection */}
                  <div className="col-span-full">
                    <label className="text-xs text-zinc-400 font-medium uppercase mb-2 block">Applicable Events</label>
                    <div className="max-h-32 overflow-y-auto space-y-1 p-2 bg-zinc-900 border border-zinc-800 rounded-xl scrollbar-thin scrollbar-thumb-zinc-700">
                      {events.length === 0 ? (
                        <p className="text-sm text-zinc-500 p-2">No events found.</p>
                      ) : (
                        events.map(event => (
                          <label key={event.id} className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors group">
                            <input
                              type="checkbox"
                              checked={formData.event_ids.includes(event.id)}
                              onChange={() => handleEventSelection(event.id)}
                              className="rounded border-zinc-700 bg-zinc-950 text-primary focus:ring-primary/50 h-4 w-4"
                            />
                            <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">{event.title}</span>
                          </label>
                        ))
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-600 mt-2">Leave unchecked to apply to all events.</p>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4 border-t border-white/5">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowDialog(false);
                      resetForm();
                    }}
                    className="flex-1 text-zinc-400 hover:text-white hover:bg-white/5"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-white text-black hover:bg-zinc-200 font-semibold"
                  >
                    {editingPromoCode ? 'Save Changes' : 'Create Code'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* HUD Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard 
            icon={Tag} 
            label="Total Codes" 
            value={totalPromoCodes} 
            color="text-blue-400" 
          />
          <StatCard 
            icon={CheckCircle2} 
            label="Active Codes" 
            value={promoCodes.filter(p => p.status === 'active').length} 
            color="text-emerald-400" 
          />
          <StatCard 
            icon={TrendingUp} 
            label="Redemptions" 
            value={promoCodes.reduce((sum, p) => sum + (p.used_count || 0), 0)} 
            color="text-purple-400" 
          />
          <StatCard 
            icon={DollarSign} 
            label="Discounts Given" 
            value="KES 0" // Placeholder until API provides this data
            color="text-primary" 
          />
        </div>

        {/* Toolbar & Filter */}
        <div className="sticky top-24 z-20 flex gap-3 p-2 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by code..."
              className="w-full pl-10 pr-4 py-2 bg-transparent text-white placeholder-zinc-500 text-sm focus:outline-none"
            />
          </div>
          <div className="h-6 w-px bg-white/10 my-auto" />
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          </div>
        ) : promoCodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl">
            <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4 border border-zinc-800 shadow-lg">
              <Tag className="h-8 w-8 text-zinc-600" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No promo codes yet</h3>
            <p className="text-zinc-500 text-sm max-w-sm text-center mb-6">
              Create your first discount code to start attracting more customers to your events.
            </p>
            <Button 
              onClick={() => setShowDialog(true)}
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:text-white"
            >
              Create New Code
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {promoCodes.map((promoCode) => (
              <div 
                key={promoCode.id}
                className="group relative bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 rounded-xl overflow-hidden transition-all duration-300"
              >
                {/* Active Indicator Strip */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${promoCode.status === 'active' ? 'bg-emerald-500' : 'bg-zinc-700'}`} />

                <div className="flex flex-col md:flex-row md:items-center p-5 pl-7 gap-6">
                  
                  {/* Left: Code Block */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div 
                        className="flex items-center gap-2 px-3 py-1 bg-black/40 rounded-lg border border-white/5 cursor-pointer hover:border-white/20 transition-colors group/code"
                        onClick={() => copyToClipboard(promoCode.code)}
                        title="Click to copy"
                      >
                        <span className="text-lg font-bold text-white font-mono tracking-wider">{promoCode.code}</span>
                        <Copy className="h-3 w-3 text-zinc-600 group-hover/code:text-white transition-colors" />
                      </div>
                      {getStatusBadge(promoCode.status)}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                      <span className="flex items-center gap-1.5 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
                        {promoCode.discount_type === 'percentage' ? (
                          <><Percent className="h-3 w-3 text-primary" /> <span className="text-zinc-200">{promoCode.discount_amount}% OFF</span></>
                        ) : (
                          <><DollarSign className="h-3 w-3 text-primary" /> <span className="text-zinc-200">KES {promoCode.discount_amount} OFF</span></>
                        )}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        {new Date(promoCode.valid_from).toLocaleDateString()} <ArrowRight className="h-3 w-3" /> {new Date(promoCode.valid_to).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Middle: Stats */}
                  <div className="flex items-center gap-8 md:border-l md:border-r border-white/5 px-0 md:px-8 py-2">
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1">Uses</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-white">{promoCode.used_count || 0}</span>
                        <span className="text-xs text-zinc-500">/ {promoCode.usage_limit || '∞'}</span>
                      </div>
                    </div>
                    {/* <div>
                       <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1">Type</p>
                       <span className="text-xs text-zinc-300 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
                        {promoCode.discount_type === 'percentage' ? 'Percent' : 'Fixed'}
                       </span>
                    </div> */}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2">
                    {/* Quick Toggle Status Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleStatus(promoCode.id, promoCode.status)}
                      className={`h-8 w-8 ${
                        promoCode.status === 'active' 
                          ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10' 
                          : 'text-zinc-500 hover:text-zinc-400 hover:bg-zinc-800'
                      }`}
                      title={promoCode.status === 'active' ? 'Deactivate' : 'Activate'}
                    >
                      {promoCode.status === 'active' ? (
                        <Power className="h-4 w-4" />
                      ) : (
                        <PowerOff className="h-4 w-4" />
                      )}
                    </Button>

                    {/* Analytics Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewAnalytics(promoCode)}
                      className="h-8 w-8 text-primary hover:text-primary/80 hover:bg-primary/10"
                      title="View Analytics"
                    >
                      <BarChart3 className="h-4 w-4" />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
                        <DropdownMenuItem onClick={() => handleEdit(promoCode)} className="text-zinc-300 focus:text-white focus:bg-white/10 cursor-pointer">
                          <Edit className="mr-2 h-4 w-4" /> Edit Code
                        </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => copyToClipboard(promoCode.code)} className="text-zinc-300 focus:text-white focus:bg-white/10 cursor-pointer">
                          <Copy className="mr-2 h-4 w-4" /> Copy Code
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(promoCode.id, promoCode.code)}
                          className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Footer */}
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

        {/* Analytics Modal */}
        <Dialog open={showAnalyticsModal} onOpenChange={setShowAnalyticsModal}>
          <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Promo Code Analytics
              </DialogTitle>
              {analyticsData && (
                <p className="text-sm text-zinc-500">
                  Performance insights for <span className="text-white font-mono">{analyticsData.promo_code.code}</span>
                </p>
              )}
            </DialogHeader>

            {loadingAnalytics ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              </div>
            ) : analyticsData ? (
              <div className="space-y-6 mt-4">
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4 text-blue-400" />
                      <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Total Uses</p>
                    </div>
                    <p className="text-2xl font-bold text-white">{analyticsData.analytics.total_uses}</p>
                    <p className="text-[10px] text-zinc-600 mt-1">
                      {analyticsData.promo_code.usage_limit 
                        ? `of ${analyticsData.promo_code.usage_limit} limit` 
                        : 'Unlimited'}
                    </p>
                  </div>

                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingCart className="h-4 w-4 text-emerald-400" />
                      <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Tickets Sold</p>
                    </div>
                    <p className="text-2xl font-bold text-white">{analyticsData.analytics.tickets_sold}</p>
                    <p className="text-[10px] text-zinc-600 mt-1">
                      {analyticsData.analytics.conversion_rate}% conversion
                    </p>
                  </div>

                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Revenue</p>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      KES {analyticsData.analytics.total_revenue.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-zinc-600 mt-1">
                      Avg: KES {analyticsData.analytics.average_order_value.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Percent className="h-4 w-4 text-red-400" />
                      <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Discount Given</p>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      KES {analyticsData.analytics.total_discount.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-zinc-600 mt-1">
                      {analyticsData.promo_code.discount_type === 'percentage' 
                        ? `${analyticsData.promo_code.discount_amount}% off` 
                        : `KES ${analyticsData.promo_code.discount_amount} off`}
                    </p>
                  </div>
                </div>

                {/* Promo Code Details */}
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-4">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Tag className="h-4 w-4 text-zinc-400" />
                    Code Details
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <p className="text-zinc-500 mb-1">Status</p>
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                        analyticsData.promo_code.status === 'active' 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {analyticsData.promo_code.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-zinc-500 mb-1">Valid From</p>
                      <p className="text-white">{new Date(analyticsData.promo_code.valid_from).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500 mb-1">Valid To</p>
                      <p className="text-white">{new Date(analyticsData.promo_code.valid_to).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500 mb-1">Usage</p>
                      <p className="text-white">
                        {analyticsData.promo_code.used_count} / {analyticsData.promo_code.usage_limit || '∞'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Top Events */}
                {analyticsData.top_events && analyticsData.top_events.length > 0 && (
                  <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-zinc-400" />
                      Top Performing Events
                    </h3>
                    <div className="space-y-2">
                      {analyticsData.top_events.map((event, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg border border-zinc-800"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white font-medium truncate">{event.event_title}</p>
                            <p className="text-xs text-zinc-500">{event.usage_count} uses</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-primary">
                              KES {parseFloat(event.revenue).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Usage Over Time */}
                {analyticsData.usage_over_time && analyticsData.usage_over_time.length > 0 && (
                  <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-zinc-400" />
                      Usage Over Time (Last 30 Days)
                    </h3>
                    <div className="space-y-1">
                      {analyticsData.usage_over_time.map((day, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <span className="text-xs text-zinc-500 w-24">
                            {new Date(day.date).toLocaleDateString()}
                          </span>
                          <div className="flex-1 bg-zinc-900 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-primary h-full rounded-full transition-all"
                              style={{ 
                                width: `${(day.count / Math.max(...analyticsData.usage_over_time.map(d => d.count))) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-xs text-white font-medium w-8 text-right">{day.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {analyticsData.analytics.total_uses === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-xl">
                    <Users className="h-12 w-12 text-zinc-700 mb-3" />
                    <p className="text-zinc-500 text-sm">No promotion data yet</p>
                    <p className="text-zinc-600 text-xs mt-1">This promo code hasn't been used</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <XCircle className="h-12 w-12 text-red-500 mb-3" />
                <p className="text-zinc-500 text-sm">Failed to load analytics</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default PromoCodesPage;