import { create } from 'zustand';

type ViewMode = 'list' | 'project';

interface UIState {
  selectedGatewayId: string | null;
  isDrawerOpen: boolean;
  isRecordsPanelOpen: boolean;
  viewMode: ViewMode;
  autoRefresh: boolean;
  refreshInterval: number;
  showRefreshToast: boolean;
  toastMessage: string;
  selectedProjectId: string | null;
  openDrawer: (gatewayId: string) => void;
  closeDrawer: () => void;
  toggleRecordsPanel: () => void;
  setViewMode: (mode: ViewMode) => void;
  setAutoRefresh: (enabled: boolean) => void;
  showToast: (message: string) => void;
  hideToast: () => void;
  setSelectedProjectId: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  selectedGatewayId: null,
  isDrawerOpen: false,
  isRecordsPanelOpen: false,
  viewMode: 'list',
  autoRefresh: false,
  refreshInterval: 30000,
  showRefreshToast: false,
  toastMessage: '',
  selectedProjectId: null,

  openDrawer: (gatewayId) => {
    set({ selectedGatewayId: gatewayId, isDrawerOpen: true });
  },

  closeDrawer: () => {
    set({ isDrawerOpen: false });
    setTimeout(() => set({ selectedGatewayId: null }), 300);
  },

  toggleRecordsPanel: () => {
    set((state) => ({ isRecordsPanelOpen: !state.isRecordsPanelOpen }));
  },

  setViewMode: (mode) => {
    set({ viewMode: mode });
  },

  setAutoRefresh: (enabled) => {
    set({ autoRefresh: enabled });
  },

  showToast: (message) => {
    set({ showRefreshToast: true, toastMessage: message });
    setTimeout(() => set({ showRefreshToast: false }), 3000);
  },

  hideToast: () => {
    set({ showRefreshToast: false });
  },

  setSelectedProjectId: (id) => {
    set({ selectedProjectId: id });
  },
}));
