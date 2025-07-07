import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Role } from '@prisma/client';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

export interface AppSettings {
  language: 'he' | 'en';
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  dashboard: {
    itemsPerPage: number;
    defaultView: 'grid' | 'list';
  };
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  roles: Role[];
  defaultDashboard: string;
  isActive: boolean;
}

interface AppState {
  // User state
  user: AppUser | null;
  isAuthenticated: boolean;
  
  // Settings
  settings: AppSettings;
  
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  
  // UI state
  sidebarOpen: boolean;
  loading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: AppUser | null) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  removeNotification: (id: string) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const defaultSettings: AppSettings = {
  language: 'he',
  theme: 'light',
  notifications: {
    email: true,
    push: true,
    sms: false,
  },
  dashboard: {
    itemsPerPage: 20,
    defaultView: 'grid',
  },
};

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        settings: defaultSettings,
        notifications: [],
        unreadCount: 0,
        sidebarOpen: false,
        loading: false,
        error: null,

        // Actions
        setUser: (user) =>
          set((state) => ({
            user,
            isAuthenticated: !!user,
          }), false, 'setUser'),

        updateSettings: (newSettings) =>
          set((state) => ({
            settings: { ...state.settings, ...newSettings },
          }), false, 'updateSettings'),

        addNotification: (notification) =>
          set((state) => {
            const newNotification: Notification = {
              ...notification,
              id: crypto.randomUUID(),
              timestamp: new Date(),
              read: false,
            };
            
            const notifications = [newNotification, ...state.notifications];
            const unreadCount = notifications.filter(n => !n.read).length;
            
            return {
              notifications,
              unreadCount,
            };
          }, false, 'addNotification'),

        markNotificationRead: (id) =>
          set((state) => {
            const notifications = state.notifications.map(n =>
              n.id === id ? { ...n, read: true } : n
            );
            const unreadCount = notifications.filter(n => !n.read).length;
            
            return {
              notifications,
              unreadCount,
            };
          }, false, 'markNotificationRead'),

        markAllNotificationsRead: () =>
          set((state) => ({
            notifications: state.notifications.map(n => ({ ...n, read: true })),
            unreadCount: 0,
          }), false, 'markAllNotificationsRead'),

        removeNotification: (id) =>
          set((state) => {
            const notifications = state.notifications.filter(n => n.id !== id);
            const unreadCount = notifications.filter(n => !n.read).length;
            
            return {
              notifications,
              unreadCount,
            };
          }, false, 'removeNotification'),

        toggleSidebar: () =>
          set((state) => ({
            sidebarOpen: !state.sidebarOpen,
          }), false, 'toggleSidebar'),

        setSidebarOpen: (open) =>
          set(() => ({
            sidebarOpen: open,
          }), false, 'setSidebarOpen'),

        setLoading: (loading) =>
          set(() => ({
            loading,
          }), false, 'setLoading'),

        setError: (error) =>
          set(() => ({
            error,
          }), false, 'setError'),

        clearError: () =>
          set(() => ({
            error: null,
          }), false, 'clearError'),
      }),
      {
        name: 'couple-time-app-store',
        partialize: (state) => ({
          settings: state.settings,
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'app-store',
    }
  )
);