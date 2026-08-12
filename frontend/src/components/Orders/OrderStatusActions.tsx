import React, { useState } from 'react';
import type { Order } from '../../types';
import { Button } from '../UI/Button';
import { useToast } from '../UI/Toast';
import { api } from '../../api/client';
import { Play, PackageCheck, Truck, FileText, CheckCircle2, Receipt } from 'lucide-react';

interface OrderStatusActionsProps {
  order: Order;
  onOrderUpdated: (updatedOrder: Order) => void;
}

export const OrderStatusActions: React.FC<OrderStatusActionsProps> = ({ order, onOrderUpdated }) => {
  const { showToast } = useToast();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handlePick = async () => {
    setLoadingAction('pick');
    try {
      const updated = await api.pickOrder(order.id);
      onOrderUpdated(updated);
      showToast(`Order status updated to Picking! Inventory decremented.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to start picking order.', 'error');
    } finally {
      setLoadingAction(null);
    }
  };

  const handlePack = async () => {
    setLoadingAction('pack');
    try {
      const updated = await api.packOrder(order.id);
      onOrderUpdated(updated);
      showToast(`Order status updated to Packed!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to mark order as packed.', 'error');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleShip = async () => {
    setLoadingAction('ship');
    try {
      const updated = await api.shipOrder(order.id);
      onOrderUpdated(updated);
      showToast(`Order status updated to Shipped!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to ship order.', 'error');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleInvoice = async () => {
    setLoadingAction('invoice');
    try {
      const updated = await api.invoiceOrder(order.id);
      onOrderUpdated(updated);
      showToast(
        `QuickBooks Invoice ${updated.quickBooksInvoiceId || ''} generated successfully!`,
        'success'
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to generate QuickBooks invoice.', 'error');
    } finally {
      setLoadingAction(null);
    }
  };

  const statusStr = order.status;

  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100">Order Workflow Actions</h3>
          <p className="text-xs text-slate-400">Advance order state along the warehouse lifecycle</p>
        </div>

        {order.quickBooksInvoiceId && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <Receipt className="w-4 h-4 text-emerald-400" />
            QB Invoice: <span className="font-mono font-bold text-white">{order.quickBooksInvoiceId}</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        {/* Step 1: Pick */}
        <Button
          variant={statusStr === 'Created' ? 'primary' : 'outline'}
          disabled={statusStr !== 'Created'}
          isLoading={loadingAction === 'pick'}
          onClick={handlePick}
          icon={<Play className="w-4 h-4" />}
        >
          Complete Picking
        </Button>

        {/* Step 2: Pack */}
        <Button
          variant={statusStr === 'Picking' ? 'primary' : 'outline'}
          disabled={statusStr !== 'Picking'}
          isLoading={loadingAction === 'pack'}
          onClick={handlePack}
          icon={<PackageCheck className="w-4 h-4" />}
        >
          Mark as Packed
        </Button>

        {/* Step 3: Ship */}
        <Button
          variant={statusStr === 'Packed' ? 'primary' : 'outline'}
          disabled={statusStr !== 'Packed'}
          isLoading={loadingAction === 'ship'}
          onClick={handleShip}
          icon={<Truck className="w-4 h-4" />}
        >
          Mark as Shipped
        </Button>

        {/* Step 4: Invoice */}
        <Button
          variant="success"
          disabled={statusStr !== 'Shipped' && statusStr !== 'Invoiced'}
          isLoading={loadingAction === 'invoice'}
          onClick={handleInvoice}
          icon={<FileText className="w-4 h-4" />}
          className={statusStr === 'Shipped' ? 'animate-pulse ring-2 ring-emerald-500/50' : ''}
        >
          {statusStr === 'Invoiced' ? 'Re-Sync QuickBooks Invoice' : 'Create QuickBooks Invoice'}
        </Button>
      </div>

      {statusStr === 'Invoiced' && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-200">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="font-semibold text-white">Order Fully Fulfilled & Invoiced</p>
              <p className="text-[11px] text-emerald-300/80">
                QuickBooks Invoice Reference <strong className="font-mono">{order.quickBooksInvoiceId}</strong> has been logged to accounting ledger.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
