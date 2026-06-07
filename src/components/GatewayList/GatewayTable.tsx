import React from 'react';
import { GatewayRow } from './GatewayRow';
import { EmptyState } from '@/components/common/EmptyState';
import { useGatewayStore } from '@/store/gatewayStore';
import { useUIStore } from '@/store/uiStore';
import { useFilter } from '@/hooks/useFilter';
import { useAutoStatusUpdate } from '@/hooks/useGatewayStatus';

export const GatewayTable: React.FC = () => {
  const { isLoading } = useGatewayStore();
  const { filteredGateways } = useFilter();
  const { openDrawer } = useUIStore();

  useAutoStatusUpdate();

  if (filteredGateways.length === 0 && !isLoading) {
    return <EmptyState />;
  }

  return (
    <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-800/50 border-b border-slate-700/50">
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                网关名称
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                IP 地址
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                所属项目
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                状态
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                告警
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                最后心跳
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                上报频率
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                位置
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-700/50">
                  {Array.from({ length: 9 }).map((_, j) => (
                    <td key={j} className="px-4 py-4">
                      <div className="h-4 bg-slate-700/50 rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              filteredGateways.map((gateway) => (
                <GatewayRow
                  key={gateway.id}
                  gateway={gateway}
                  onClick={() => openDrawer(gateway.id)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 bg-slate-800/50 border-t border-slate-700/50">
        <p className="text-xs text-slate-500">
          共 <span className="text-slate-300 font-mono">{filteredGateways.length}</span> 个网关
        </p>
      </div>
    </div>
  );
};
