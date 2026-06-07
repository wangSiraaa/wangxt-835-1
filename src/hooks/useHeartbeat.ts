import { useMemo } from 'react';
import type { HeartbeatRecord } from '@/types';
import { useGatewayStore } from '@/store/gatewayStore';

export function useHeartbeat(gatewayId: string) {
  const { getHeartbeatsByGatewayId } = useGatewayStore();

  const heartbeats = useMemo(
    () => getHeartbeatsByGatewayId(gatewayId),
    [gatewayId, getHeartbeatsByGatewayId]
  );

  const frequencyData = useMemo(() => {
    return heartbeats.slice(0, 10).map((hb) => ({
      time: new Date(hb.timestamp),
      latency: hb.latency,
      success: hb.status === 'success',
    }));
  }, [heartbeats]);

  const stats = useMemo(() => {
    if (heartbeats.length === 0) return { avgLatency: 0, successRate: 0, recentFailed: 0 };
    const recent = heartbeats.slice(0, 10);
    const avgLatency = recent.reduce((sum, hb) => sum + hb.latency, 0) / recent.length;
    const successCount = recent.filter((hb) => hb.status === 'success').length;
    const recentFailed = recent.filter((hb) => hb.status === 'failed').length;
    return {
      avgLatency: Math.round(avgLatency),
      successRate: Math.round((successCount / recent.length) * 100),
      recentFailed,
    };
  }, [heartbeats]);

  return {
    heartbeats,
    frequencyData,
    stats,
  };
}
