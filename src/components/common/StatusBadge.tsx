import React from 'react';
import type { GatewayStatus } from '@/types';
import { getStatusBgColor, getStatusLabel, getStatusDotColor } from '@/utils/statusUtils';

interface StatusBadgeProps {
  status: GatewayStatus;
  pulse?: boolean;
  showLabel?: boolean;
  count?: number;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  pulse = true, 
  showLabel = true,
  count 
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium ${getStatusBgColor(status)}`}
    >
      <span
        className={`w-2 h-2 rounded-full ${getStatusDotColor(status)} ${
          pulse && status !== 'offline' ? 'animate-pulse' : ''
        }`}
      />
      {count !== undefined && (
        <span className="font-mono font-semibold">{count}</span>
      )}
      {showLabel && getStatusLabel(status)}
    </span>
  );
};
