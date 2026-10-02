"use client"

import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { orderApi } from '@/lib/services/orderApi';
import { 
  ShoppingCart, Search, Loader2, CheckCircle2, Clock, 
  Filter, Download, DollarSign, XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Complete');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(10);

  useEffect(() => {
    loadOrders();
    loadStatistics();
  }, [currentPage, statusFilter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: perPage,
        search: searchTerm,
        status: statusFilter,
      };
      
      const response = await orderApi.getOrders(params);
      if (response.success) {
        setOrders(response.data);
        setTotalPages(response.meta.last_page);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await orderApi.getStatistics();
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
    loadOrders();
  };

  const handleViewDetails = async (orderId) => {
    try {
      const response = await orderApi.getOrder(orderId);
      if (response.success) {
        setSelectedOrder(response.data);
        setShowDetailsDialog(true);
      }
    } catch (error) {
      toast.error('Failed to load order details');
    }
  };

  const getPaymentBadge = (paymentMethod, status) => {
    const isComplete = status === 'Complete';
    const baseClasses = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide border";
    
    if (isComplete) {
      return (
        <span className={`${baseClasses} bg-emerald-500/10 text-emerald-400 border-emerald-500/20`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {paymentMethod || 'N/A'}
        </span>
      );
    } else {
      const styles = {
        'Pending': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        'Failed': 'bg-red-500/10 text-red-400 border-red-500/20',
        'Cancelled': 'bg-zinc-800 text-zinc-400 border-zinc-700',
      };
      
      const icons = {
        'Pending': <Clock className="h-3 w-3" />,
        'Failed': <XCircle className="h-3 w-3" />,
        'Cancelled': <XCircle className="h-3 w-3" />,
      };

      const style = styles[status] || styles['Pending'];
      const icon = icons[status] || icons['Pending'];

      return (
        <span className={`${baseClasses} ${style}`}>
          {icon}
          {paymentMethod || 'N/A'}
        </span>
      );
    }
  };

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
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Orders</h1>
            <p className="text-zinc-400 text-sm mt-1">View completed orders and receipts</p>
          </div>
          <Button 
            variant="outline" 
            className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800"
            onClick={() => toast.info('Export started...')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Stats Grid */}
        {statistics && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard 
              icon={ShoppingCart} 
              label="Total Orders" 
              value={statistics.total_orders} 
              colorClass="bg-blue-500 text-blue-500" 
              delay={0}
            />
            <StatCard 
              icon={CheckCircle2} 
              label="Completed" 
              value={statistics.completed_orders} 
              colorClass="bg-emerald-500 text-emerald-500"
              delay={100}
            />
            <StatCard 
              icon={Clock} 
              label="Pending" 
              value={statistics.pending_orders} 
              colorClass="bg-amber-500 text-amber-500"
              delay={200}
            />
            <StatCard 
              icon={DollarSign} 
              label="Revenue" 
              value={`KES ${parseFloat(statistics.total_revenue || 0).toLocaleString(undefined, {maximumFractionDigits:0})}`} 
              colorClass="bg-purple-500 text-purple-500"
              delay={300}
            />
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, event, or order ID..."
              className="w-full h-10 pl-10 pr-4 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-all"
            />
          </div>
          
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
                <option value="Complete">Complete</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            
            <Button onClick={handleSearch} className="h-10 bg-white text-black hover:bg-zinc-200 font-medium px-6">
              Search
            </Button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
                <ShoppingCart className="h-8 w-8 text-zinc-600" />
              </div>
              <h3 className="text-white font-medium mb-1">No orders found</h3>
              <p className="text-zinc-500 text-sm max-w-xs">
                Try adjusting your search or filters to find what you're looking for.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/50">
                    <th className="text-left px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Transaction ID</th>
                    <th className="text-left px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Event Name</th>
                    <th className="text-left px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Customer</th>
                    <th className="text-left px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Mode of Payment</th>
                    <th className="text-left px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Quantity</th>
                    <th className="text-left px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {orders.map((order) => (
                    <tr 
                      key={order.id}
                      onClick={() => handleViewDetails(order.id)}
                      className="group hover:bg-zinc-800/50 transition-colors cursor-pointer"
                    >
                      {/* Transaction ID */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                          {order.transaction_reference || order.token}
                        </span>
                      </td>

                      {/* Event Name */}
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-white truncate max-w-[200px] block">
                          {typeof order.items[0]?.event === 'string' 
                            ? order.items[0]?.event 
                            : order.items[0]?.event?.title || 'N/A'}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300 border border-zinc-700">
                            {(order.tickets?.[0]?.customer_name?.[0] || order.email?.[0] || 'U').toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm text-zinc-200">
                              {order.tickets?.[0]?.customer_name || order.email?.split('@')[0] || 'Guest User'}
                            </span>
                            <span className="text-xs text-zinc-500 truncate max-w-[150px]">
                              {order.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Mode of Payment */}
                      <td className="px-6 py-4">
                        {getPaymentBadge(order.payment_method, order.status)}
                      </td>

                      {/* Quantity */}
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-white">
                          {order.tickets?.length || order.items?.length || 0}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-white font-mono">
                          KES {parseFloat(order.paid_amount || order.amount || 0).toLocaleString()}
                        </span>
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

        {/* Order Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-lg p-0 overflow-hidden shadow-2xl">
            {selectedOrder && (
              <div className="flex flex-col max-h-[90vh]">
                {/* Receipt Header */}
                <div className="p-6 bg-zinc-900 border-b border-zinc-800">
                   <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-3 items-center">
                         <div className="p-2.5 bg-primary/10 rounded-lg">
                            <ShoppingCart className="h-5 w-5 text-primary" />
                         </div>
                         <div>
                            <h2 className="text-lg font-bold text-white">Order Details</h2>
                            <p className="text-xs text-zinc-500 font-mono mt-0.5">#{selectedOrder.transaction_reference || selectedOrder.token}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-2xl font-bold text-white">KES {parseFloat(selectedOrder.paid_amount || selectedOrder.amount).toLocaleString()}</p>
                         {getPaymentBadge(selectedOrder.payment_method, selectedOrder.status)}
                      </div>
                   </div>
                </div>

                {/* Scrollable Content */}
                <div className="p-6 overflow-y-auto space-y-6">
                   {/* Details */}
                   <div className="space-y-3">
                      <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Order Information</h3>
                      <div className="flex justify-between items-center py-2 border-b border-zinc-800/50 border-dashed">
                         <span className="text-xs text-zinc-500">Event</span>
                         <span className="text-sm text-white font-medium">
                           {typeof selectedOrder.items[0]?.event === 'string'
                             ? selectedOrder.items[0]?.event
                             : selectedOrder.items[0]?.event?.title || 'N/A'}
                         </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-zinc-800/50 border-dashed">
                         <span className="text-xs text-zinc-500">Customer</span>
                         <span className="text-sm text-zinc-300">{selectedOrder.tickets?.[0]?.customer_name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-zinc-800/50 border-dashed">
                         <span className="text-xs text-zinc-500">Email</span>
                         <span className="text-sm text-zinc-300 truncate max-w-[200px]">{selectedOrder.email}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-zinc-800/50 border-dashed">
                         <span className="text-xs text-zinc-500">Quantity</span>
                         <span className="text-sm text-zinc-300">{selectedOrder.tickets?.length || 0} tickets</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-zinc-800/50 border-dashed">
                         <span className="text-xs text-zinc-500">Payment Method</span>
                         <span className="text-sm text-zinc-300">{selectedOrder.payment_method || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-zinc-800/50 border-dashed">
                         <span className="text-xs text-zinc-500">Date</span>
                         <span className="text-sm text-zinc-300">{new Date(selectedOrder.created_at).toLocaleDateString()}</span>
                      </div>
                   </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex justify-end items-center gap-3">
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

export default OrdersPage;
