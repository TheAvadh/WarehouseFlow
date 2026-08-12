import React, { useEffect, useState } from 'react';
import type { Order } from '../types';
import { api } from '../api/client';
import { Badge } from '../components/UI/Badge';
import { Button } from '../components/UI/Button';
import { useToast } from '../components/UI/Toast';
import { Eye, Search, Filter, RefreshCw, ShoppingCart, Plus } from 'lucide-react';

interface OrdersListPageProps {
  onViewOrder: (id: string) => void;
  onCreateOrderClick: () => void;
}

export const OrdersListPage: React.FC<OrdersListPageProps> = ({ onViewOrder, onCreateOrderClick }) => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch orders from server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.quickBooksInvoiceId && order.quickBooksInvoiceId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' || order.status.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">Order Queue Management</h2>
          <p className="text-xs text-slate-400 mt-1">View, track, and manage all customer fulfillment orders</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={fetchOrders}
            isLoading={loading}
            icon={<RefreshCw className="w-4 h-4" />}
            className="text-xs"
          >
            Refresh Orders
          </Button>
          <Button
            variant="primary"
            onClick={onCreateOrderClick}
            icon={<Plus className="w-4 h-4" />}
            className="text-xs shadow-blue-600/30"
          >
            Create Order
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Order ID, Customer, Invoice..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          {['ALL', 'CREATED', 'PICKING', 'PACKED', 'SHIPPED', 'INVOICED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/60 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800/80">
              <tr>
                <th className="px-6 py-3.5">Order Ref</th>
                <th className="px-6 py-3.5">Customer Name</th>
                <th className="px-6 py-3.5">Date Created</th>
                <th className="px-6 py-3.5">Line Items</th>
                <th className="px-6 py-3.5">Total Amount</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">QB Invoice</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Loading orders from database...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                    No orders matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                    onClick={() => onViewOrder(order.id)}
                  >
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-blue-400">
                      #{order.id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-200">
                      {order.customerName}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-300 font-medium">
                      {order.totalItems} items ({order.items?.length || 0} SKUs)
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-100">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={order.status} />
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      {order.quickBooksInvoiceId ? (
                        <span className="text-emerald-400 font-semibold">{order.quickBooksInvoiceId}</span>
                      ) : (
                        <span className="text-slate-600">--</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewOrder(order.id);
                        }}
                        icon={<Eye className="w-3.5 h-3.5" />}
                        className="px-3 py-1.5 text-xs"
                      >
                        Manage
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
