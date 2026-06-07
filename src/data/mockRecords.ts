import type { ProcessRecord } from '@/types';

const now = new Date();

export const mockRecords: ProcessRecord[] = [
  {
    id: 'rec-001',
    gatewayId: 'gw-003',
    operator: '张工',
    action: '远程重启网关',
    result: '执行中，等待网关恢复',
    createdAt: new Date(now.getTime() - 60 * 1000),
  },
  {
    id: 'rec-002',
    gatewayId: 'gw-004',
    operator: '李工',
    action: '查看告警详情，调整温度阈值',
    result: '已将温度阈值调整为50℃，持续观察中',
    createdAt: new Date(now.getTime() - 180 * 1000),
  },
  {
    id: 'rec-003',
    gatewayId: 'gw-007',
    operator: '王工',
    action: '联系网络工程师排查网络',
    result: '网络工程师已响应，正在排查交换机端口',
    createdAt: new Date(now.getTime() - 300 * 1000),
  },
  {
    id: 'rec-004',
    gatewayId: 'gw-005',
    operator: '系统',
    action: '心跳超时，自动标记为离线',
    result: '网关已离线超过5分钟，需要现场排查',
    createdAt: new Date(now.getTime() - 9 * 60 * 1000),
  },
  {
    id: 'rec-005',
    gatewayId: 'gw-009',
    operator: '赵工',
    action: '检查网络连接',
    result: '确认网关在线，网络延迟较高',
    createdAt: new Date(now.getTime() - 70 * 1000),
  },
];
