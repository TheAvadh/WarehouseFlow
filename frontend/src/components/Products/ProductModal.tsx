import React, { useState, useEffect } from 'react';
import type { Product } from '../../types';
import { api } from '../../api/client';
import { Button } from '../UI/Button';
import { useToast } from '../UI/Toast';
import { X, PackagePlus, CheckCircle2 } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  product,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [availableQuantity, setAvailableQuantity] = useState<number | ''>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setSku(product.sku);
      setName(product.name);
      setPrice(product.price);
      setAvailableQuantity(product.availableQuantity);
    } else {
      setSku('');
      setName('');
      setPrice('');
      setAvailableQuantity('');
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim()) {
      showToast('Product SKU is required.', 'error');
      return;
    }
    if (!name.trim()) {
      showToast('Product name is required.', 'error');
      return;
    }
    if (price === '' || Number(price) < 0) {
      showToast('Please enter a valid price.', 'error');
      return;
    }
    if (availableQuantity === '' || Number(availableQuantity) < 0) {
      showToast('Please enter a valid stock quantity.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const data = {
        sku: sku.trim().toUpperCase(),
        name: name.trim(),
        price: Number(price),
        availableQuantity: Number(availableQuantity),
      };

      if (product) {
        await api.updateProduct(product.id, data);
        showToast(`Product "${data.name}" updated successfully!`, 'success');
      } else {
        await api.createProduct(data);
        showToast(`New product "${data.name}" added to catalog!`, 'success');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to save product.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">
                {product ? 'Edit Product SKU' : 'Add Product to Catalog'}
              </h3>
              <p className="text-xs text-slate-400">Define pricing and inventory stock levels</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Stock Keeping Unit (SKU)
              </label>
              <input
                type="text"
                placeholder="e.g. BOX-HVY-001"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Product Name
              </label>
              <input
                type="text"
                placeholder="e.g. Shipping Box - Heavy Duty"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Unit Price ($ USD)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Available Inventory (Units)
              </label>
              <input
                type="number"
                min="0"
                placeholder="100"
                value={availableQuantity}
                onChange={(e) => setAvailableQuantity(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={submitting}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              {product ? 'Save Product' : 'Add to Catalog'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
