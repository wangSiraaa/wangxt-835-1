import { create } from 'zustand';
import type { FilterOptions, GatewayStatus, AlertLevel } from '@/types';
import { getDefaultFilters } from '@/utils/filterUtils';

const STORAGE_KEY = 'gateway-monitor-filters';

function loadFromStorage(): FilterOptions | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.timeRange) {
        parsed.timeRange = [new Date(parsed.timeRange[0]), new Date(parsed.timeRange[1])];
      }
      return parsed;
    }
  } catch {
    console.error('Failed to load filters from storage');
  }
  return null;
}

function saveToStorage(filters: FilterOptions) {
  try {
    const toStore = {
      ...filters,
      timeRange: filters.timeRange
        ? [filters.timeRange[0].toISOString(), filters.timeRange[1].toISOString()]
        : null,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch {
    console.error('Failed to save filters to storage');
  }
}

interface FilterState {
  filters: FilterOptions;
  setStatus: (status: GatewayStatus | 'all') => void;
  setProjectId: (projectId: string | 'all') => void;
  setAlertLevel: (level: AlertLevel | 'all') => void;
  setKeyword: (keyword: string) => void;
  setTimeRange: (range: [Date, Date] | null) => void;
  resetFilters: () => void;
  preserveAndRefresh: () => void;
}

const initialFilters = loadFromStorage() || getDefaultFilters();

export const useFilterStore = create<FilterState>((set, get) => ({
  filters: initialFilters,

  setStatus: (status) => {
    const filters = { ...get().filters, status };
    saveToStorage(filters);
    set({ filters });
  },

  setProjectId: (projectId) => {
    const filters = { ...get().filters, projectId };
    saveToStorage(filters);
    set({ filters });
  },

  setAlertLevel: (alertLevel) => {
    const filters = { ...get().filters, alertLevel };
    saveToStorage(filters);
    set({ filters });
  },

  setKeyword: (keyword) => {
    const filters = { ...get().filters, keyword };
    saveToStorage(filters);
    set({ filters });
  },

  setTimeRange: (timeRange) => {
    const filters = { ...get().filters, timeRange };
    saveToStorage(filters);
    set({ filters });
  },

  resetFilters: () => {
    const filters = getDefaultFilters();
    saveToStorage(filters);
    set({ filters });
  },

  preserveAndRefresh: () => {
    const filters = get().filters;
    saveToStorage(filters);
  },
}));
