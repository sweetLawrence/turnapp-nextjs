"use client"

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { customerApi } from '@/lib/services/customerApi';
import { 
  Users, Search, Loader2, Mail, Phone, Ticket, 
  DollarSign, Calendar, Download, Eye, Receipt,
  User, History, 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
 
} from '@/components/ui/dialog";

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(10);

  useEffect(() => {
    loadCustomers();
    loadStatistics();
  }, [currentPage]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: perPage,
        search: searchTerm,
      };
      
      const response = await customerApi.getCustomers(params);
      if (response.success) {
        setCustomers(response.data);
        setTotalPages(response.meta.last_page);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await customerApi.getStatistics();
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadCustomers();
  };

  const handleViewDetails = async (email) => {
    try {
      const response = await customerApi.getCustomer(email);
      if (response.success) {
        setSelectedCustomer(response.data);
        setShowDetailsDialog(true);
      }
    } catch (error) {
      toast.error('Failed to load customer details');
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
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Customers</h1>
            <p className="text-zinc-400 text-sm">View audience insights and purchase history.</p>
          </div>
          <Button 
            variant="outline" 
            className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 h-10 px-4 rounded-xl"
            onClick={() => toast.info('Export started...')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* HUD Stats */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard 
              icon={Users} 
              label="Total Customers" 
              value={statistics.total_customers} 
              color="text-blue-400" 
            />
            <StatCard 
              icon={Ticket} 
              label="Total Tickets" 
              value={statistics.total_tickets} 
              color="text-purple-400" 
            />
            <StatCard 
              icon={DollarSign} 
              label="Lifetime Revenue" 
              value={`KES ${parseFloat(statistics.total_revenue || 0).toLocaleString()}`} 
              color="text-primary" 
            />
            <StatCard 
              icon={Receipt} 
              label="Avg. Tickets / User" 
              value={statistics.avg_tickets_per_customer} 
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
              placeholder="Search by name, email, or phone..."
              className="w-full pl-10 pr-4 py-2 bg-transparent text-white placeholder-zinc-500 text-sm focus:outline-none"
            />
          </div>
          
          <div className="h-px w-full md:w-px md:h-6 bg-white/10 my-auto" />
          
          <Button type="button" onClick={handleSearch} className="bg-white text-black hover:bg-zinc-200 font-semibold h-9 rounded-lg">
            Search
          </Button>
        </div>

        {/* Customers List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl">
            <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4 border border-zinc-800 shadow-lg">
              <Users className="h-8 w-8 text-zinc-600" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No customers found</h3>
            <p className="text-zinc-500 text-sm max-w-sm text-center">
              Customers will appear here automatically after ticket purchases.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {customers.map((customer, index) => (
              <div 
                key={index}
                className="group relative bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 rounded-xl overflow-hidden transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-center p-5 pl-7 gap-6">
                  
                  {/* Left: Customer Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/5 flex items-center justify-center shadow-inner text-white font-bold text-lg">
                        {customer.customer_name ? customer.customer_name.charAt(0) : <User className="h-5 w-5" />}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white leading-tight">{customer.customer_name || 'Guest User'}</h3>
                        <div className="flex items-center gap-3 text-sm text-zinc-500 mt-1">
                          <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {customer.customer_email}</span>
                          {customer.phone_number && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-zinc-700" />
                              <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {customer.phone_number}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Activity Chips */}
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-950 border border-zinc-800 text-xs text-zinc-400">
                        <Calendar className="h-3 w-3" />
                        {customer.events_count} Events
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-950 border border-zinc-800 text-xs text-zinc-400">
                        <Ticket className="h-3 w-3" />
                        {customer.total_tickets} Tickets
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-950 border border-zinc-800 text-xs text-zinc-400">
                        <History className="h-3 w-3" />
                        Last: {new Date(customer.last_purchase).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Right: Value & Actions */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 md:pl-8 md:border-l border-white/5 min-w-[140px]">
                    <div className="text-right">
                      <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Total Spent</p>
                      <p className="text-xl font-bold text-white font-mono">
                        KES {parseFloat(customer.total_spent || 0).toLocaleString()}
                      </p>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetails(customer.customer_email)}
                      className="border-zinc-700 bg-zinc-800/50 hover:bg-white hover:text-black text-xs h-8 w-full md:w-auto"
                    >
                      <Eye className="h-3.5 w-3.5 mr-2" />
                      View Details
                    </Button>
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

        {/* Customer Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl p-0 gap-0">
            {selectedCustomer && (
              <>
                {/* Header */}
                <div className="p-6 border-b border-white/5 bg-zinc-900/50">
                   <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                         <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/5 flex items-center justify-center shadow-lg">
                            <span className="text-2xl font-bold text-white">
                               {selectedCustomer.customer.customer_name ? selectedCustomer.customer.customer_name.charAt(0) : <User />}
                            </span>
                         </div>
                         <div>
                            <h2 className="text-2xl font-bold text-white">
                               {selectedCustomer.customer.customer_name || 'Guest User'}
                            </h2>
                            <p className="text-sm text-zinc-500 mt-1">
                               Customer since {new Date().getFullYear()}
                            </p>
                         </div>
                      </div>
                      <div className="flex flex-col gap-1.5 items-start">
                         <a 
                            href={`mailto:${selectedCustomer.customer.customer_email}`}
                            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-primary transition-colors"
                         >
                            <Mail className="h-3.5 w-3.5" />
                            {selectedCustomer.customer.customer_email}
                         </a>
                         {selectedCustomer.customer.phone_number && (
                            <a 
                               href={`tel:${selectedCustomer.customer.phone_number}`}
                               className="flex items-center gap-2 text-sm text-zinc-400 hover:text-primary transition-colors"
                            >
                               <Phone className="h-3.5 w-3.5" />
                               {selectedCustomer.customer.phone_number}
                            </a>
                         )}
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-3 gap-4">
                      <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                         <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Lifetime Value</p>
                         <p className="text-lg font-bold text-white">KES {parseFloat(selectedCustomer.customer.total_spent || 0).toLocaleString()}</p>
                      </div>
                      <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                         <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Tickets Bought</p>
                         <p className="text-lg font-bold text-white">{selectedCustomer.customer.total_tickets}</p>
                      </div>
                      <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                         <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Events</p>
                         <p className="text-lg font-bold text-white">{selectedCustomer.customer.events_count}</p>
                      </div>
                   </div>
                </div>

                {/* Content */}
                <div className="p-6">
                   <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                         <History className="h-4 w-4 text-primary" />
                         Purchase History
                      </h3>
                      <span className="text-xs text-zinc-500">{selectedCustomer.tickets.length} Transactions</span>
                   </div>
                   
                   <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                      {selectedCustomer.tickets.map((ticket) => (
                        <div key={ticket.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors">
                          <div className="mb-2 sm:mb-0">
                             <p className="font-semibold text-white text-sm">{ticket.event.title}</p>
                             <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                               <span className="font-mono bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">{ticket.ticket_no}</span>
                               <span>•</span>
                               <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                             </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                             {ticket.is_checked_in && (
                               <span className="px-2 py-1 rounded-md text-[10px] uppercase font-bold bg-green-800 text-white">
                                  Checked In
                               </span>
                             )}
                             <p className="font-bold text-white text-sm">KES {parseFloat(ticket.amount).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                   </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex justify-end">
                   <Button onClick={() => setShowDetailsDialog(false)} variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white">
                      Close Details
                   </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default CustomersPage;