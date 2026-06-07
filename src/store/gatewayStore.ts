import { create } from 'zustand';
import type { Gateway, ProcessRecord, HeartbeatRecord, StatusStats } from '@/types';
import { mockGateways } from '@/data/mockGateways';
import { mockHeartbeats } from '@/data/mockHeartbeats';
import { mockRecords } from '@/data/mockRecords';
import { calculateStats, calculateGatewayStatus } from '@/utils/statusUtils';

interface GatewayState {
  gateways: Gateway[];
  heartbeats: Record<string, HeartbeatRecord[]>;
  processRecords: ProcessRecord[];
  stats: StatusStats;
  isLoading: boolean;
  lastRefreshTime: Date;
  loadGateways: () => void;
  refreshGateways: () => Promise<void>;
  updateGatewayStatus: (id: string, status: Gateway['status']) => void;
  markAsRecovered: (id: string) => boolean;
  addProcessRecord: (record: Omit<ProcessRecord, 'id' | 'createdAt'>) => void;
  getHeartbeatsByGatewayId: (gatewayId: string) => HeartbeatRecord[];
  getRecordsByGatewayId: (gatewayId: string) => ProcessRecord[];
  recalculateStats: () => void;
}

export const useGatewayStore = create<GatewayState>((set, get) => ({
  gateways: [],
  heartbeats: {},
  processRecords: [],
  stats: { online: 0, offline: 0, timeout: 0, alert: 0, total: 0 },
  isLoading: false,
  lastRefreshTime: new Date(),

  loadGateways: () => {
    const gateways = [...mockGateways];
    const stats = calculateStats(gateways);
    set({
      gateways,
      heartbeats: { ...mockHeartbeats },
      processRecords: [...mockRecords],
      stats,
      lastRefreshTime: new Date(),
    });
  },

  refreshGateways: async () => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 800));
    const gateways = get().gateways.map((gw) => ({ ...gw }));
    const stats = calculateStats(gateways);
    set({
      gateways,
      stats,
      isLoading: false,
      lastRefreshTime: new Date(),
    });
  },

  updateGatewayStatus: (id: string, status: Gateway['status']) => {
    set((state) => {
      const gateways = state.gateways.map((gw) =>
        gw.id === id ? { ...gw, status } : gw
      );
      const stats = calculateStats(gateways);
      return { gateways, stats };
    });
  },

  markAsRecovered: (id: string) => {
    const gateway = get().gateways.find((gw) => gw.id === id);
    if (!gateway) return false;

    const hasAlerts = gateway.alerts.some((a) => !a.resolved);
    const actualStatus = calculateGatewayStatus(gateway.lastHeartbeat, hasAlerts);

    if (actualStatus === 'offline') {
      return false;
    }

    set((state) => {
      const gateways = state.gateways.map((gw) => {
        if (gw.id === id) {
          return {
            ...gw,
            alerts: gw.alerts.map((a) => ({ ...a, resolved: true })),
            lastHeartbeat: new Date(),
            status: 'online' as const,
          };
        }
        return gw;
      });
      const stats = calculateStats(gateways);
      return { gateways, stats };
    });

    get().addProcessRecord({
      gatewayId: id,
      operator: '当前用户',
      action: '标记为已恢复',
      result: '网关已恢复正常运行',
    });

    return true;
  },

  addProcessRecord: (record) => {
    set((state) => ({
      processRecords: [
        {
          ...record,
          id: `rec-${Date.now()}`,
          createdAt: new Date(),
        },
        ...state.processRecords,
      ],
    }));
  },

  getHeartbeatsByGatewayId: (gatewayId) => {
    return get().heartbeats[gatewayId] || [];
  },

  getRecordsByGatewayId: (gatewayId) => {
    return get().processRecords.filter((r) => r.gatewayId === gatewayId);
  },

  recalculateStats: () => {
    const stats = calculateStats(get().gateways);
    set({ stats });
  },
}));
