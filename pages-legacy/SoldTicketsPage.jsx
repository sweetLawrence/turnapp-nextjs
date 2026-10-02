"use client"

import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { soldTicketApi } from '@/lib/services/soldTicketApi';
import { 
  Ticket, Search, Loader2, Mail,
  DollarSign, CheckCircle2, Clock,
  Filter, Download, User, Calendar, AlertTriangle
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
} from '@/components/ui/dialog";

const SoldTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [ticketToCheckIn, setTicketToCheckIn] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(10);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    loadTickets();
    loadStatistics();
  }, [currentPage, statusFilter, debouncedSearchTerm]);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: perPage,
        search: debouncedSearchTerm,
        status: statusFilter,
      };
      
      const response = await soldTicketApi.getSoldTickets(params);
      if (response.success) {
        setTickets(response.data);
        setTotalPages(response.meta.last_page);
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await soldTicketApi.getStatistics();
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is now automatic via debounced effect
    // This handler is kept for the search button but isn't necessary
  };

  const handleViewDetails = async (ticketId) => {
    try {
      const response = await soldTicketApi.getSoldTicket(ticketId);
      if (response.success) {
        setSelectedTicket(response.data);
        setShowDetailsDialog(true);
      }
    } catch (error) {
      toast.error('Failed to load ticket details');
    }
  };

  const handleCheckInClick = (ticket) => {
    setTicketToCheckIn(ticket);
    setShowCheckInModal(true);
  };

  const handleConfirmCheckIn = async () => {
    if (!ticketToCheckIn) return;
    
    setActionLoading(true);
    try {
      const response = await soldTicketApi.markAsUsed(ticketToCheckIn.id);
      if (response.success) {
        toast.success('Ticket checked in successfully');
        loadTickets();
        loadStatistics();
        setShowCheckInModal(false);
        setTicketToCheckIn(null);
        if (selectedTicket && selectedTicket.id === ticketToCheckIn.id) {
          setShowDetailsDialog(false);
        }
      }
    } catch (error) {
      toast.error('Failed to check in ticket');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResendEmail = async (ticketId) => {
    setActionLoading(true);
    try {
      const response = await soldTicketApi.resendEmail(ticketId);
      if (response.success) {
        toast.success('Email resent successfully');
      }
    } catch (error) {
      toast.error('Failed to resend ticket email');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 2) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide border bg-zinc-800 text-zinc-400 border-zinc-700">
          <CheckCircle2 className="h-3 w-3" />
          Checked In
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Valid
      </span>
    );
  };

  // Improved Stat Card
  const StatCard = ({ icon: Icon, label, value, colorClass, delay }) => (
    <div 
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-5 flex items-start justify-between hover:border-zinc-700 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div>
        <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{value}</h3>
      </div>
      <div className={`p-2.5 rounded-lg ${colorClass} bg-opacity-10`}>
        <Icon className={`h-5 w-5 ${colorClass.replace('bg-', 'text-')}`} />
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto pb-20 space-y-6 sm:space-y-8 animate-in fade-in duration-500">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Sold Tickets</h1>
            <p className="text-zinc-400 text-sm mt-1">Manage ticket sales and check-ins</p>
          </div>
          <Button 
            variant="outline" 
            className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Stats Grid - 2x2 on Mobile */}
        {statistics && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard 
              icon={Ticket} 
              label="Total Sold" 
              value={statistics.total_tickets} 
              colorClass="bg-blue-500 text-blue-500" 
              delay={0}
            />
            <StatCard 
              icon={DollarSign} 
              label="Revenue" 
              value={`KES ${parseFloat(statistics.total_revenue || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`} 
              colorClass="bg-emerald-500 text-emerald-500"
              delay={100} 
            />
            <StatCard 
              icon={CheckCircle2} 
              label="Checked In" 
              value={statistics.checked_in_tickets} 
              colorClass="bg-purple-500 text-purple-500"
              delay={200} 
            />
            <StatCard 
              icon={Clock} 
              label="Pending" 
              value={statistics.pending_tickets} 
              colorClass="bg-amber-500 text-amber-500"
              delay={300} 
            />
          </div>
        )}

        {/* Toolbar - Combined Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tickets by number, name, email or event..."
              className="w-full h-10 pl-10 pr-4 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-all"
            />
          </form>
          
          <div className="flex gap-3">
            <div className="relative min-w-[140px] flex-1 sm:flex-none">
               <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                 <Filter className="h-3.5 w-3.5 text-zinc-500" />
               </div>
               <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-10 pl-9 pr-8 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-300 focus:outline-none focus:border-zinc-700 appearance-none cursor-pointer hover:bg-zinc-800 transition-colors"
              >
                <option value="">All Status</option>
                <option value="1">Valid</option>
                <option value="2">Checked In</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
                <Ticket className="h-8 w-8 text-zinc-600" />
              </div>
              <h3 className="text-white font-medium mb-1">No tickets found</h3>
              <p className="text-zinc-500 text-sm max-w-xs">
                Try adjusting your search or filters to find what you're looking for.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/50">
                    <th className="text-left px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Ticket ID</th>
                    <th className="text-left px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Ticket Type</th>
                    <th className="text-left px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Event Name</th>
                    <th className="text-left px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Customer</th>
                    <th className="text-left px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Amount</th>
                    <th className="text-left px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Date</th>
                    <th className="text-right px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {tickets.map((ticket) => (
                    <tr 
                      key={ticket.id}
                      onClick={() => handleViewDetails(ticket.id)}
                      className="group hover:bg-zinc-800/50 transition-colors cursor-pointer"
                    >
                      {/* Ticket ID */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                          {ticket.ticket_no}
                        </span>
                      </td>

                      {/* Ticket Type */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-zinc-300 font-medium">
                          {ticket.ticket_type}
                        </span>
                      </td>

                      {/* Event Name */}
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-white truncate max-w-[200px] block">
                          {ticket.event?.title || 'Unknown Event'}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300 border border-zinc-700">
                            {(ticket.customer_name?.[0] || 'U').toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm text-zinc-200">
                               {ticket.customer_name || 'Guest User'}
                            </span>
                            <span className="text-xs text-zinc-500 truncate max-w-[150px]">
                              {ticket.customer_email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-white font-mono">
                          KES {parseFloat(ticket.amount || 0).toLocaleString()}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4">
                         <div className="flex flex-col text-xs">
                            <span className="text-zinc-300 font-medium">{new Date(ticket.created_at).toLocaleDateString()}</span>
                            <span className="text-zinc-600">{new Date(ticket.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                         </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {String(ticket.status) === '2' ? (
                            <span className="text-xs text-zinc-500 font-medium">Checked In</span>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 border-emerald-600 text-emerald-400 hover:bg-emerald-600 hover:text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCheckInClick(ticket);
                              }}
                            >
                              Check In
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-zinc-400 hover:text-white hover:bg-zinc-800 border-zinc-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResendEmail(ticket.id);
                            }}
                            disabled={actionLoading}
                          >
                            Resend
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Footer / Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-zinc-800 px-6 py-4 flex items-center justify-between bg-zinc-900">
              <span className="text-xs text-zinc-500">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.max(1, prev - 1)); }}
                  disabled={currentPage === 1}
                  className="h-8 border-zinc-700 bg-transparent hover:bg-zinc-800 text-zinc-300 text-xs"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.min(totalPages, prev + 1)); }}
                  disabled={currentPage === totalPages}
                  className="h-8 border-zinc-700 bg-transparent hover:bg-zinc-800 text-zinc-300 text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Check-In Confirmation Modal */}
        <Dialog open={showCheckInModal} onOpenChange={setShowCheckInModal}>
          <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-white">Confirm Check-In</DialogTitle>
                  <DialogDescription className="text-zinc-400 text-sm mt-1">
                    This action cannot be undone
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            
            {ticketToCheckIn && (
              <div className="py-4 space-y-3">
                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-zinc-500 uppercase font-bold">Ticket Number</span>
                    <span className="text-sm font-mono text-white">{ticketToCheckIn.ticket_no}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-zinc-500 uppercase font-bold">Customer</span>
                    <span className="text-sm text-zinc-300">{ticketToCheckIn.customer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-zinc-500 uppercase font-bold">Event</span>
                    <span className="text-sm text-zinc-300 truncate max-w-[200px]">{ticketToCheckIn.event?.title}</span>
                  </div>
                </div>
                
                <p className="text-sm text-zinc-400 text-center">
                  Are you sure you want to check in this ticket?
                </p>
              </div>
            )}

            <DialogFooter className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCheckInModal(false);
                  setTicketToCheckIn(null);
                }}
                disabled={actionLoading}
                className="flex-1 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmCheckIn}
                disabled={actionLoading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Checking In...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Confirm Check-In
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Ticket Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-lg p-0 overflow-hidden shadow-2xl">
            {selectedTicket && (
              <div className="flex flex-col max-h-[90vh]">
                {/* Receipt Header */}
                <div className="p-6 bg-zinc-900 border-b border-zinc-800">
                   <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-3 items-center">
                         <div className="p-2.5 bg-primary/10 rounded-lg">
                            <Ticket className="h-5 w-5 text-primary" />
                         </div>
                         <div>
                            <h2 className="text-lg font-bold text-white">Ticket Details</h2>
                            <p className="text-xs text-zinc-500 font-mono mt-0.5">#{selectedTicket.ticket_no}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-2xl font-bold text-white">KES {parseFloat(selectedTicket.amount).toLocaleString()}</p>
                         {getStatusBadge(selectedTicket.status)}
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-950/50 border border-zinc-800">
                         <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center">
                            <User className="h-4 w-4 text-zinc-400" />
                         </div>
                         <div className="overflow-hidden">
                            <p className="text-xs text-zinc-500 uppercase font-bold">Customer</p>
                            <p className="text-sm font-medium text-white truncate">{selectedTicket.customer_name}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-950/50 border border-zinc-800">
                         <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center">
                            <Calendar className="h-4 w-4 text-zinc-400" />
                         </div>
                         <div>
                            <p className="text-xs text-zinc-500 uppercase font-bold">Date</p>
                            <p className="text-sm font-medium text-white">{new Date(selectedTicket.created_at).toLocaleDateString()}</p>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Scrollable Content */}
                <div className="p-6 overflow-y-auto space-y-6">
                   {/* Details */}
                   <div className="space-y-3">
                      <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Event Information</h3>
                      <div className="flex justify-between items-center py-2 border-b border-zinc-800/50 border-dashed">
                         <span className="text-xs text-zinc-500">Event</span>
                         <span className="text-sm text-white font-medium">{selectedTicket.event?.title}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-zinc-800/50 border-dashed">
                         <span className="text-xs text-zinc-500">Ticket Type</span>
                         <span className="text-sm text-zinc-300">{selectedTicket.ticket_type}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-zinc-800/50 border-dashed">
                         <span className="text-xs text-zinc-500">Email</span>
                         <span className="text-sm text-zinc-300 truncate max-w-[200px]">{selectedTicket.customer_email}</span>
                      </div>
                   </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex justify-between items-center gap-3">
                   {String(selectedTicket.status) !== '2' && (
                     <Button 
                       onClick={() => handleCheckInClick(selectedTicket)} 
                       disabled={actionLoading}
                       className="bg-emerald-600 hover:bg-emerald-500 text-white"
                     >
                       {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                       Check In
                     </Button>
                   )}
                   <Button variant="outline" size="sm" className="text-zinc-500 hover:text-white text-xs border-zinc-700" onClick={() => handleResendEmail(selectedTicket.id)}>
                      Resend Email
                   </Button>
                   <Button onClick={() => setShowDetailsDialog(false)} className="bg-white text-black hover:bg-zinc-200">
                      Close
                   </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default SoldTicketsPage;
