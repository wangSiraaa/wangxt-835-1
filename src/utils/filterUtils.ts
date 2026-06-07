import type { Gateway, FilterOptions, AlertLevel } from '@/types';
import { calculateGatewayStatus } from './statusUtils';

export function applyFilters(gateways: Gateway[], filters: FilterOptions): Gateway[] {
  return gateways.filter((gw) => {
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      const matchesKeyword =
        gw.name.toLowerCase().includes(keyword) ||
        gw.code.toLowerCase().includes(keyword) ||
        gw.ip.includes(keyword) ||
        gw.location.toLowerCase().includes(keyword);
      if (!matchesKeyword) return false;
    }

    const hasAlerts = gw.alerts.some((a) => !a.resolved);
    const actualStatus = calculateGatewayStatus(gw.lastHeartbeat, hasAlerts);

    if (filters.status !== 'all' && actualStatus !== filters.status) {
      return false;
    }

    if (filters.projectId !== 'all' && gw.projectId !== filters.projectId) {
      return false;
    }

    if (filters.alertLevel !== 'all') {
      const hasMatchingAlert = gw.alerts.some(
        (a) => !a.resolved && a.level === filters.alertLevel
      );
      if (!hasMatchingAlert && filters.status === 'alert') {
        return false;
      }
    }

    if (filters.timeRange) {
      const [start, end] = filters.timeRange;
      if (gw.lastHeartbeat < start || gw.lastHeartbeat > end) {
        return false;
      }
    }

    return true;
  });
}

export function getDefaultFilters(): FilterOptions {
  return {
    status: 'all',
    projectId: 'all',
    alertLevel: 'all' as AlertLevel | 'all',
    timeRange: null,
    keyword: '',
  };
}
