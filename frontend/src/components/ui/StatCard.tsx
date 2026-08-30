import React from 'react';
import { cn } from '../../utils/cn';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  description,
  trend,
  className 
}) => {
  return (
    <div className={cn("bg-black/40 backdrop-blur-lg text-white p-6 rounded-2xl shadow-xl border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col justify-between group", className)}>
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">{value}</h3>
        </div>
        <div className="p-3 bg-primary/10 rounded-xl text-primary shadow-[inset_0px_0px_20px_rgba(59,130,246,0.1)] group-hover:scale-110 transition-transform duration-300">
          <Icon size={24} />
        </div>
      </div>
      
      {(description || trend) && (
        <div className="mt-4 flex items-center text-sm">
          {trend && (
            <span className={cn(
              "font-medium mr-2",
              trend.isPositive ? "text-emerald-500" : "text-destructive"
            )}>
              {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
            </span>
          )}
          {description && <span className="text-muted-foreground">{description}</span>}
        </div>
      )}
    </div>
  );
};
