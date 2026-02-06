/**
 * Application State Store
 * Following Single Responsibility Principle - manages global app state only
 * Uses Zustand for lightweight state management
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { env, isDevelopment } from '@/config/env';
import { LensType, SyncType, LogEntry } from '@/types';

// ============================================================================
// State Types
// ============================================================================

interface AppState {
  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Lens State
  activeLens: LensType;
  setActiveLens: (lens: LensType) => void;

  // Sync State
  isSyncing: boolean;
  syncType: SyncType | null;
  setSyncing: (isSyncing: boolean, syncType?: SyncType) => void;

  // Logs
  logs: LogEntry[];
  addLog: (entry: LogEntry) => void;
  clearLogs: () => void;

  // UI State
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Theme
  theme: 'dark' | 'light' | 'system';
  setTheme: (theme: 'dark' | 'light' | 'system') => void;

  // Reset
  reset: () => void;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState = {
  activeTab: 'graph',
  activeLens: 'drift' as LensType,
  isSyncing: false,
  syncType: null as SyncType | null,
  logs: [
    { time: new Date().toLocaleTimeString(), msg: 'Substrate Core Initialized.', level: 'info' },
    { time: new Date().toLocaleTimeString(), msg: 'Memory Layer: Checking for knowledge gaps...', level: 'info' },
  ] as LogEntry[],
  sidebarOpen: true,
  theme: 'dark' as const,
};

// ============================================================================
// Store Creation
// ============================================================================

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Navigation
        setActiveTab: (tab) => set({ activeTab: tab }, false, 'setActiveTab'),

        // Lens
        setActiveLens: (lens) => set({ activeLens: lens }, false, 'setActiveLens'),

        // Sync
        setSyncing: (isSyncing, syncType) => 
          set({ isSyncing, syncType: syncType || null }, false, 'setSyncing'),

        // Logs
        addLog: (entry) =>
          set(
            (state) => ({ logs: [...state.logs, entry] }),
            false,
            'addLog'
          ),
        clearLogs: () => set({ logs: [] }, false, 'clearLogs'),

        // UI
        toggleSidebar: () =>
          set(
            (state) => ({ sidebarOpen: !state.sidebarOpen }),
            false,
            'toggleSidebar'
          ),
        setSidebarOpen: (open) => set({ sidebarOpen: open }, false, 'setSidebarOpen'),

        // Theme
        setTheme: (theme) => set({ theme }, false, 'setTheme'),

        // Reset
        reset: () => set(initialState, false, 'reset'),
      }),
      {
        name: 'app-store',
        partialize: (state) => ({
          activeTab: state.activeTab,
          sidebarOpen: state.sidebarOpen,
          theme: state.theme,
        }),
      }
    ),
    { name: 'AppStore', enabled: isDevelopment && env.VITE_ENABLE_ZUSTAND_DEVTOOLS }
  )
);

// ============================================================================
// Computed Selectors
// ============================================================================

export const useActiveTab = () => useAppStore((state) => state.activeTab);
export const useActiveLens = () => useAppStore((state) => state.activeLens);
export const useIsSyncing = () => useAppStore((state) => state.isSyncing);
export const useLogs = () => useAppStore((state) => state.logs);
export const useSidebarOpen = () => useAppStore((state) => state.sidebarOpen);
export const useTheme = () => useAppStore((state) => state.theme);
