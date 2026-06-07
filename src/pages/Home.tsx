import React, { useEffect, useState } from 'react';
import { Server, Users, LayoutGrid, List } from 'lucide-react';
import { useGatewayStore } from '@/store/gatewayStore';
import { useUIStore } from '@/store/uiStore';
import { useAutoStatusUpdate } from '@/hooks/useGatewayStatus';
import { StatusOverview } from '@/components/StatusOverview';
import { FilterBar } from '@/components/FilterBar';
import GatewayList from '@/components/GatewayList';
import GatewayDetail from '@/components/GatewayDetail';
import { ProcessRecords } from '@/components/ProcessRecords';
import { ProjectOverview } from '@/components/ProjectOverview';
import { RefreshControl } from '@/components/RefreshControl';
import { Toast } from '@/components/common/Toast';

type RoleType = 'operator' | 'technician' | 'manager';

const Home: React.FC = () => {
  const { loadGateways, isLoading } = useGatewayStore();
  const { viewMode, setViewMode } = useUIStore();
  const [currentRole, setCurrentRole] = useState<RoleType>('operator');
  
  useAutoStatusUpdate();

  useEffect(() => {
    loadGateways();
  }, [loadGateways]);

  const roleOptions: { value: RoleType; label: string; description: string }[] = [
    { value: 'operator', label: '值班运维', description: '全局视图，处理告警' },
    { value: 'technician', label: '现场技术', description: '详情视图，排查问题' },
    { value: 'manager', label: '项目经理', description: '项目概览，统计分析' },
  ];

  const handleRoleChange = (role: RoleType) => {
    setCurrentRole(role);
    if (role === 'manager') {
      setViewMode('project');
    } else {
      setViewMode('list');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Toast />
      <GatewayDetail />

      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <Server className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">采集网关状态监控</h1>
                  <p className="text-xs text-slate-500">Gateway Status Monitor</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700">
                <Users className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-400">当前角色：</span>
                <div className="flex items-center gap-1">
                  {roleOptions.map((role) => (
                    <button
                      key={role.value}
                      onClick={() => handleRoleChange(role.value)}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                        currentRole === role.value
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
                      }`}
                      title={role.description}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg border border-slate-700 p-0.5">
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    viewMode === 'list'
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  列表视图
                </button>
                <button
                  onClick={() => setViewMode('project')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    viewMode === 'project'
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  项目视图
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="mb-6">
          <RefreshControl />
        </div>

        <div className="mb-6">
          <StatusOverview />
        </div>

        {viewMode === 'list' && (
          <>
            <div className="mb-4">
              <FilterBar />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <GatewayList />
              </div>
              <div className="lg:col-span-1">
                <ProcessRecords />
              </div>
            </div>
          </>
        )}

        {viewMode === 'project' && (
          <div className="grid grid-cols-1 gap-6">
            <ProjectOverview />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GatewayList />
              <ProcessRecords />
            </div>
          </div>
        )}

        <div className="mt-8 p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
          <h4 className="text-sm font-medium text-slate-400 mb-3">业务规则说明</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-slate-300 font-medium">心跳超时转离线</p>
                <p className="text-slate-500">网关最后心跳超过5分钟自动转为离线状态</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-slate-300 font-medium">离线不可恢复</p>
                <p className="text-slate-500">状态为离线的网关，恢复按钮自动禁用</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-slate-300 font-medium">筛选条件保留</p>
                <p className="text-slate-500">手动刷新数据时，当前筛选条件保持不变</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800 mt-8 py-4">
        <div className="max-w-[1600px] mx-auto px-6 text-center text-xs text-slate-600">
          采集网关状态监控系统 v1.0 | 工业物联网设备管理平台
        </div>
      </footer>
    </div>
  );
};

export default Home;
