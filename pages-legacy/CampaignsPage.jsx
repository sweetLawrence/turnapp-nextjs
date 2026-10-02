"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/DashboardLayout';
import { campaignApi } from '@/lib/services/campaignApi';
import { organizerEventApi } from '@/lib/services/organizerEventApi';
import {
  Users, Search, Plus, Edit, Trash2, Loader2, Calendar,
  DollarSign, TrendingUp, Target, CheckCircle2,
  BarChart3, Pause, Play, Megaphone,
  MoreVertical, ArrowRight, Filter, Activity, Percent, Hash
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
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu";

const CampaignsPage = () => {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(10);
  const [totalCampaigns, setTotalCampaigns] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    event_id: '',
    commission_type: 'percentage',
    commission_value: '',
    requires_approval: true,
    max_affiliates: '',
    starts_at: '',
    ends_at: '',
    is_active: true,
  });

  useEffect(() => {
    loadCampaigns();
    loadEvents();
  }, [currentPage]);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: perPage,
        search: searchTerm,
      };

      const response = await campaignApi.getCampaigns(params);
      if (response.success) {
        setCampaigns(response.data);
        setTotalPages(response.meta.last_page);
        setTotalCampaigns(response.meta.total);
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
      toast.error('Failed to load campaigns');
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

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadCampaigns();
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      event_id: '',
      commission_type: 'percentage',
      commission_value: '',
      requires_approval: true,
      max_affiliates: '',
      starts_at: '',
      ends_at: '',
      is_active: true,
    });
    setEditingCampaign(null);
  };

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const handleEdit = (campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name || '',
      description: campaign.description || '',
      event_id: campaign.event?.id || '',
      commission_type: campaign.commission_type || 'percentage',
      commission_value: campaign.commission_value || '',
      requires_approval: campaign.requires_approval ?? true,
      max_affiliates: campaign.max_affiliates || '',
      starts_at: formatDateForInput(campaign.starts_at),
      ends_at: formatDateForInput(campaign.ends_at),
      is_active: campaign.is_active ?? true,
    });
    setShowDialog(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = {
        name: formData.name,
        description: formData.description || null,
        event_id: formData.event_id,
        commission_type: formData.commission_type,
        commission_value: parseFloat(formData.commission_value),
        requires_approval: formData.requires_approval,
        max_affiliates: formData.max_affiliates ? parseInt(formData.max_affiliates) : null,
        starts_at: formData.starts_at,
        ends_at: formData.ends_at,
      };

      if (editingCampaign) {
        data.is_active = formData.is_active;
        const response = await campaignApi.updateCampaign(editingCampaign.id, data);
        if (response.success) {
          toast.success('Campaign updated');
          setShowDialog(false);
          resetForm();
          loadCampaigns();
        }
      } else {
        const response = await campaignApi.createCampaign(data);
        if (response.success) {
          toast.success('Campaign created');
          setShowDialog(false);
          resetForm();
          loadCampaigns();
        }
      }
    } catch (error) {
      console.error('Error saving campaign:', error);
      const errorMsg = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join(', ')
        : error.response?.data?.message || 'Failed to save campaign';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete campaign "${name}"?`)) return;
    try {
      const response = await campaignApi.deleteCampaign(id);
      if (response.success) {
        toast.success('Campaign deleted');
        loadCampaigns();
      }
    } catch (error) {
      toast.error('Failed to delete campaign');
    }
  };

  const handleToggleActive = async (campaign) => {
    const newActive = !campaign.is_active;
    try {
      const response = await campaignApi.updateCampaign(campaign.id, {
        name: campaign.name,
        description: campaign.description || null,
        event_id: campaign.event?.id,
        commission_type: campaign.commission_type,
        commission_value: campaign.commission_value,
        requires_approval: campaign.requires_approval,
        max_affiliates: campaign.max_affiliates || null,
        starts_at: formatDateForInput(campaign.starts_at),
        ends_at: formatDateForInput(campaign.ends_at),
        is_active: newActive,
      });
      if (response.success) {
        toast.success(`Campaign ${newActive ? 'activated' : 'paused'}`);
        loadCampaigns();
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      const errorMsg = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join(', ')
        : error.response?.data?.message || 'Failed to update status';
      toast.error(errorMsg);
    }
  };

  const getStatusBadge = (isActive) => {
    if (isActive) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Active
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 bg-zinc-800 text-zinc-400 border-zinc-700">
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
        Inactive
      </span>
    );
  };

  const getCommissionLabel = (campaign) => {
    if (campaign.commission_type === 'percentage') {
      return `${campaign.commission_value}%`;
    }
    return `KES ${parseFloat(campaign.commission_value || 0).toLocaleString()}`;
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
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Affiliate Campaigns</h1>
            <p className="text-zinc-400 text-sm">Create campaigns, set commissions, and let affiliates promote your events.</p>
          </div>

          <Dialog open={showDialog} onOpenChange={(open) => {
            setShowDialog(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 rounded-xl h-11 px-6">
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
            </DialogTrigger>

            <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-primary" />
                  {editingCampaign ? 'Edit Campaign' : 'Launch New Campaign'}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Campaign Name */}
                  <div className="col-span-full">
                    <label className="text-xs text-zinc-400 font-medium uppercase mb-2 block">Campaign Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-primary/50 transition-all placeholder:text-zinc-700"
                      placeholder="e.g. Summer Festival Promoters"
                    />
                  </div>

                  {/* Event Selection */}
                  <div className="col-span-full">
                    <label className="text-xs text-zinc-400 font-medium uppercase mb-2 block">Linked Event</label>
                    <select
                      name="event_id"
                      value={formData.event_id}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-primary/50 cursor-pointer"
                    >
                      <option value="">Select an Event</option>
                      {events.map(event => (
                        <option key={event.id} value={event.id}>{event.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div className="col-span-full">
                    <label className="text-xs text-zinc-400 font-medium uppercase mb-2 block">Description (Optional)</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-primary/50 resize-none placeholder:text-zinc-700"
                      placeholder="What this campaign is about..."
                    />
                  </div>

                  {/* Commission Type */}
                  <div>
                    <label className="text-xs text-zinc-400 font-medium uppercase mb-2 block">Commission Type</label>
                    <select
                      name="commission_type"
                      value={formData.commission_type}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-primary/50 cursor-pointer"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Fixed Amount (KES)</option>
                    </select>
                  </div>

                  {/* Commission Value */}
                  <div>
                    <label className="text-xs text-zinc-400 font-medium uppercase mb-2 block">
                      Commission {formData.commission_type === 'percentage' ? '(%)' : '(KES)'}
                    </label>
                    <input
                      type="number"
                      name="commission_value"
                      value={formData.commission_value}
                      onChange={handleInputChange}
                      required
                      min="0"
                      max={formData.commission_type === 'percentage' ? '100' : undefined}
                      step="0.01"
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-primary/50 placeholder:text-zinc-700"
                      placeholder={formData.commission_type === 'percentage' ? 'e.g. 10' : 'e.g. 500'}
                    />
                  </div>

                  {/* Dates */}
                  <div>
                    <label className="text-xs text-zinc-400 font-medium uppercase mb-2 block">Starts At</label>
                    <input
                      type="date"
                      name="starts_at"
                      value={formData.starts_at}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-primary/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 font-medium uppercase mb-2 block">Ends At</label>
                    <input
                      type="date"
                      name="ends_at"
                      value={formData.ends_at}
                      onChange={handleInputChange}
                      required
                      min={formData.starts_at}
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-primary/50"
                    />
                  </div>

                  {/* Max Affiliates */}
                  <div>
                    <label className="text-xs text-zinc-400 font-medium uppercase mb-2 block">Max Affiliates</label>
                    <input
                      type="number"
                      name="max_affiliates"
                      value={formData.max_affiliates}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-primary/50 placeholder:text-zinc-700"
                      placeholder="Unlimited"
                    />
                  </div>

                  {/* Requires Approval */}
                  <div className="flex items-center gap-3 self-end pb-1">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="requires_approval"
                        checked={formData.requires_approval}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                    <div>
                      <span className="text-xs text-zinc-400 font-medium uppercase">Manually Approve Affiliates</span>
                      <p className="text-[10px] text-zinc-600 mt-0.5">When off, affiliates are auto-approved on join</p>
                    </div>
                  </div>

                  {editingCampaign && (
                    <div className="flex items-center gap-3 self-end pb-1">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="is_active"
                          checked={formData.is_active}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                      <span className="text-xs text-zinc-400 font-medium uppercase">Active</span>
                    </div>
                  )}
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
                    disabled={submitting}
                    className="flex-1 bg-white text-black hover:bg-zinc-200 font-semibold disabled:opacity-50"
                  >
                    {submitting ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                    ) : (
                      editingCampaign ? 'Save Changes' : 'Create Campaign'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* HUD Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={Target}
            label="Total Campaigns"
            value={totalCampaigns}
            color="text-blue-400"
          />
          <StatCard
            icon={CheckCircle2}
            label="Active Campaigns"
            value={campaigns.filter(c => c.is_active).length}
            color="text-emerald-400"
          />
          <StatCard
            icon={Activity}
            label="Conversions"
            value={campaigns.reduce((sum, c) => sum + (c.total_conversions || 0), 0)}
            color="text-purple-400"
          />
          <StatCard
            icon={DollarSign}
            label="Earnings"
            value={`KES ${campaigns.reduce((sum, c) => sum + parseFloat(c.total_earnings || 0), 0).toLocaleString()}`}
            color="text-primary"
          />
        </div>

        {/* Toolbar */}
        <form onSubmit={handleSearch} className="sticky top-24 z-20 flex gap-3 p-2 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search campaigns..."
              className="w-full pl-10 pr-4 py-2 bg-transparent text-white placeholder-zinc-500 text-sm focus:outline-none"
            />
          </div>
          <div className="h-6 w-px bg-white/10 my-auto" />
          <Button type="submit" variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
            <Filter className="h-4 w-4" />
          </Button>
        </form>

        {/* Campaigns List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl">
            <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4 border border-zinc-800 shadow-lg">
              <Target className="h-8 w-8 text-zinc-600" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No campaigns yet</h3>
            <p className="text-zinc-500 text-sm max-w-sm text-center mb-6">
              Create a campaign to start tracking affiliate sales and influencer performance.
            </p>
            <Button
              onClick={() => setShowDialog(true)}
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:text-white"
            >
              Create Campaign
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="group relative bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 rounded-xl overflow-hidden transition-all duration-300"
              >
                {/* Status Indicator Strip */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  campaign.is_active ? 'bg-emerald-500' : 'bg-zinc-700'
                }`} />

                <div className="flex flex-col md:flex-row md:items-center p-5 pl-7 gap-6">

                  {/* Left: Campaign Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-white truncate">{campaign.name}</h3>
                      {getStatusBadge(campaign.is_active)}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 mb-2">
                      <span className="flex items-center gap-1.5 px-2 py-1 bg-zinc-950 rounded border border-zinc-800 text-zinc-300">
                        {campaign.commission_type === 'percentage' ? (
                          <Percent className="h-3 w-3 text-primary" />
                        ) : (
                          <Hash className="h-3 w-3 text-primary" />
                        )}
                        {getCommissionLabel(campaign)} per sale
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(campaign.starts_at).toLocaleDateString()} <ArrowRight className="h-3 w-3" /> {new Date(campaign.ends_at).toLocaleDateString()}
                      </span>
                      <span className={`flex items-center gap-1 ${campaign.requires_approval ? 'text-amber-400/70' : 'text-emerald-400/70'}`}>
                        <CheckCircle2 className="h-3 w-3" />
                        {campaign.requires_approval ? 'Manual approval' : 'Auto-approve'}
                      </span>
                    </div>

                    {campaign.event && (
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Linked to: <span className="text-zinc-300">{campaign.event.title}</span>
                      </div>
                    )}
                  </div>

                  {/* Middle: Metrics */}
                  <div className="flex items-center gap-8 md:border-l md:border-r border-white/5 px-0 md:px-8 py-2">
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1">Affiliates</p>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-blue-400" />
                        <span className="text-lg font-bold text-white">{campaign.affiliates_count || 0}</span>
                        {campaign.pending_count > 0 && (
                          <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                            +{campaign.pending_count} pending
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1">Conversions</p>
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="h-4 w-4 text-purple-400" />
                        <span className="text-lg font-bold text-white">{campaign.total_conversions || 0}</span>
                      </div>
                    </div>
                     <div>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1">Earnings</p>
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="h-4 w-4 text-emerald-400" />
                        <span className="text-lg font-bold text-white">KES {parseFloat(campaign.total_earnings || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2">
                     <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/campaigns/${campaign.id}/enrollments`)}
                        className={`hidden lg:flex text-xs h-9 ${
                          campaign.pending_count > 0
                            ? 'border-amber-500/30 bg-amber-500/5 text-amber-300 hover:bg-amber-500/10 hover:text-amber-200'
                            : 'border-zinc-700 bg-zinc-900 hover:bg-zinc-800 hover:text-white'
                        }`}
                      >
                        <Users className="h-3.5 w-3.5 mr-2" />
                        Affiliates
                        {campaign.pending_count > 0 && (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-amber-500 text-[10px] font-bold text-black">
                            {campaign.pending_count}
                          </span>
                        )}
                      </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 min-w-[160px]">
                        <DropdownMenuItem onClick={() => handleEdit(campaign)} className="text-zinc-300 focus:text-white focus:bg-white/10 cursor-pointer">
                          <Edit className="mr-2 h-4 w-4" /> Edit Campaign
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/campaigns/${campaign.id}/analytics`)} className="text-zinc-300 focus:text-white focus:bg-white/10 cursor-pointer">
                          <BarChart3 className="mr-2 h-4 w-4" /> View Analytics
                        </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => router.push(`/dashboard/campaigns/${campaign.id}/enrollments`)} className="lg:hidden text-zinc-300 focus:text-white focus:bg-white/10 cursor-pointer">
                          <Users className="mr-2 h-4 w-4" /> Manage Affiliates
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-white/10" />

                        {campaign.is_active ? (
                          <DropdownMenuItem onClick={() => handleToggleActive(campaign)} className="text-amber-400 focus:text-amber-300 focus:bg-amber-500/10 cursor-pointer">
                            <Pause className="mr-2 h-4 w-4" /> Pause
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleToggleActive(campaign)} className="text-emerald-400 focus:text-emerald-300 focus:bg-emerald-500/10 cursor-pointer">
                            <Play className="mr-2 h-4 w-4" /> Activate
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem
                          onClick={() => handleDelete(campaign.id, campaign.name)}
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

export default CampaignsPage;
