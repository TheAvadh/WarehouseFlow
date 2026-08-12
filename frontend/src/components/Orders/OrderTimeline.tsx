import React from 'react';
import { OrderStatus } from '../../types';
import { Check, Clock, PackageCheck, Truck, Receipt, Layers } from 'lucide-react';

interface OrderTimelineProps {
  currentStatus: string;
}

const STEPS = [
  { key: 'Created', label: 'Order Created', icon: Layers, statusVal: OrderStatus.Created },
  { key: 'Picking', label: 'Picking', icon: Clock, statusVal: OrderStatus.Picking },
  { key: 'Packed', label: 'Packed', icon: PackageCheck, statusVal: OrderStatus.Packed },
  { key: 'Shipped', label: 'Shipped', icon: Truck, statusVal: OrderStatus.Shipped },
  { key: 'Invoiced', label: 'Invoiced', icon: Receipt, statusVal: OrderStatus.Invoiced },
];

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ currentStatus }) => {
  const getStatusIndex = (statusStr: string): number => {
    switch (statusStr.toLowerCase()) {
      case 'created':
        return 0;
      case 'picking':
        return 1;
      case 'packed':
        return 2;
      case 'shipped':
        return 3;
      case 'invoiced':
        return 4;
      default:
        return 0;
    }
  };

  const currentIndex = getStatusIndex(currentStatus);

  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-6 flex items-center justify-between">
        <span>Order Progression Timeline</span>
        <span className="text-xs font-normal text-slate-400 capitalize">
          Current State: <strong className="text-blue-400 font-semibold">{currentStatus}</strong>
        </span>
      </h3>

      <div className="relative flex items-center justify-between">
        {/* Background Connecting Bar */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -translate-y-1/2 z-0 rounded-full" />
        
        {/* Active Progress Bar */}
        <div
          className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 -translate-y-1/2 z-0 rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${(currentIndex / (STEPS.length - 1)) * 100}%`,
          }}
        />

        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center group">
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20 shadow-lg shadow-emerald-500/20'
                    : isCurrent
                    ? 'bg-blue-600 text-white ring-4 ring-blue-500/30 shadow-lg shadow-blue-500/30 scale-110'
                    : 'bg-slate-950 text-slate-500 border-2 border-slate-800'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 stroke-[3]" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>

              <div className="mt-3 text-center">
                <p
                  className={`text-xs font-semibold tracking-tight transition-colors ${
                    isCurrent
                      ? 'text-blue-400'
                      : isCompleted
                      ? 'text-slate-200'
                      : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                  Stage {idx + 1}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
