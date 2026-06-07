import React from 'react';
import { Activity, WifiOff, Clock, AlertTriangle } from 'lucide-react';
import type { GatewayStatus } from '@/types';
import { getStatusColor, getStatusLabel } from '@/utils/statusUtils';

interface StatusCardProps {
  status: GatewayStatus | 'all';
  count: number;
  total: number;
  onClick?: () => void;
  isActive?: boolean;
}

const iconMap: Record<string, React.ReactNode> = {
  online: <Activity className="w-6 h-6" />,
  offline: <WifiOff className="w-6 h-6" />,
  timeout: <Clock className="w-6 h-6" />,
  alert: <AlertTriangle className="w-6 h-6" />,
};

const gradientMap: Record<string, string> = {
  online: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
  offline: 'from-red-500/20 to-red-500/5 border-red-500/30',
  timeout: 'from-amber-500/20 to-amber-500/5 border-amber-500/30',
  alert: 'from-purple-500/20 to-purple-500/5 border-purple-500/30',
  all: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30',
};

export const StatusCard: React.FC<StatusCardProps> = ({
  status,
  count,
  total,
  onClick,
  isActive,
}) => {
  const label = status === 'all' ? '总计' : getStatusLabel(status as GatewayStatus);
  const color = status === 'all' ? 'text-cyan-400' : getStatusColor(status as GatewayStatus);
  const icon = status === 'all' ? <Activity className="w-6 h-6" /> : iconMap[status];
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div
      onClick={onClick}
    className={`relative overflow-hidden rounded-xl border bg-gradient-to-br ${gradientMap[status]} p-5 transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-lg group ${
        isActive ? 'ring-2 ring-offset-2 ring-offset-slate-900' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400 mb-1">{label}</p>
          <p className={`text-4xl font-bold font-mono ${color}`}>
            {count.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 w-24 rounded-full bg-slate-700/50 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${percentage}%`,
                  background: color.includes('emerald')
                    ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                    : color.includes('red')
                    ? 'linear-gradient(90deg, #ef4444, #f87171)'
                    : color.includes('amber')
                    ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                    : color.includes('purple')
                    ? 'linear-gradient(90deg, #a855f7, #c084fc)'
                    : 'linear-gradient(90deg, #06b6d4, #22d3ee)',
                }}
              />
            </div>
            <span className="text-xs text-slate-500">{percentage}%</span>
          </div>
        </div>
        <div className={`p-3 rounded-lg bg-slate-800/50 ${color} group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
    </div>
  );
};
