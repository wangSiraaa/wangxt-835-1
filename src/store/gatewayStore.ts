import { create } from 'zustand';
import type { Gateway, ProcessRecord, HeartbeatRecord, StatusStats, OfflineSnapshot, ReportedValue } from '@/types';
import { mockGateways } from '@/data/mockGateways';
import { mockHeartbeats } from '@/data/mockHeartbeats';
import { mockRecords } from '@/data/mockRecords';
import { mockReportedValues } from '@/data/mockReportedValues';
import { calculateStats, calculateGatewayStatus, OFFLINE_THRESHOLD, TIMEOUT_THRESHOLD } from '@/utils/statusUtils';

interface GatewayState {
  gateways: Gateway[];
  heartbeats: Record<string, HeartbeatRecord[]>;
  processRecords: ProcessRecord[];
  offlineSnapshots: Record<string, OfflineSnapshot>;
  reportedValues: Record<string, ReportedValue[]>;
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
  getSnapshotByGatewayId: (gatewayId: string) => OfflineSnapshot | undefined;
  getLatestReportedValue: (gatewayId: string) => number;
  forceGatewayTimeout: (id: string) => { success: boolean; message: string };
  generateOfflineSnapshot: (gatewayId: string) => { success: boolean; message: string; snapshot?: OfflineSnapshot };
}

