import React from 'react';
import { StatusCard } from './StatusCard';
import { useGatewayStore } from '@/store/gatewayStore';
import { useFilterStore } from '@/store/filterStore';
import type { GatewayStatus } from '@/types';

export const StatusOverview: React.FC = () => {
  const { stats } = useGatewayStore();
  const { filters, setStatus } = useFilterStore();

  const handleStatusClick = (status: GatewayStatus | 'all') => {
    if (filters.status === status) {
      setStatus('all');
    } else {
      setStatus(status);
    }
  };

  const statuses: (GatewayStatus | 'all')[] = ['all', 'online', 'timeout', 'offline', 'alert'];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {statuses.map((status) => (
        <StatusCard
          key={status}
          status={status}
          count={status === 'all' ? stats.total : stats[status as GatewayStatus]}
          total={stats.total}
          onClick={() => handleStatusClick(status)}
          isActive={filters.status === status}
        />
      ))}
    </div>
  );
};
