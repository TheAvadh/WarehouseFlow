import React from 'react';
import { Card } from '../UI/Card';
import type { DashboardData } from '../../types';
import { ShoppingBag, Box, Truck, Receipt } from 'lucide-react';

interface KpiCardsProps {
  data: DashboardData | null;
  loading: boolean;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse p-6" />
        ))}
      </div>
    );
  }

  const kpis = [
    {
      title: 'Total Orders',
      value: data.totalOrders,
      subtitle: `${data.totalProducts} unique product SKUs`,
      icon: <ShoppingBag className="w-5 h-5 text-blue-400" />,
      gradient: 'from-blue-500/10 to-indigo-500/10',
      border: 'border-blue-500/20',
    },
    {
      title: 'Picking',
      value: data.picking,
      subtitle: 'Items currently in fulfillment',
      icon: <Box className="w-5 h-5 text-amber-400" />,
      gradient: 'from-amber-500/10 to-orange-500/10',
      border: 'border-amber-500/20',
    },
    {
      title: 'Shipped',
      value: data.shipped,
      subtitle: 'Dispatched to customer',
      icon: <Truck className="w-5 h-5 text-cyan-400" />,
      gradient: 'from-cyan-500/10 to-blue-500/10',
      border: 'border-cyan-500/20',
    },
    {
      title: 'Invoiced',
      value: data.invoiced,
      subtitle: `$${data.totalRevenue.toFixed(2)} total order value`,
      icon: <Receipt className="w-5 h-5 text-emerald-400" />,
      gradient: 'from-emerald-500/10 to-teal-500/10',
      border: 'border-emerald-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {kpis.map((kpi, idx) => (
        <Card key={idx} className={`bg-gradient-to-br ${kpi.gradient} ${kpi.border} relative overflow-hidden group hover:scale-[1.02]`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">{kpi.title}</span>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-inner">
              {kpi.icon}
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-3xl font-extrabold text-white tracking-tight">{kpi.value}</h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">{kpi.subtitle}</p>
        </Card>
      ))}
    </div>
  );
};
