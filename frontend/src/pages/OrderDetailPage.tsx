import React, { useEffect, useState } from 'react';
import type { Order } from '../types';
import { api } from '../api/client';
import { OrderTimeline } from '../components/Orders/OrderTimeline';
import { OrderStatusActions } from '../components/Orders/OrderStatusActions';
import { OrderItemsTable } from '../components/Orders/OrderItemsTable';
import { Badge } from '../components/UI/Badge';
import { Button } from '../components/UI/Button';
import { useToast } from '../components/UI/Toast';
import { ArrowLeft, RefreshCw, User, Calendar, FileText } from 'lucide-react';

interface OrderDetailPageProps {
  orderId: string;
  onBack: () => void;
}

export const OrderDetailPage: React.FC<OrderDetailPageProps> = ({ orderId, onBack }) => {
  const { showToast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const data = await api.getOrderById(orderId);
      setOrder(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch order details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={onBack} icon={<ArrowLeft className="w-4 h-4" />}>
          Back to Orders
        </Button>
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-500" />
          Loading Order #{orderId.substring(0, 8).toUpperCase()}...
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={onBack} icon={<ArrowLeft className="w-4 h-4" />}>
          Back to Orders
        </Button>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          Order not found.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Bar with Navigation & Header Metadata */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack} icon={<ArrowLeft className="w-4 h-4" />} className="px-3 py-2">
            Back
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-slate-100 tracking-tight">
                Order #{order.id.substring(0, 8).toUpperCase()}
              </h2>
              <Badge status={order.status} />
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">Full GUID: {order.id}</p>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={fetchOrderDetails}
          icon={<RefreshCw className="w-4 h-4" />}
          className="text-xs self-start sm:self-auto"
        >
          Refresh Status
        </Button>
      </div>

      {/* Customer & Summary Metadata Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl flex items-start gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Customer Account</p>
            <h4 className="text-base font-bold text-slate-100 mt-1">{order.customerName}</h4>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">ID: {order.customerId.substring(0, 13)}...</p>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl flex items-start gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date Created</p>
            <h4 className="text-base font-bold text-slate-100 mt-1">
              {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl flex items-start gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">QuickBooks Sync</p>
            {order.quickBooksInvoiceId ? (
              <div>
                <h4 className="text-base font-extrabold text-emerald-400 mt-1 font-mono">{order.quickBooksInvoiceId}</h4>
                <p className="text-[11px] text-emerald-300/80 mt-0.5 font-medium">Synced & Invoiced</p>
              </div>
            ) : (
              <div>
                <h4 className="text-sm font-semibold text-slate-500 mt-1">Not Invoiced Yet</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Pending Shipment Completion</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Visual Progression Timeline */}
      <OrderTimeline currentStatus={order.status} />

      {/* Workflow Action Buttons */}
      <OrderStatusActions order={order} onOrderUpdated={setOrder} />

      {/* Order Line Items Table */}
      <OrderItemsTable items={order.items} totalAmount={order.totalAmount} />
    </div>
  );
};
