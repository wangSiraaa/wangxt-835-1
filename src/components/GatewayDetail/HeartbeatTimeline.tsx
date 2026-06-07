import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { HeartbeatRecord } from '@/types';
import { formatTime } from '@/utils/dateUtils';

interface HeartbeatTimelineProps {
  heartbeats: HeartbeatRecord[];
}

export const HeartbeatTimeline: React.FC<HeartbeatTimelineProps> = ({ heartbeats }) => {
  const recent = heartbeats.slice(0, 10);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-slate-300">最近心跳记录</h4>
        <span className="text-xs text-slate-500">显示最近10条</span>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
        {recent.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            暂无心跳记录
          </div>
        ) : (
          recent.map((hb, index) => (
            <div
              key={hb.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
            >
              <div className="relative">
                {hb.status === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
                {index < recent.length - 1 && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-px h-6 bg-slate-700" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-slate-300">
                    {formatTime(new Date(hb.timestamp))}
                  </span>
                  <span className="text-xs text-slate-500">
                    延迟 {hb.latency}ms
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  {hb.status === 'success' ? '心跳正常' : '心跳失败'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HeartbeatTimeline;
