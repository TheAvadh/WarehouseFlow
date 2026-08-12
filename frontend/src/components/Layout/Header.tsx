import React, { useState } from 'react';
import { Package, ChevronDown, User, LogOut, Settings, Bell } from 'lucide-react';

export const Header: React.FC = () => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 border-b border-slate-800/80 backdrop-blur-xl px-6 py-3.5">
      <div className="flex items-center justify-between">
        {/* Brand Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent tracking-tight">
              WarehouseFlow
            </h1>
            <p className="text-xs text-slate-400 font-medium">Fulfillment & Invoicing Hub</p>
          </div>
        </div>

        {/* Action Controls & User Dropdown */}
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500" />
          </button>

          {/* User Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all duration-200"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xs shadow-inner">
                DU
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-slate-200">Demo User</p>
                <p className="text-[10px] text-slate-400">Warehouse Manager</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-800">
                    <p className="text-xs font-semibold text-slate-200">Demo User</p>
                    <p className="text-[11px] text-slate-400 truncate">user@warehouseflow.io</p>
                  </div>
                  <button className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-2 transition-colors">
                    <User className="w-3.5 h-3.5" /> Profile Settings
                  </button>
                  <button className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-2 transition-colors">
                    <Settings className="w-3.5 h-3.5" /> System Prefs
                  </button>
                  <div className="border-t border-slate-800 my-1" />
                  <button className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-950/30 flex items-center gap-2 transition-colors">
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
