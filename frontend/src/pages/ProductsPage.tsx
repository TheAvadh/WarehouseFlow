import React, { useEffect, useState } from 'react';
import type { Product } from '../types';
import { api } from '../api/client';
import { Button } from '../components/UI/Button';
import { useToast } from '../components/UI/Toast';
import { ProductModal } from '../components/Products/ProductModal';
import { Package, PackagePlus, Edit, Trash2, Search, RefreshCw, Layers } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch product catalog.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAdd = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Are you sure you want to delete product "${product.name}" (${product.sku})?`)) {
      return;
    }

    try {
      await api.deleteProduct(product.id);
      showToast(`Product "${product.name}" removed from catalog.`, 'success');
      fetchProducts();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete product.', 'error');
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">Products Catalog</h2>
          <p className="text-xs text-slate-400 mt-1">Manage warehouse packaging inventory, pallets, and supplies</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={fetchProducts}
            isLoading={loading}
            icon={<RefreshCw className="w-4 h-4" />}
            className="text-xs"
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            onClick={handleAdd}
            icon={<PackagePlus className="w-4 h-4" />}
            className="text-xs shadow-blue-600/30"
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-xl">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/60 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800/80">
              <tr>
                <th className="px-6 py-3.5">SKU Code</th>
                <th className="px-6 py-3.5">Product Name</th>
                <th className="px-6 py-3.5 text-right">Unit Price</th>
                <th className="px-6 py-3.5 text-center">Available Stock</th>
                <th className="px-6 py-3.5 text-center">Stock Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Loading product catalog...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <Layers className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                    No products matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-blue-400">
                      {p.sku}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-100 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                        <Package className="w-4 h-4" />
                      </div>
                      {p.name}
                    </td>
                    <td className="px-6 py-4 text-right font-extrabold text-slate-200 font-mono">
                      ${p.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-300 font-mono">
                      {p.availableQuantity} units
                    </td>
                    <td className="px-6 py-4 text-center">
                      {p.availableQuantity > 50 ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          In Stock
                        </span>
                      ) : p.availableQuantity > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          Out of Stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handleEdit(p)}
                          icon={<Edit className="w-3.5 h-3.5" />}
                          className="px-2.5 py-1 text-xs"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleDelete(p)}
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

      <ProductModal
        isOpen={modalOpen}
        product={editingProduct}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchProducts}
      />
    </div>
  );
};
