import React from 'react';
import { LayoutDashboard, ShoppingCart, Users, Package, Activity } from 'lucide-react';

interface SidebarProps {
  currentTab: 'dashboard' | 'orders' | 'customers' | 'products';
  onSelectTab: (tab: 'dashboard' | 'orders' | 'customers' | 'products') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 p-4 flex flex-col justify-between shrink-0 min-h-[calc(100vh-65px)]">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">
            Main Operations
          </p>
          <nav className="space-y-1.5">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                currentTab === 'dashboard'
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-900/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <LayoutDashboard className={`w-4 h-4 ${currentTab === 'dashboard' ? 'text-blue-400' : 'text-slate-400'}`} />
              Dashboard
            </button>

            <button
              onClick={() => onSelectTab('orders')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                currentTab === 'orders'
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-900/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <ShoppingCart className={`w-4 h-4 ${currentTab === 'orders' ? 'text-blue-400' : 'text-slate-400'}`} />
              Orders
            </button>
          </nav>
        </div>

        <div>
          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">
            Master Data
          </p>
          <nav className="space-y-1.5">
            <button
              onClick={() => onSelectTab('customers')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                currentTab === 'customers'
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-900/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Users className={`w-4 h-4 ${currentTab === 'customers' ? 'text-blue-400' : 'text-slate-400'}`} />
              Customers
            </button>

            <button
              onClick={() => onSelectTab('products')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                currentTab === 'products'
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-900/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Package className={`w-4 h-4 ${currentTab === 'products' ? 'text-blue-400' : 'text-slate-400'}`} />
              Products Catalog
            </button>
          </nav>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          System Status
        </div>
        <p className="text-[11px] text-slate-400">Backend API Online on :5000</p>
      </div>
    </aside>
  );
};
