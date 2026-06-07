import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { useFilterStore } from '@/store/filterStore';
import { mockProjects } from '@/data/mockProjects';
import type { GatewayStatus, AlertLevel } from '@/types';
import { getStatusLabel, getStatusColor } from '@/utils/statusUtils';

export const FilterBar: React.FC = () => {
  const { filters, setStatus, setProjectId, setAlertLevel, setKeyword, resetFilters } = useFilterStore();

  const hasActiveFilters = filters.status !== 'all' || filters.projectId !== 'all' || filters.alertLevel !== 'all' || filters.keyword !== '';

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜索网关名称、编码、IP、位置..."
            value={filters.keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-400">筛选</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <X className="w-3 h-3" />
            重置
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">状态:</span>
          <div className="flex gap-1.5">
            {(['all', 'online', 'timeout', 'offline', 'alert'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                  filters.status === s
                    ? s === 'all'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : `${getStatusColor(s as GatewayStatus)} bg-slate-700/50 border border-slate-600`
                    : 'bg-slate-900/50 text-slate-400 border border-slate-700/50 hover:text-slate-300'
                }`}
              >
                {s === 'all' ? '全部' : getStatusLabel(s as GatewayStatus)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">项目:</span>
          <select
            value={filters.projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-900/50 border border-slate-700/50 rounded-md text-slate-300 focus:outline-none focus:border-cyan-500/50"
          >
            <option value="all">全部项目</option>
            {mockProjects.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">告警级别:</span>
          <select
            value={filters.alertLevel}
            onChange={(e) => setAlertLevel(e.target.value as AlertLevel | 'all')}
            className="px-3 py-1.5 text-xs bg-slate-900/50 border border-slate-700/50 rounded-md text-slate-300 focus:outline-none focus:border-cyan-500/50"
          >
            <option value="all">全部级别</option>
            <option value="critical">严重</option>
            <option value="warning">警告</option>
            <option value="info">提示</option>
          </select>
        </div>
      </div>
    </div>
  );
};
