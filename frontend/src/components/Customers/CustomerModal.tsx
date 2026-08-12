import React, { useState, useEffect } from 'react';
import type { Customer } from '../../types';
import { api } from '../../api/client';
import { Button } from '../UI/Button';
import { useToast } from '../UI/Toast';
import { X, UserPlus, CheckCircle2 } from 'lucide-react';

interface CustomerModalProps {
  isOpen: boolean;
  customer: Customer | null; // null for add, Customer object for edit
  onClose: () => void;
  onSuccess: () => void;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  customer,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (customer) {
      setName(customer.name);
    } else {
      setName('');
    }
  }, [customer, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Customer name cannot be empty.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (customer) {
        await api.updateCustomer(customer.id, name.trim());
        showToast('Customer account updated successfully!', 'success');
      } else {
        await api.createCustomer(name.trim());
        showToast('New customer account created successfully!', 'success');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to save customer.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">
                {customer ? 'Edit Customer Account' : 'Add Customer Account'}
              </h3>
              <p className="text-xs text-slate-400">Specify company or customer details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Customer Name / Business Entity
            </label>
            <input
              type="text"
              placeholder="e.g. Acme Fulfillment Corp"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={submitting}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              {customer ? 'Save Changes' : 'Create Account'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
