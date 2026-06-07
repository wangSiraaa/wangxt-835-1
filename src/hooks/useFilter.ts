import { useMemo } from 'react';
import type { Gateway } from '@/types';
import { useFilterStore } from '@/store/filterStore';
import { useGatewayStore } from '@/store/gatewayStore';
import { applyFilters } from '@/utils/filterUtils';

export function useFilter() {
  const { filters, setStatus, setProjectId, setAlertLevel, setKeyword, setTimeRange, resetFilters, preserveAndRefresh } = useFilterStore();
  const { gateways } = useGatewayStore();

  const filteredGateways = useMemo(
    () => applyFilters(gateways, filters),
    [gateways, filters]
  );

  const handleRefreshWithFilters = () => {
    preserveAndRefresh();
  };

  return {
    filters,
    filteredGateways,
    setStatus,
    setProjectId,
    setAlertLevel,
    setKeyword,
    setTimeRange,
    resetFilters,
    handleRefreshWithFilters,
  };
}
