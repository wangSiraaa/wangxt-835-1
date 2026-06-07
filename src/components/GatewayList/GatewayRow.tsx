import React from 'react';
import { ChevronRight, AlertCircle } from 'lucide-react';
import type { Gateway } from '@/types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { AlertBadge } from '@/components/common/AlertBadge';
import { useGatewayStatus } from '@/hooks/useGatewayStatus';
import { formatRelativeTime } from '@/utils/dateUtils';
import { mockProjects } from '@/data/mockProjects';

interface GatewayRowProps {
  gateway: Gateway;
  onClick: () => void;
}

export const GatewayRow: React.FC<GatewayRowProps> = ({ gateway, onClick }) => {
  const { actualStatus, hasUnresolvedAlerts, timeSinceHeartbeat } = useGatewayStatus(gateway);

  const project = mockProjects.find((p) => p.id === gateway.projectId);
  const unresolvedAlerts = gateway.alerts.filter((a) => !a.resolved);
  const highestAlertLevel = unresolvedAlerts.reduce(
    (max, a) => {
      const priority = { critical: 3, warning: 2, info: 1 };
      return priority[a.level] > (priority[max] || 0) ? a.level : max;
    },
    null as 'critical' | 'warning' | 'info' | null
  );

  return (
    <tr
      onClick={onClick}
      className="border-b border-slate-700/50 hover:bg-slate-800/30 cursor-pointer transition-colors group"
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
            <div className={`w-2.5 h-2.5 rounded-full ${
              actualStatus === 'online' ? 'bg-emerald-400' :
              actualStatus === 'offline' ? 'bg-red-400' :
              actualStatus === 'timeout' ? 'bg-amber-400' : 'bg-purple-400'
            } ${actualStatus !== 'offline' ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-200 group-hover:text-cyan-400 transition-colors">
              {gateway.name}
            </p>
            <p className="text-xs text-slate-500 font-mono">{gateway.code}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs font-mono text-slate-400">{gateway.ip}</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs text-slate-400">{project?.name || '-'}</span>
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={actualStatus} />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {hasUnresolvedAlerts && highestAlertLevel && (
            <>
              <AlertBadge level={highestAlertLevel} count={unresolvedAlerts.length} />
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            </>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="text-xs text-slate-400">{formatRelativeTime(gateway.lastHeartbeat)}</p>
        {timeSinceHeartbeat.minutes > 0 && (
          <p className="text-xs text-slate-500">
            {timeSinceHeartbeat.minutes}分{timeSinceHeartbeat.seconds % 60}秒前
          </p>
        )}
      </td>
      <td className="px-4 py-3">
        <p className="text-xs text-slate-400">{gateway.reportFrequency}s / 次</p>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs text-slate-400">{gateway.location}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end">
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
        </div>
      </td>
    </tr>
  );
};
