import React, { useState, useEffect } from 'react';
import type { Customer, Product, Order } from '../../types';
import { api } from '../../api/client';
import { Button } from '../UI/Button';
import { useToast } from '../UI/Toast';
import { X, Plus, Minus, ShoppingBag, User, Package, CheckCircle2 } from 'lucide-react';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: (order: Order) => void;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  isOpen,
  onClose,
  onOrderCreated,
}) => {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [custs, prods] = await Promise.all([
        api.getCustomers(),
        api.getProducts(),
      ]);
      setCustomers(custs);
      setProducts(prods);

      if (custs.length > 0) {
        setSelectedCustomerId(custs[0].id);
      }

      // Initialize default quantities to 0
      const initialQty: Record<string, number> = {};
      prods.forEach((p) => {
        initialQty[p.id] = 0;
      });
      setQuantities(initialQty);
    } catch (err: any) {
      showToast(err.message || 'Failed to load customers and products.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const updateQuantity = (productId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [productId]: next };
    });
  };

  const calculateTotal = () => {
    return products.reduce((sum, p) => {
      const qty = quantities[p.id] || 0;
      return sum + qty * p.price;
    }, 0);
  };

  const calculateTotalItems = () => {
    return Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const items = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([productId, quantity]) => ({ productId, quantity }));

    if (items.length === 0) {
      showToast('Please select at least one product quantity.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const newOrder = await api.createOrder({
        customerId: selectedCustomerId,
        items,
      });

      showToast(`Order #${newOrder.id.substring(0, 8).toUpperCase()} created successfully!`, 'success');
      onOrderCreated(newOrder);
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to create order.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 my-8">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Create Fulfillment Order</h3>
              <p className="text-xs text-slate-400">Select customer and manifest line items</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading catalog data...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Customer Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" />
                Select Customer Account
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Manifest Items */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-400" />
                Product Manifest Items
              </label>
              <div className="space-y-3">
                {products.map((p) => {
                  const qty = quantities[p.id] || 0;
                  return (
                    <div
                      key={p.id}
                      className={`p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-4 ${
                        qty > 0
                          ? 'bg-blue-950/20 border-blue-500/30'
                          : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-400">{p.sku}</span>
                          <h4 className="text-sm font-bold text-slate-200">{p.name}</h4>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Stock Available: <strong className="text-slate-300">{p.availableQuantity} units</strong> | Price: ${p.price.toFixed(2)}
                        </p>
                      </div>

                      {/* Quantity Controller */}
                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateQuantity(p.id, -1)}
                          disabled={qty <= 0}
                          className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-mono font-bold text-sm text-slate-100">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(p.id, 1)}
                          className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:bg-slate-800 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Summary & Submit */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Order Subtotal</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-extrabold text-white">${calculateTotal().toFixed(2)}</span>
                  <span className="text-xs text-slate-400">({calculateTotalItems()} total items)</span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={submitting}
                  disabled={calculateTotalItems() === 0}
                  icon={<CheckCircle2 className="w-4 h-4" />}
                  className="w-full sm:w-auto"
                >
                  Create Order
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
