import React from 'react';
import type { AlertLevel } from '@/types';
import { getAlertLevelBgColor, getAlertLevelLabel } from '@/utils/statusUtils';

interface AlertBadgeProps {
  level: AlertLevel;
  count?: number;
}

export const AlertBadge: React.FC<AlertBadgeProps> = ({ level, count }) => {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getAlertLevelBgColor(level)}`}
    >
      {count !== undefined && <span className="mr-1">{count}</span>}
      {getAlertLevelLabel(level)}
    </span>
  );
};
