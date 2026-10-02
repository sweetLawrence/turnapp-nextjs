"use client"

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/DashboardLayout';
import { dashboardApi } from '@/lib/services/dashboardApi';
import { authService } from '@/lib/services/authService';
import { 
  DollarSign, Calendar, Ticket, 
  MapPin, Filter, ChevronRight, ArrowUpRight, 
  Sparkles, Activity, BarChart3, PieChart, Layers, Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart as RePieChart 
} from 'recharts';
import { Button } from '@/components/ui/button';

// --- Components ---

const DateFilterDropdown = ({ selectedPeriod, onPeriodChange, isOpen, onToggle, dropdownRef }) => {
  const periods = [
    { value: 'lifetime', label: 'All Time' },
    { value: '7', label: 'Last 7 Days' },
    { value: '30', label: 'Last 30 Days' },
    { value: '90', label: 'Last 3 Months' },
    { value: '365', label: 'Last Year' },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={onToggle}
        className="flex items-center gap-2 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg text-xs font-medium text-zinc-300 transition-all"
      >
        <Calendar className="h-3.5 w-3.5 text-zinc-500" />
        <span>{periods.find(p => p.value === selectedPeriod)?.label || 'All Time'}</span>
        <Filter className="h-3 w-3 ml-1 opacity-50" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-1">
            {periods.map((period) => (
              <button
                key={period.value}
                onClick={() => {
                  onPeriodChange(period.value);
                  onToggle();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors ${
                  selectedPeriod === period.value
                    ? 'bg-zinc-800 text-white font-medium'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <span>{period.label}</span>
                {selectedPeriod === period.value && <Check className="h-3 w-3 text-emerald-500" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, growth, trend, colorClass, delay }) => (
  <div 
    className="relative overflow-hidden bg-zinc-900 border border-zinc-800/60 rounded-xl p-4 sm:p-5 hover:border-zinc-700 transition-all duration-300 group"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`p-2.5 rounded-lg ${colorClass} bg-opacity-10 border border-opacity-20`}>
        <Icon className={`h-5 w-5 ${colorClass.replace('bg-', 'text-')}`} />
      </div>
    </div>
    
    <div>
      <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-1">{value}</h3>
      <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{label}</p>
    </div>

    {/* Decorative gradient blob */}
    <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity ${colorClass.replace('text', 'bg')}`} />
  </div>
);

// --- Main Page ---

const DashboardPage = () => {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [salesTrend, setSalesTrend] = useState(null);
  const [topEvents, setTopEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('lifetime');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsFilterOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = selectedPeriod === 'lifetime' ? {} : { days: parseInt(selectedPeriod) };
      
      const [statsRes, currentEventRes, categoriesRes, trendRes, topRes] = await Promise.all([
        dashboardApi.getStatistics(params),
        dashboardApi.getCurrentEvent({}), // Always fetch latest
        dashboardApi.getCategoryBreakdown(params),
        dashboardApi.getSalesTrend(params),
        dashboardApi.getTopEvents(params)
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (currentEventRes.success) setCurrentEvent(currentEventRes.data);
      if (categoriesRes.success) setCategories(categoriesRes.data);
      if (trendRes.success) setSalesTrend(trendRes.data);
      if (topRes.success) setTopEvents(topRes.data);

    } catch (error) {
      console.error("Dashboard Load Error", error);
      toast.error("Failed to refresh dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = () => router.push('/dashboard/events/create');

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
           <div className="h-12 w-48 bg-zinc-800 rounded-lg" />
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
             {[...Array(4)].map((_, i) => <div key={i} className="h-40 bg-zinc-900 rounded-xl border border-zinc-800" />)}
           </div>
           <div className="h-96 bg-zinc-900 rounded-xl border border-zinc-800" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto pb-12 space-y-6 animate-in fade-in duration-500">
        
        {/* Header Area */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Overview</h1>
            <p className="text-sm text-zinc-400 mt-1">
              Welcome back, {authService.getUser()?.name?.split(' ')[0]}. Here's what's happening.
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <DateFilterDropdown
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
              isOpen={isFilterOpen}
              onToggle={() => setIsFilterOpen(!isFilterOpen)}
              dropdownRef={dropdownRef}
            />
            <Button 
              onClick={handleCreateEvent} 
              className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 flex-1 sm:flex-none"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>
        </div>

        {/* Stats Grid - 2x2 on Mobile, 1x4 on Desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            icon={DollarSign}
            label="Total Revenue"
            value={`KES ${(stats?.total_revenue || 0).toLocaleString()}`}
            growth={stats?.revenue_growth}
            colorClass="bg-emerald-500 text-emerald-500"
            delay={0}
          />
          <StatCard
            icon={Ticket}
            label="Tickets Sold"
            value={(stats?.total_tickets_sold || 0).toLocaleString()}
            growth={stats?.tickets_growth}
            colorClass="bg-blue-500 text-blue-500"
            delay={100}
          />
          <StatCard
            icon={Calendar}
            label="Events Hosted"
            value={stats?.total_events || 0}
            colorClass="bg-purple-500 text-purple-500"
            delay={200}
          />
          <StatCard
            icon={Activity}
            label="Conversion"
            value={`${stats?.conversion_rate || 0}%`}
            colorClass="bg-orange-500 text-orange-500"
            delay={300}
          />
        </div>

        {/* Segmented Control Tabs */}
        <div className="bg-zinc-900 border border-zinc-800 p-1 rounded-xl flex overflow-x-auto scrollbar-hide w-full sm:w-fit">
          {[
            { id: 'overview', label: 'Overview', icon: Layers },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'events', label: 'Events', icon: Ticket },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* --- Tab Content --- */}
        
        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-2 duration-500">
            
            {/* Main Column (2/3 width) - Current Event & Sales Graph */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Current Event Hero Card */}
              {currentEvent ? (
                <div className="relative group rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900">
                  {/* Abstract Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/50 to-zinc-950/50" />
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  
                  <div className="relative p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                      <div className="space-y-4 flex-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                          </span>
                          Active Event
                        </div>
                        
                        <div>
                          <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-2">
                            {currentEvent.title}
                          </h2>
                          <div className="flex items-center gap-4 text-sm text-zinc-400">
                            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {new Date(currentEvent.start_date).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {currentEvent.venue}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 pt-2">
                          <Button 
                            onClick={() => router.push(`/dashboard/events/${currentEvent.id}`)}
                            className="bg-white text-black hover:bg-zinc-200 h-9 text-xs font-bold"
                          >
                            Manage Event <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        </div>
                      </div>

                      {/* Right side circular progress */}
                      <div className="flex flex-col items-center justify-center bg-zinc-950/30 backdrop-blur-sm rounded-xl p-4 border border-white/5 w-full sm:w-auto">
                        <div className="relative h-24 w-24 flex items-center justify-center">
                          <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                            <path className="text-zinc-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                            <path className="text-primary drop-shadow-[0_0_8px_rgba(239,68,68,0.5)] transition-all duration-1000" strokeDasharray={`${currentEvent.capacity_percentage}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-lg font-bold text-white">{currentEvent.capacity_percentage}%</span>
                            <span className="text-[10px] text-zinc-500 uppercase">Sold</span>
                          </div>
                        </div>
                        <div className="mt-3 text-center">
                          <p className="text-sm font-semibold text-white">KES {currentEvent.revenue.toLocaleString()}</p>
                          <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Revenue</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center">
                    <Calendar className="h-8 w-8 text-zinc-500" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">No Active Events</h3>
                    <p className="text-sm text-zinc-500 max-w-xs mx-auto mt-1">Ready to start selling? Create your first event to see real-time insights.</p>
                  </div>
                  <Button onClick={handleCreateEvent} variant="outline" className="border-zinc-700 text-zinc-300">
                    Create First Event
                  </Button>
                </div>
              )}

              {/* Quick Sales Trend Chart */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-white">Sales Trend</h3>
                  <span className="text-xs text-zinc-500">Last 7 Days</span>
                </div>
                <div className="h-[250px] w-full">
                  {salesTrend ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salesTrend.daily_sales.slice(-7)}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 10}} tickFormatter={str => new Date(str).getDate()} />
                        <YAxis hide />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-zinc-600 text-sm">No data available</div>
                  )}
                </div>
              </div>
            </div>

            {/* Side Column (1/3 width) - Category Breakdown */}
            <div className="space-y-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 h-full">
                <h3 className="font-semibold text-white mb-6">Top Categories</h3>
                <div className="space-y-5">
                  {categories.map((cat, idx) => (
                    <div key={idx} className="group">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-zinc-300 font-medium flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${['bg-red-500','bg-blue-500','bg-green-500','bg-yellow-500'][idx % 4]}`} />
                          {cat.name}
                        </span>
                        <span className="text-white font-bold">{cat.tickets_sold}</span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${['bg-red-500','bg-blue-500','bg-green-500','bg-yellow-500'][idx % 4]}`} 
                          style={{ width: `${(cat.revenue / (stats?.total_revenue || 1)) * 100}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-1 text-right">KES {cat.revenue.toLocaleString()}</p>
                    </div>
                  ))}
                  {categories.length === 0 && (
                    <div className="text-center py-10 text-zinc-600 text-sm">No category data yet</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. ANALYTICS TAB (Detailed Charts) */}
        {activeTab === 'analytics' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-300">
             <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold text-white">Revenue vs Sales Volume</h3>
                  <p className="text-sm text-zinc-500">Detailed breakdown over selected period</p>
                </div>
             </div>
             <div className="h-[400px] w-full">
                {salesTrend ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesTrend.daily_sales} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="date" stroke="#52525b" tick={{fill: '#71717a', fontSize: 12}} tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, {month:'short', day:'numeric'})} />
                      <YAxis stroke="#52525b" tick={{fill: '#71717a', fontSize: 12}} tickFormatter={(val) => `K${val/1000}`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                        labelStyle={{ color: '#a1a1aa', marginBottom: '8px' }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fill="url(#colorRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                    <BarChart3 className="h-10 w-10 mb-2 opacity-50" />
                    <p>No analytics data available for this period</p>
                  </div>
                )}
             </div>
          </div>
        )}

        {/* 3. TOP EVENTS TAB */}
        {activeTab === 'events' && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
             <div className="flex justify-between items-center px-2">
                <h3 className="text-lg font-bold text-white">Top Performing Events</h3>
             </div>
             <div className="grid grid-cols-1 gap-4">
                {topEvents.length > 0 ? topEvents.map((event, index) => (
                  <div key={event.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-700 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                        index === 0 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                        index === 1 ? 'bg-zinc-700/50 text-zinc-300' :
                        index === 2 ? 'bg-orange-800/50 text-orange-400' : 'bg-zinc-800 text-zinc-500'
                      }`}>
                        #{index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-sm sm:text-base">{event.title}</h4>
                        <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(event.date).toLocaleDateString()}</span>
                          <span className="hidden sm:flex items-center gap-1"><MapPin className="h-3 w-3" /> {event.venue}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 sm:gap-12 pl-14 sm:pl-0 border-t sm:border-t-0 border-zinc-800 pt-3 sm:pt-0">
                      <div>
                        <p className="text-[10px] text-zinc-500 uppercase font-bold">Revenue</p>
                        <p className="text-sm font-bold text-emerald-400">KES {event.revenue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-500 uppercase font-bold">Sold</p>
                        <p className="text-sm font-bold text-white">{event.tickets_sold}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white ml-auto sm:ml-0">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-20 bg-zinc-900/50 border border-dashed border-zinc-800 rounded-xl">
                    <p className="text-zinc-500">No events found for this period</p>
                  </div>
                )}
             </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;