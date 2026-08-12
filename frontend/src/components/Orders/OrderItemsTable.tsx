import React from 'react';
import type { OrderItem } from '../../types';
import { Package } from 'lucide-react';

interface OrderItemsTableProps {
  items: OrderItem[];
  totalAmount: number;
}

export const OrderItemsTable: React.FC<OrderItemsTableProps> = ({ items, totalAmount }) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl">
      <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Order Manifest Items</h3>
            <p className="text-xs text-slate-400">{items.length} unique line items</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/60 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800/80">
            <tr>
              <th className="px-6 py-3.5">SKU</th>
              <th className="px-6 py-3.5">Product Name</th>
              <th className="px-6 py-3.5 text-center">Quantity</th>
              <th className="px-6 py-3.5 text-right">Unit Price</th>
              <th className="px-6 py-3.5 text-right">Total Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4 font-mono text-xs font-semibold text-blue-400">
                  {item.productSKU}
                </td>
                <td className="px-6 py-4 font-medium text-slate-200">
                  {item.productName}
                </td>
                <td className="px-6 py-4 text-center font-semibold text-slate-300">
                  {item.quantity}
                </td>
                <td className="px-6 py-4 text-right font-medium text-slate-400">
                  ${item.unitPrice.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-right font-bold text-slate-100">
                  ${(item.quantity * item.unitPrice).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-950/80 border-t border-slate-800/80 font-semibold text-slate-200">
            <tr>
              <td colSpan={4} className="px-6 py-4 text-right text-slate-400 uppercase text-xs tracking-wider">
                Order Grand Total:
              </td>
              <td className="px-6 py-4 text-right text-lg font-extrabold text-blue-400">
                ${totalAmount.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
