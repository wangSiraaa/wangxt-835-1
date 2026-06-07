import React from 'react';
import { Server } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = '暂无数据',
  description = '没有匹配的网关设备',
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
      <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
        {icon || <Server className="w-8 h-8 text-slate-500" />}
      </div>
      <p className="text-sm font-medium text-slate-300 mb-1">{title}</p>
      <p className="text-xs">{description}</p>
    </div>
  );
};
