import React, { useState, useEffect } from 'react';
import { X, RotateCcw, AlertTriangle, Info, Clock, MapPin, Server, Camera, FileText } from 'lucide-react';
import { StatusBadge } from '@/components/common/StatusBadge';
import { AlertBadge } from '@/components/common/AlertBadge';
import { HeartbeatTimeline } from './HeartbeatTimeline';
import { FrequencyChart } from './FrequencyChart';
import { ActionSteps } from './ActionSteps';
import { useGatewayStore } from '@/store/gatewayStore';
import { useUIStore } from '@/store/uiStore';
import { useHeartbeat } from '@/hooks/useHeartbeat';
import { useGatewayStatus } from '@/hooks/useGatewayStatus';
import { formatDateTime, formatRelativeTime } from '@/utils/dateUtils';
import { mockProjects } from '@/data/mockProjects';
import { getAlertLevelLabel, getAlertLevelColor, getStatusLabel } from '@/utils/statusUtils';
import type { OfflineSnapshot } from '@/types';

export const DetailDrawer: React.FC = () => {
  const { selectedGatewayId, isDrawerOpen, closeDrawer, showToast } = useUIStore();
  const { gateways, markAsRecovered, addProcessRecord, getRecordsByGatewayId, getSnapshotByGatewayId, generateOfflineSnapshot } = useGatewayStore();
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'heartbeat' | 'alerts' | 'snapshot' | 'records'>('overview');

  const gateway = gateways.find((g) => g.id === selectedGatewayId);
  const { heartbeats, frequencyData, stats } = useHeartbeat(selectedGatewayId || '');
  const records = getRecordsByGatewayId(selectedGatewayId || '');
  const snapshot = getSnapshotByGatewayId(selectedGatewayId || '');

  const dummyGateway: any = gateway || {
    id: '',
    lastHeartbeat: new Date(),
    alerts: [],
  };
  const { actualStatus, canRecover, hasUnresolvedAlerts, timeSinceHeartbeat } =
    useGatewayStatus(dummyGateway);

  useEffect(() => {
    setCompletedSteps([]);
    setActiveTab('overview');
  }, [selectedGatewayId]);

  if (!gateway || !selectedGatewayId) return null;

  const project = mockProjects.find((p) => p.id === gateway.projectId);
  const unresolvedAlerts = gateway.alerts.filter((a) => !a.resolved);

  const handleGenerateSnapshot = () => {
    const result = generateOfflineSnapshot(gateway.id);
    showToast(result.message);
  };

  const handleMarkRecovered = () => {
    const success = markAsRecovered(gateway.id);
    if (success) {
      showToast('网关已标记为已恢复');
    } else {
      showToast('操作失败，请重试');
    }
  };

  const handleStepComplete = (stepIndex: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepIndex)
        ? prev.filter((s) => s !== stepIndex)
        : [...prev, stepIndex]
    );
  };

  const handleAddRecord = () => {
    const action = prompt('请输入处理动作:');
    if (action) {
      addProcessRecord({
        gatewayId: gateway.id,
        operator: '当前用户',
        action,
        result: '已记录处理动作',
      });
      showToast('处理记录已添加');
    }
  };

  const tabs = [
    { id: 'overview', label: '概览' },
    { id: 'heartbeat', label: '心跳' },
    { id: 'alerts', label: '告警', badge: unresolvedAlerts.length },
    { id: 'snapshot', label: '离线快照', badge: snapshot ? 1 : 0 },
    { id: 'records', label: '处理记录', badge: records.length },
  ] as const;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeDrawer}
      />
      <div
        className={`fixed top-0 right-0 h-full w-[500px] bg-slate-900 border-l border-slate-700/50 z-50 transform transition-transform duration-300 ease-out ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
            <div>
              <h3 className="text-lg font-semibold text-slate-100">{gateway.name}</h3>
              <p className="text-xs text-slate-500 font-mono">{gateway.code}</p>
            </div>
            <button
              onClick={closeDrawer}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-1 p-4 border-b border-slate-700/50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-slate-800 text-cyan-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
                {'badge' in tab && tab.badge > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-red-500/20 text-red-400 rounded">
                    {tab.badge}
                  </span>
                )}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-cyan-400 rounded-full" />
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <StatusBadge status={actualStatus} pulse={actualStatus !== 'offline'} />
                  {hasUnresolvedAlerts && (
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
                      <span className="text-xs text-amber-400">存在未处理告警</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-1">
                      <Server className="w-4 h-4 text-slate-400" />
                      <span className="text-xs text-slate-400">IP 地址</span>
                    </div>
                    <p className="text-sm font-mono text-slate-200">{gateway.ip}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-1">
                      <Info className="w-4 h-4 text-slate-400" />
                      <span className="text-xs text-slate-400">固件版本</span>
                    </div>
                    <p className="text-sm font-mono text-slate-200">{gateway.version}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="text-xs text-slate-400">位置</span>
                    </div>
                    <p className="text-sm text-slate-200">{gateway.location}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-xs text-slate-400">上报频率</span>
                    </div>
                    <p className="text-sm text-slate-200">{gateway.reportFrequency}s / 次</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">所属项目</span>
                    <span className="text-xs text-cyan-400">{project?.name || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">最后心跳</span>
                    <span className="text-xs text-slate-300">
                      {formatDateTime(gateway.lastHeartbeat)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">距现在</span>
                    <span
                      className={`text-xs font-mono ${
                        timeSinceHeartbeat.isOffline ? 'text-red-400' : 'text-slate-300'
                      }`}
                    >
                      {formatRelativeTime(gateway.lastHeartbeat)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span className="text-xs font-medium text-slate-300">运行指标</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-2xl font-bold font-mono text-cyan-400">
                        {stats.avgLatency}
                      </p>
                      <p className="text-xs text-slate-500">平均延迟(ms)
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold font-mono text-emerald-400">
                        {stats.successRate}%
                      </p>
                      <p className="text-xs text-slate-500">成功率</p>
                    </div>
                    <div className="text-center">
                      <p
                        className={`text-2xl font-bold font-mono ${
                          stats.recentFailed > 0 ? 'text-red-400' : 'text-slate-400'
                        }`}
                      >
                        {stats.recentFailed}
                      </p>
                      <p className="text-xs text-slate-500">失败次数</p>
                    </div>
                  </div>
                </div>

                <ActionSteps
                  status={actualStatus}
                  onStepComplete={handleStepComplete}
                  completedSteps={completedSteps}
                />
              </div>
            )}

            {activeTab === 'heartbeat' && (
              <div className="space-y-6">
                <FrequencyChart data={frequencyData} stats={stats} />
                <HeartbeatTimeline heartbeats={heartbeats} />
              </div>
            )}

            {activeTab === 'alerts' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-slate-300">告警列表</h4>
                </div>
                {unresolvedAlerts.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-sm">
                    暂无未处理告警
                  </div>
                ) : (
                  <div className="space-y-3">
                    {unresolvedAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <AlertBadge level={alert.level} />
                          <span className="text-xs text-slate-500">
                            {formatRelativeTime(alert.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300">{alert.message}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {getAlertLevelLabel(alert.level)}级别告警
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'snapshot' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-amber-400" />
                    <h4 className="text-sm font-medium text-slate-300">离线快照</h4>
                  </div>
                  {!snapshot && actualStatus !== 'offline' && (
                    <button
                      onClick={handleGenerateSnapshot}
                      disabled={true}
                      className="px-3 py-1.5 text-xs bg-slate-700 text-slate-400 rounded-md opacity-50 cursor-not-allowed"
                      title="仅离线网关可生成快照"
                    >
                      生成快照
                    </button>
                  )}
                  {!snapshot && actualStatus === 'offline' && (
                    <button
                      onClick={handleGenerateSnapshot}
                      className="px-3 py-1.5 text-xs bg-amber-500/20 text-amber-400 rounded-md hover:bg-amber-500/30 transition-colors"
                    >
                      生成快照
                    </button>
                  )}
                </div>

                {snapshot ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-slate-900/50 border border-amber-500/30">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-xs font-medium text-amber-400">
                          快照已生成
                        </span>
                        <span className="text-xs text-slate-500 ml-auto">
                          {formatRelativeTime(snapshot.generatedAt)}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">快照生成时间</span>
                          <span className="text-xs text-slate-200 font-mono">
                            {formatDateTime(snapshot.generatedAt)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">离线前状态</span>
                          <span className="text-xs text-amber-400">
                            {getStatusLabel(snapshot.statusBeforeOffline)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-medium text-slate-300">最后心跳</span>
                      </div>
                      <p className="text-sm font-mono text-cyan-400">
                        {formatDateTime(snapshot.lastHeartbeat)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {formatRelativeTime(snapshot.lastHeartbeat)}
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                      <div className="flex items-center gap-2 mb-3">
                        <Server className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-medium text-slate-300">最后上报值</span>
                      </div>
                      <p className="text-3xl font-bold font-mono text-emerald-400">
                        {snapshot.lastReportedValue}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">传感器读数</p>
                    </div>

                    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-medium text-slate-300">处理备注</span>
                      </div>
                      <p className="text-sm text-slate-300">{snapshot.processingRemark}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700/30">
                      <p className="text-xs text-slate-500">
                        快照ID：{snapshot.id}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 space-y-3">
                    <Camera className="w-12 h-12 text-slate-600 mx-auto" />
                    <p className="text-sm text-slate-500">
                      {actualStatus === 'offline'
                        ? '网关已离线，点击上方按钮生成离线快照'
                        : '网关尚未离线，离线快照将在网关超时后自动生成'}
                    </p>
                    {actualStatus !== 'offline' && (
                      <p className="text-xs text-slate-600">
                        当前状态：{getStatusLabel(actualStatus)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'records' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-slate-300">处理记录</h4>
                  <button
                    onClick={handleAddRecord}
                    className="px-3 py-1.5 text-xs bg-cyan-500/20 text-cyan-400 rounded-md hover:bg-cyan-500/30 transition-colors"
                  >
                    添加记录
                  </button>
                </div>
                {records.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-sm">
                    暂无处理记录
                  </div>
                ) : (
                  <div className="space-y-3">
                    {records.map((record) => (
                      <div
                        key={record.id}
                        className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-200">
                            {record.operator}
                          </span>
                          <span className="text-xs text-slate-500">
                            {formatRelativeTime(record.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300">{record.action}</p>
                        <p className="text-xs text-slate-400 mt-1">{record.result}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-5 border-t border-slate-700/50 space-y-3">
            <div className="flex gap-3">
              <button
                onClick={handleMarkRecovered}
                disabled={!canRecover}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  canRecover
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 active:scale-95 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 opacity-60 cursor-not-allowed'
                }`}
                title={!canRecover ? '离线网关需先恢复连接' : ''}
                aria-disabled={!canRecover}
              >
                <RotateCcw className="w-4 h-4" />
                标记已恢复
              </button>
            </div>
            {!canRecover && (
              <p className="text-xs text-center text-red-400 text-center">
              离线网关无法直接标记恢复，请先排查连接问题
            </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
