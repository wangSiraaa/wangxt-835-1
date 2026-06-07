export type GatewayStatus = 'online' | 'offline' | 'timeout' | 'alert';

export type AlertLevel = 'critical' | 'warning' | 'info';

export interface Gateway {
  id: string;
  name: string;
  code: string;
  ip: string;
  projectId: string;
  status: GatewayStatus;
  lastHeartbeat: Date;
  reportFrequency: number;
  location: string;
  version: string;
  alerts: Alert[];
}

export interface HeartbeatRecord {
  id: string;
  gatewayId: string;
  timestamp: Date;
  latency: number;
  status: 'success' | 'failed';
}

export interface Alert {
  id: string;
  gatewayId: string;
  level: AlertLevel;
  message: string;
  createdAt: Date;
  resolved: boolean;
}

export interface ProcessRecord {
  id: string;
  gatewayId: string;
  operator: string;
  action: string;
  result: string;
  createdAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
}

export interface FilterOptions {
  status: GatewayStatus | 'all';
  projectId: string | 'all';
  alertLevel: AlertLevel | 'all';
  timeRange: [Date, Date] | null;
  keyword: string;
}

export interface StatusStats {
  online: number;
  offline: number;
  timeout: number;
  alert: number;
  total: number;
}

export interface ProjectHealth {
  projectId: string;
  projectName: string;
  totalGateways: number;
  onlineCount: number;
  offlineCount: number;
  timeoutCount: number;
  alertCount: number;
  healthScore: number;
}
