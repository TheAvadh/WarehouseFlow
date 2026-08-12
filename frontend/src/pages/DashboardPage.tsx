import React, { useEffect, useState } from 'react';
import type { DashboardData, Order } from '../types';
import { api } from '../api/client';
import { KpiCards } from '../components/Dashboard/KpiCards';
import { RecentOrdersTable } from '../components/Dashboard/RecentOrdersTable';
import { useToast } from '../components/UI/Toast';
import { RefreshCw, Plus } from 'lucide-react';
import { Button } from '../components/UI/Button';

interface DashboardPageProps {
  onViewOrder: (id: string) => void;
  onCreateOrderClick: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onViewOrder, onCreateOrderClick }) => {
  const { showToast } = useToast();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dash, ords] = await Promise.all([
        api.getDashboard(),
        api.getOrders(),
      ]);
      setDashboardData(dash);
      setOrders(ords);
    } catch (err: any) {
      showToast(err.message || 'Failed to load dashboard data from server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">Fulfillment Dashboard</h2>
          <p className="text-xs text-slate-400 mt-1">Real-time overview of warehouse operations & stock metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={loadData}
            isLoading={loading}
            icon={<RefreshCw className="w-4 h-4" />}
            className="text-xs"
          >
            Refresh Data
          </Button>
          <Button
            variant="primary"
            onClick={onCreateOrderClick}
            icon={<Plus className="w-4 h-4" />}
            className="text-xs shadow-blue-600/30"
          >
            Create Order
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <KpiCards data={dashboardData} loading={loading} />

      {/* Recent Orders Table */}
      <RecentOrdersTable orders={orders} loading={loading} onViewOrder={onViewOrder} />
    </div>
  );
};
