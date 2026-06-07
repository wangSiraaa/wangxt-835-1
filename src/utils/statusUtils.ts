import type { GatewayStatus, AlertLevel, Gateway, StatusStats, ProjectHealth } from '@/types';
import { mockProjects } from '@/data/mockProjects';

export const OFFLINE_THRESHOLD = 5 * 60 * 1000;
export const TIMEOUT_THRESHOLD = 60 * 1000;

export function calculateGatewayStatus(lastHeartbeat: Date, hasUnresolvedAlerts: boolean): GatewayStatus {
  if (hasUnresolvedAlerts) return 'alert';

  const now = new Date();
  const diff = now.getTime() - lastHeartbeat.getTime();

  if (diff > OFFLINE_THRESHOLD) return 'offline';
  if (diff > TIMEOUT_THRESHOLD) return 'timeout';
  return 'online';
}

export function canMarkAsRecovered(status: GatewayStatus): boolean {
  return status !== 'offline';
}

export function getStatusColor(status: GatewayStatus): string {
  const colors: Record<GatewayStatus, string> = {
    online: 'text-emerald-400',
    offline: 'text-red-400',
    timeout: 'text-amber-400',
    alert: 'text-purple-400',
  };
  return colors[status];
}

export function getStatusBgColor(status: GatewayStatus): string {
  const colors: Record<GatewayStatus, string> = {
    online: 'bg-emerald-500/10 border-emerald-500/30',
    offline: 'bg-red-500/10 border-red-500/30',
    timeout: 'bg-amber-500/10 border-amber-500/30',
    alert: 'bg-purple-500/10 border-purple-500/30',
  };
  return colors[status];
}

export function getStatusDotColor(status: GatewayStatus): string {
  const colors: Record<GatewayStatus, string> = {
    online: 'bg-emerald-400',
    offline: 'bg-red-400',
    timeout: 'bg-amber-400',
    alert: 'bg-purple-400',
  };
  return colors[status];
}

export function getStatusLabel(status: GatewayStatus): string {
  const labels: Record<GatewayStatus, string> = {
    online: '在线',
    offline: '离线',
    timeout: '超时',
    alert: '告警',
  };
  return labels[status];
}

export function getAlertLevelColor(level: AlertLevel): string {
  const colors: Record<AlertLevel, string> = {
    critical: 'text-red-400',
    warning: 'text-amber-400',
    info: 'text-blue-400',
  };
  return colors[level];
}

export function getAlertLevelBgColor(level: AlertLevel): string {
  const colors: Record<AlertLevel, string> = {
    critical: 'bg-red-500/10 border-red-500/30',
    warning: 'bg-amber-500/10 border-amber-500/30',
    info: 'bg-blue-500/10 border-blue-500/30',
  };
  return colors[level];
}

export function getAlertLevelLabel(level: AlertLevel): string {
  const labels: Record<AlertLevel, string> = {
    critical: '严重',
    warning: '警告',
    info: '提示',
  };
  return labels[level];
}

export function calculateStats(gateways: Gateway[]): StatusStats {
  return gateways.reduce(
    (acc, gw) => {
      const hasAlerts = gw.alerts.some((a) => !a.resolved);
      const actualStatus = calculateGatewayStatus(gw.lastHeartbeat, hasAlerts);
      acc[actualStatus]++;
      acc.total++;
      return acc;
    },
    { online: 0, offline: 0, timeout: 0, alert: 0, total: 0 }
  );
}

export function calculateProjectHealth(gateways: Gateway[]): ProjectHealth[] {
  const projectMap = new Map<string, ProjectHealth>();

  mockProjects.forEach((proj) => {
    projectMap.set(proj.id, {
      projectId: proj.id,
      projectName: proj.name,
      totalGateways: 0,
      onlineCount: 0,
      offlineCount: 0,
      timeoutCount: 0,
      alertCount: 0,
      healthScore: 100,
    });
  });

  gateways.forEach((gw) => {
    const health = projectMap.get(gw.projectId);
    if (!health) return;

    const hasAlerts = gw.alerts.some((a) => !a.resolved);
    const actualStatus = calculateGatewayStatus(gw.lastHeartbeat, hasAlerts);

    health.totalGateways++;
    if (actualStatus === 'online') health.onlineCount++;
    if (actualStatus === 'offline') health.offlineCount++;
    if (actualStatus === 'timeout') health.timeoutCount++;
    if (actualStatus === 'alert') health.alertCount++;
  });

  projectMap.forEach((health) => {
    if (health.totalGateways > 0) {
      const penalty = health.offlineCount * 30 + health.timeoutCount * 10 + health.alertCount * 15;
      health.healthScore = Math.max(0, 100 - penalty / health.totalGateways);
    }
  });

  return Array.from(projectMap.values());
}

export const PROCESS_SUGGESTIONS: Record<GatewayStatus, { title: string; steps: string[] }> = {
  online: {
    title: '网关运行正常',
    steps: ['确认数据上报正常', '检查告警信息', '定期巡检设备状态'],
  },
  timeout: {
    title: '心跳超时处理建议',
    steps: [
      '检查网络连接状态',
      'ping 网关 IP 确认连通性',
      '查看最近心跳记录',
      '联系现场人员检查设备',
      '考虑远程重启网关',
    ],
  },
  offline: {
    title: '网关离线处理建议',
    steps: [
      '确认网关电源状态',
      '检查物理网线连接',
      '现场检查设备指示灯状态',
      '联系网络工程师排查交换机',
      '必要时现场重启设备',
      '恢复连接后验证数据上报',
    ],
  },
  alert: {
    title: '告警处理建议',
    steps: [
      '查看具体告警信息',
      '分析告警级别和影响范围',
      '检查相关指标数据',
      '执行对应告警处理预案',
      '记录处理过程和结果',
      '观察确认告警已恢复',
    ],
  },
};
