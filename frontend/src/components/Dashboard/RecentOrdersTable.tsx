import React from 'react';
import type { Order } from '../../types';
import { Badge } from '../UI/Badge';
import { Button } from '../UI/Button';
import { Eye } from 'lucide-react';

interface RecentOrdersTableProps {
  orders: Order[];
  loading: boolean;
  onViewOrder: (orderId: string) => void;
}

export const RecentOrdersTable: React.FC<RecentOrdersTableProps> = ({
  orders,
  loading,
  onViewOrder,
}) => {
  if (loading) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="h-6 w-48 bg-slate-800 rounded animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-slate-800/50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl">
      <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Recent Orders</h2>
          <p className="text-xs text-slate-400">Live order queue from warehouse database</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/60 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800/80">
            <tr>
              <th className="px-6 py-3.5">Order ID</th>
              <th className="px-6 py-3.5">Customer</th>
              <th className="px-6 py-3.5">Date Created</th>
              <th className="px-6 py-3.5">Total Amount</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500 text-sm">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
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
                  <td className="px-6 py-4 font-medium text-slate-200">
                    ${order.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge status={order.status} />
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
                      View Details
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
