import { useEffect, useMemo } from 'react';
import type { Gateway, GatewayStatus } from '@/types';
import { calculateGatewayStatus, canMarkAsRecovered, OFFLINE_THRESHOLD } from '@/utils/statusUtils';
import { useGatewayStore } from '@/store/gatewayStore';

export function useGatewayStatus(gateway: Gateway) {
  const hasUnresolvedAlerts = gateway.alerts.some((a) => !a.resolved);
  
  const actualStatus: GatewayStatus = useMemo(
    () => calculateGatewayStatus(gateway.lastHeartbeat, hasUnresolvedAlerts),
    [gateway.lastHeartbeat, hasUnresolvedAlerts]
  );

  const canRecover = useMemo(() => canMarkAsRecovered(actualStatus), [actualStatus]);

  const timeSinceHeartbeat = useMemo(() => {
    const diff = new Date().getTime() - gateway.lastHeartbeat.getTime();
    return {
      seconds: Math.floor(diff / 1000),
      minutes: Math.floor(diff / 60000),
      isOffline: diff > OFFLINE_THRESHOLD,
    };
  }, [gateway.lastHeartbeat]);

  return {
    actualStatus,
    canRecover,
    hasUnresolvedAlerts,
    timeSinceHeartbeat,
  };
}

export function useAutoStatusUpdate() {
  const { gateways, recalculateStats } = useGatewayStore();

  useEffect(() => {
    const interval = setInterval(() => {
      recalculateStats();
    }, 10000);
    return () => clearInterval(interval);
  }, [recalculateStats]);

  return { gateways };
}
