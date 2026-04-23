import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number | React.ReactNode;
  unit?: string;
  icon: LucideIcon;
  color: 'emerald' | 'blue' | 'orange' | 'red' | 'stone';
  description?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  unit, 
  icon: Icon, 
  color,
  description 
}) => {
  const colorClasses = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    stone: 'bg-stone-50 text-stone-600 border-stone-100',
  };

  const iconBgClasses = {
    emerald: 'bg-emerald-100 text-emerald-600',
    blue: 'bg-blue-100 text-blue-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600',
    stone: 'bg-stone-100 text-stone-600',
  };

  return (
    <div className={`p-6 rounded-3xl border-2 transition-all hover:shadow-lg hover:scale-[1.02] ${colorClasses[color]}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-2xl ${iconBgClasses[color]}`}>
          <Icon size={24} />
        </div>
        {description && (
          <span className="text-[10px] font-black uppercase tracking-wider opacity-60 bg-white/50 px-2 py-1 rounded-lg">
            {description}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-black opacity-70 mb-1">{title}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black tracking-tight">{value}</span>
          {unit && <span className="text-sm font-bold opacity-60">{unit}</span>}
        </div>
      </div>
    </div>
  );
};
