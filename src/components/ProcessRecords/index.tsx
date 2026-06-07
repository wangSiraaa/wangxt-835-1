import React from 'react';
import { Clock, User, Activity, FileText } from 'lucide-react';
import { useGatewayStore } from '@/store/gatewayStore';
import { formatDateTime } from '@/utils/dateUtils';
import { EmptyState } from '@/components/common/EmptyState';

export const ProcessRecords: React.FC = () => {
  const { processRecords, gateways } = useGatewayStore();

  const getGatewayName = (gatewayId: string) => {
    const gw = gateways.find((g) => g.id === gatewayId);
    return gw ? gw.name : '未知网关';
  };

  const getGatewayCode = (gatewayId: string) => {
    const gw = gateways.find((g) => g.id === gatewayId);
    return gw ? gw.code : 'N/A';
  };

  if (processRecords.length === 0) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <EmptyState
          icon={<FileText className="w-12 h-12" />}
          title="暂无处理记录"
          description="处理记录将在执行操作后显示"
        />
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-800">
        <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          处理记录
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          最近的网关处理操作记录
        </p>
      </div>

      <div className="divide-y divide-slate-800 max-h-[400px] overflow-y-auto">
        {processRecords.map((record) => (
          <div
            key={record.id}
            className="px-6 py-4 hover:bg-slate-800/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/10 text-cyan-400 text-xs font-medium rounded-md border border-cyan-500/20">
                    <Activity className="w-3 h-3" />
                    {record.action}
                  </span>
                  <span className="text-sm text-slate-400">
                    {getGatewayName(record.gatewayId)}
                  </span>
                  <span className="text-xs text-slate-600 font-mono">
                    {getGatewayCode(record.gatewayId)}
                  </span>
                </div>
                <p className="text-sm text-slate-300 mb-2">{record.result}</p>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {record.operator}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDateTime(new Date(record.createdAt))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProcessRecords;
