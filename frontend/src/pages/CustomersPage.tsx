import React, { useEffect, useState } from 'react';
import type { Customer } from '../types';
import { api } from '../api/client';
import { Button } from '../components/UI/Button';
import { useToast } from '../components/UI/Toast';
import { CustomerModal } from '../components/Customers/CustomerModal';
import { Users, UserPlus, Edit, Trash2, Search, RefreshCw } from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await api.getCustomers();
      setCustomers(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch customers list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleAdd = () => {
    setEditingCustomer(null);
    setModalOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setModalOpen(true);
  };

  const handleDelete = async (customer: Customer) => {
    if (!window.confirm(`Are you sure you want to delete customer "${customer.name}"?`)) {
      return;
    }

    try {
      await api.deleteCustomer(customer.id);
      showToast(`Customer "${customer.name}" deleted successfully.`, 'success');
      fetchCustomers();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete customer account.', 'error');
    }
  };

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">Customer Accounts</h2>
          <p className="text-xs text-slate-400 mt-1">Manage warehouse client accounts & billing entities</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={fetchCustomers}
            isLoading={loading}
            icon={<RefreshCw className="w-4 h-4" />}
            className="text-xs"
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            onClick={handleAdd}
            icon={<UserPlus className="w-4 h-4" />}
            className="text-xs shadow-blue-600/30"
          >
            Add Customer
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-xl">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/60 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800/80">
              <tr>
                <th className="px-6 py-3.5">Customer Name</th>
                <th className="px-6 py-3.5">Account GUID</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Loading customers...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                    No customer accounts found.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-100 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                        {c.name.substring(0, 2).toUpperCase()}
                      </div>
                      {c.name}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      {c.id}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handleEdit(c)}
                          icon={<Edit className="w-3.5 h-3.5" />}
                          className="px-2.5 py-1 text-xs"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleDelete(c)}
                          icon={<Trash2 className="w-3.5 h-3.5" />}
                          className="px-2.5 py-1 text-xs"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CustomerModal
        isOpen={modalOpen}
        customer={editingCustomer}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchCustomers}
      />
    </div>
  );
};
