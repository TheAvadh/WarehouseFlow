import React from 'react';

interface BadgeProps {
  status: string;
}

export const Badge: React.FC<BadgeProps> = ({ status }) => {
  const getColors = () => {
    switch (status.toLowerCase()) {
      case 'created':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'picking':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'packed':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      case 'shipped':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      case 'invoiced':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getColors()}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
      {status}
    </span>
  );
};
