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
    <div className={cn("bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border flex flex-col justify-between", className)}>
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
        </div>
        <div className="p-3 bg-primary/10 rounded-full text-primary">
          <Icon size={20} />
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
