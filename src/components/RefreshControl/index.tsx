import React, { useState } from 'react';
import { RefreshCw, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useGatewayStore } from '@/store/gatewayStore';
import { useFilterStore } from '@/store/filterStore';
import { useUIStore } from '@/store/uiStore';
import { formatDateTime } from '@/utils/dateUtils';

export const RefreshControl: React.FC = () => {
  const { refreshGateways, isLoading, lastRefreshTime, stats } = useGatewayStore();
  const { filters } = useFilterStore();
  const { showToast } = useUIStore();
  const [refreshSuccess, setRefreshSuccess] = useState(false);

  const handleRefresh = async () => {
    try {
      await refreshGateways();
      setRefreshSuccess(true);
      showToast('数据刷新成功，筛选条件已保留');
      setTimeout(() => setRefreshSuccess(false), 3000);
    } catch (error) {
      showToast('刷新失败，请稍后重试');
    }
  };

  const hasActiveFilters =
    filters.status !== 'all' ||
    filters.projectId !== 'all' ||
    filters.alertLevel !== 'all' ||
    filters.keyword.trim() !== '';

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Clock className="w-4 h-4" />
          <span>上次刷新：</span>
          <span className="text-slate-300 font-mono">
            {formatDateTime(lastRefreshTime)}
          </span>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 text-cyan-400 text-xs rounded-md border border-cyan-500/20">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>刷新时保留当前筛选条件</span>
          </div>
        )}

        {refreshSuccess && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 text-xs rounded-md border border-emerald-500/20 animate-pulse">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>刷新成功</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-xs text-slate-500">网关总数</div>
          <div className="text-lg font-bold text-slate-200 font-mono">{stats.total}</div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            isLoading
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 hover:border-cyan-500/50 active:scale-95'
          }`}
        >
          <RefreshCw
            className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
          />
          {isLoading ? '刷新中...' : '手动刷新'}
        </button>
      </div>
    </div>
  );
};

export default RefreshControl;
