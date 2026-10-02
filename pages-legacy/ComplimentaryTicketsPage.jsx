"use client"

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { complimentaryTicketApi } from '@/lib/services/complimentaryTicketApi';
import { 
  Gift, Search, Loader2, Mail, Send, Calendar, 
  Download, Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

const ComplimentaryTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [sending, setSending] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(10);

  // Form state
  const [formData, setFormData] = useState({
    event_id: '',
    recipient_name: '',
    recipient_email: '',
    quantity: 1,
  });

  useEffect(() => {
    loadTickets();
    loadStatistics();
    loadEvents();
  }, [currentPage, eventFilter]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: perPage,
        search: searchTerm,
        event_id: eventFilter,
      };
      
      const response = await complimentaryTicketApi.getComplimentaryTickets(params);
      if (response.success) {
        setTickets(response.data);
        setTotalPages(response.meta.last_page);
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
      toast.error('Failed to load complimentary tickets');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await complimentaryTicketApi.getStatistics();
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const loadEvents = async () => {
    try {
      const response = await complimentaryTicketApi.getEvents();
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
    loadTickets();
  };

  const handleSendTickets = async (e) => {
    e.preventDefault();
    setSending(true);
    
    try {
      const response = await complimentaryTicketApi.sendComplimentaryTickets(formData);
      if (response.success) {
        toast.success('Complimentary tickets sent successfully');
        setShowSendDialog(false);
        setFormData({
          event_id: '',
          recipient_name: '',
          recipient_email: '',
          quantity: 1,
        });
        loadTickets();
        loadStatistics();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send tickets');
    } finally {
      setSending(false);
    }
  };

  const handleResend = async (ticketId) => {
    try {
      const response = await complimentaryTicketApi.resendComplimentaryTicket(ticketId);
      if (response.success) {
        toast.success(response.message);
        loadTickets();
      }
    } catch (error) {
      toast.error('Failed to resend tickets');
    }
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
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Complimentary Tickets</h1>
            <p className="text-zinc-400 text-sm">Send and manage complimentary tickets</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => setShowSendDialog(true)}
              className="bg-primary hover:bg-primary/90 text-white h-10"
            >
              <Plus className="h-4 w-4 mr-2" />
              Send Tickets
            </Button>
            <Button 
              variant="outline" 
              className="border-white/10 bg-white/5 hover:bg-white hover:text-black text-white h-10"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* HUD Stats */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
              icon={Gift} 
              label="Total Tickets Sent" 
              value={statistics.total_tickets} 
              color="text-purple-400" 
            />
            <StatCard 
              icon={Mail} 
              label="Total Recipients" 
              value={statistics.total_recipients} 
              color="text-blue-400" 
            />
            <StatCard 
              icon={Calendar} 
              label="Last 30 Days" 
              value={statistics.recent_tickets} 
              color="text-emerald-400" 
            />
          </div>
        )}

        {/* Toolbar */}
        <div className="sticky top-24 z-20 flex flex-col md:flex-row gap-3 p-2 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by recipient name, email, or ticket number..."
              className="w-full pl-10 pr-4 py-2 bg-transparent text-white placeholder-zinc-500 text-sm focus:outline-none"
            />
          </div>
          
          <div className="h-px w-full md:w-px md:h-6 bg-white/10 my-auto" />
          
          <div className="flex items-center gap-2 px-1">
            <select
              value={eventFilter}
              onChange={(e) => {
                setEventFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-sm text-zinc-300 focus:outline-none cursor-pointer hover:text-white transition-colors"
            >
              <option value="" className="bg-zinc-900">All Events</option>
              {events.map((event) => (
                <option key={event.id} value={event.id} className="bg-zinc-900">
                  {event.title}
                </option>
              ))}
            </select>
          </div>
          
          <Button type="button" onClick={handleSearch} className="bg-white text-black hover:bg-zinc-200 font-semibold h-9">
            Search
          </Button>
        </div>

        {/* Tickets Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl">
            <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4 border border-zinc-800 shadow-lg">
              <Gift className="h-8 w-8 text-zinc-600" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No complimentary tickets sent</h3>
            <p className="text-zinc-500 text-sm max-w-sm text-center mb-4">
              Send complimentary tickets to your guests and VIPs.
            </p>
            <Button onClick={() => setShowSendDialog(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Send Tickets
            </Button>
          </div>
        ) : (
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5 bg-zinc-900/80">
                    <th className="text-left px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Recipient
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="text-center px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="text-center px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {tickets.map((ticket) => (
                    <tr 
                      key={ticket.id}
                      className="hover:bg-zinc-800/50 transition-colors group"
                    >
                      {/* Recipient */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium text-white">
                            {ticket.recipient_name}
                          </span>
                          <span className="text-xs text-zinc-500">
                            {ticket.recipient_email}
                          </span>
                        </div>
                      </td>

                      {/* Event */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-zinc-300 truncate max-w-[200px] block">
                          {ticket.event.title}
                        </span>
                      </td>

                      {/* Quantity */}
                      <td className="px-6 py-4 text-center">
                        <span className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded-full text-xs font-bold">
                          {ticket.quantity}
                        </span>
                      </td>

                      {/* Sent At */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-zinc-300">
                          {new Date(ticket.sent_at).toLocaleString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleResend(ticket.id)}
                            className="hover:bg-white hover:text-black text-xs h-8"
                          >
                            <Send className="h-3.5 w-3.5 mr-1" />
                            Resend
                          </Button>
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

        {/* Send Tickets Dialog */}
        <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
          <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-md shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                Send Complimentary Tickets
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSendTickets} className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Event *
                </label>
                <select
                  value={formData.event_id}
                  onChange={(e) => setFormData({ ...formData, event_id: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-primary"
                >
                  <option value="">Select an event</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Recipient Name *
                </label>
                <input
                  type="text"
                  value={formData.recipient_name}
                  onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-primary"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Recipient Email *
                </label>
                <input
                  type="email"
                  value={formData.recipient_email}
                  onChange={(e) => setFormData({ ...formData, recipient_email: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-primary"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  required
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSendDialog(false)}
                  className="flex-1 border-zinc-700 text-zinc-300 hover:text-white"
                  disabled={sending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={sending}
                >
                  {sending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Tickets
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default ComplimentaryTicketsPage;
