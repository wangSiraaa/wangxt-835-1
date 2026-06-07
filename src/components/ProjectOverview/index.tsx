import React from 'react';
import { Building2, TrendingUp, AlertTriangle } from 'lucide-react';
import { useGatewayStore } from '@/store/gatewayStore';
import { mockProjects } from '@/data/mockProjects';
import type { ProjectHealth, GatewayStatus } from '@/types';
import { StatusBadge } from '@/components/common/StatusBadge';

export const ProjectOverview: React.FC = () => {
  const { gateways } = useGatewayStore();

  const projectHealth: ProjectHealth[] = mockProjects.map((project) => {
    const projectGateways = gateways.filter((gw) => gw.projectId === project.id);

    const counts = {
      online: 0,
      offline: 0,
      timeout: 0,
      alert: 0,
    };

    projectGateways.forEach((gw) => {
      const status = gw.status as GatewayStatus;
      if (counts[status] !== undefined) {
        counts[status]++;
      }
    });

    const total = projectGateways.length;
    const healthScore = total > 0 ? Math.round((counts.online / total) * 100) : 100;

    return {
      projectId: project.id,
      projectName: project.name,
      totalGateways: total,
      onlineCount: counts.online,
      offlineCount: counts.offline,
      timeoutCount: counts.timeout,
      alertCount: counts.alert,
      healthScore,
    };
  });

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 70) return 'text-amber-400';
    return 'text-red-400';
  };

  const getHealthBg = (score: number) => {
    if (score >= 90) return 'from-emerald-500/20 to-emerald-500/5';
    if (score >= 70) return 'from-amber-500/20 to-amber-500/5';
    return 'from-red-500/20 to-red-500/5';
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-800">
        <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-cyan-400" />
          项目健康概览
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          按项目维度展示网关健康状况
        </p>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {projectHealth.map((ph) => (
          <div
            key={ph.projectId}
            className={`bg-gradient-to-br ${getHealthBg(ph.healthScore)} border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-base font-semibold text-slate-200">{ph.projectName}</h4>
                <p className="text-xs text-slate-500 mt-1">共 {ph.totalGateways} 个网关</p>
              </div>
              <div className={`text-3xl font-bold ${getHealthColor(ph.healthScore)}`}>
                {ph.healthScore}%
              </div>
            </div>

            <div className="w-full bg-slate-800/50 rounded-full h-2 mb-4">
              <div
                className={`h-2 rounded-full transition-all duration-700 ${
                  ph.healthScore >= 90
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                    : ph.healthScore >= 70
                    ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                    : 'bg-gradient-to-r from-red-500 to-red-400'
                }`}
                style={{ width: `${ph.healthScore}%` }}
              />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {ph.onlineCount > 0 && (
                <StatusBadge status="online" showLabel={true} count={ph.onlineCount} />
              )}
              {ph.offlineCount > 0 && (
                <StatusBadge status="offline" showLabel={true} count={ph.offlineCount} />
              )}
              {ph.timeoutCount > 0 && (
                <StatusBadge status="timeout" showLabel={true} count={ph.timeoutCount} />
              )}
              {ph.alertCount > 0 && (
                <StatusBadge status="alert" showLabel={true} count={ph.alertCount} />
              )}
            </div>

            {ph.healthScore < 70 && (
              <div className="mt-4 flex items-center gap-2 text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
                <span>该项目存在异常网关，建议重点关注</span>
              </div>
            )}

            {ph.healthScore >= 90 && ph.totalGateways > 0 && (
              <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-lg">
                <TrendingUp className="w-4 h-4" />
                <span>项目运行状态良好</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectOverview;