export const useGatewayStore = create<GatewayState>((set, get) => ({
  gateways: [],
  heartbeats: {},
  processRecords: [],
  offlineSnapshots: {},
  reportedValues: {},
  stats: { online: 0, offline: 0, timeout: 0, alert: 0, total: 0 },
  isLoading: false,
  lastRefreshTime: new Date(),

  loadGateways: () => {
    const gateways = [...mockGateways];
    const stats = calculateStats(gateways);
    const initialSnapshots: Record<string, OfflineSnapshot> = {};
    gateways.forEach((gw) => {
      const hasAlerts = gw.alerts.some((a) => !a.resolved);
      const actualStatus = calculateGatewayStatus(gw.lastHeartbeat, hasAlerts);
      if (actualStatus === 'offline') {
        const values = mockReportedValues[gw.id] || [];
        const lastValue = values.length > 0 ? values[0].value : 0;
        initialSnapshots[gw.id] = {
          id: `snap-${gw.id}`,
          gatewayId: gw.id,
          lastHeartbeat: new Date(gw.lastHeartbeat),
          lastReportedValue: lastValue,
          processingRemark: '网关离线，等待运维人员处理',
          generatedAt: new Date(gw.lastHeartbeat.getTime() + OFFLINE_THRESHOLD),
          statusBeforeOffline: 'timeout',
        };
      }
    });
    set({
      gateways,
      heartbeats: { ...mockHeartbeats },
      processRecords: [...mockRecords],
      reportedValues: { ...mockReportedValues },
      offlineSnapshots: initialSnapshots,
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
    const state = get();
    const gateways = state.gateways;
    const existingSnapshots = state.offlineSnapshots;

    gateways.forEach((gw) => {
      const hasAlerts = gw.alerts.some((a) => !a.resolved);
      const actualStatus = calculateGatewayStatus(gw.lastHeartbeat, hasAlerts);
      const timeSinceHeartbeat = Date.now() - gw.lastHeartbeat.getTime();

      if (
        actualStatus === 'offline' &&
        timeSinceHeartbeat >= OFFLINE_THRESHOLD &&
        !existingSnapshots[gw.id]
      ) {
        const lastValue = state.getLatestReportedValue(gw.id);
        const snapshot: OfflineSnapshot = {
          id: `snap-${gw.id}-${Date.now()}`,
          gatewayId: gw.id,
          lastHeartbeat: new Date(gw.lastHeartbeat),
          lastReportedValue: lastValue,
          processingRemark: '网关离线，等待运维人员处理',
          generatedAt: new Date(),
          statusBeforeOffline: timeSinceHeartbeat > TIMEOUT_THRESHOLD ? 'timeout' : 'online',
        };

        set((s) => ({
          offlineSnapshots: {
            ...s.offlineSnapshots,
            [gw.id]: snapshot,
          },
          gateways: s.gateways.map((g) =>
            g.id === gw.id ? { ...g, status: 'offline' as const } : g
          ),
        }));

        state.addProcessRecord({
          gatewayId: gw.id,
          operator: '系统',
          action: '自动生成离线快照',
          result: `网关心跳超时超过 ${OFFLINE_THRESHOLD / 60000} 分钟，自动保存离线快照`,
        });
      }
    });

    const stats = calculateStats(get().gateways);
    set({ stats });
  },

  getSnapshotByGatewayId: (gatewayId) => {
    return get().offlineSnapshots[gatewayId];
  },

  getLatestReportedValue: (gatewayId) => {
    const values = get().reportedValues[gatewayId] || [];
    return values.length > 0 ? values[0].value : 0;
  },

  forceGatewayTimeout: (id) => {
    const gateway = get().gateways.find((gw) => gw.id === id);
    if (!gateway) {
      return { success: false, message: '网关不存在' };
    }

    const hasAlerts = gateway.alerts.some((a) => !a.resolved);
    const actualStatus = calculateGatewayStatus(gateway.lastHeartbeat, hasAlerts);

    if (actualStatus === 'online') {
      const newLastHeartbeat = new Date(Date.now() - TIMEOUT_THRESHOLD - 5000);
      set((state) => {
        const gateways = state.gateways.map((gw) =>
          gw.id === id ? { ...gw, lastHeartbeat: newLastHeartbeat, status: 'timeout' as const } : gw
        );
        const stats = calculateStats(gateways);
        return { gateways, stats };
      });
      return { success: true, message: '网关已进入超时状态' };
    }

    return { success: false, message: `网关当前状态为 ${actualStatus}，无需强制超时` };
  },

  generateOfflineSnapshot: (gatewayId) => {
    const gateway = get().gateways.find((gw) => gw.id === gatewayId);
    if (!gateway) {
      return { success: false, message: '网关不存在' };
    }

    const hasAlerts = gateway.alerts.some((a) => !a.resolved);
    const actualStatus = calculateGatewayStatus(gateway.lastHeartbeat, hasAlerts);
    const timeSinceHeartbeat = Date.now() - gateway.lastHeartbeat.getTime();

    if (timeSinceHeartbeat < OFFLINE_THRESHOLD) {
      return {
        success: false,
        message: `网关最后心跳仅在 ${Math.floor(timeSinceHeartbeat / 1000)} 秒前，未达到离线阈值（${OFFLINE_THRESHOLD / 1000} 秒），无法生成离线快照`,
      };
    }

    if (actualStatus !== 'offline') {
      return {
        success: false,
        message: `网关当前状态为 ${actualStatus}，非离线状态，无法生成离线快照`,
      };
    }

    const existingSnapshot = get().offlineSnapshots[gatewayId];
    if (existingSnapshot) {
      return {
        success: false,
        message: '该网关已存在离线快照，无需重复生成',
        snapshot: existingSnapshot,
      };
    }

    const lastValue = get().getLatestReportedValue(gatewayId);
    const snapshot: OfflineSnapshot = {
      id: `snap-${gatewayId}-${Date.now()}`,
      gatewayId,
      lastHeartbeat: new Date(gateway.lastHeartbeat),
      lastReportedValue: lastValue,
      processingRemark: '网关离线，等待运维人员处理',
      generatedAt: new Date(),
      statusBeforeOffline: timeSinceHeartbeat > TIMEOUT_THRESHOLD ? 'timeout' : 'online',
    };

    set((state) => ({
      offlineSnapshots: {
        ...state.offlineSnapshots,
        [gatewayId]: snapshot,
      },
      gateways: state.gateways.map((gw) =>
        gw.id === gatewayId ? { ...gw, status: 'offline' as const } : gw
      ),
    }));

    get().addProcessRecord({
      gatewayId,
      operator: '系统',
      action: '生成离线快照',
      result: `已保存离线快照：最后心跳 ${gateway.lastHeartbeat.toLocaleString()}，最后上报值 ${lastValue}`,
    });

    get().recalculateStats();

    return {
      success: true,
      message: '离线快照生成成功',
      snapshot,
    };
  },
}));
