import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Announcement, Settings } from '../types';

interface AppState {
  announcements: Announcement[];
  settings: Settings;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  fetchData: () => Promise<void>;
  logout: () => Promise<void>;
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateAnnouncement: (id: string, announcement: Partial<Announcement>) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
}

// Mappers to handle snake_case to camelCase
const mapAnnouncement = (row: any): Announcement => ({
  id: row.id,
  title: row.title,
  slug: row.slug,
  summary: row.summary,
  content: row.content,
  category: row.category,
  imageUrl: row.image_url,
  targetUrl: row.target_url,
  startAt: row.start_at,
  endAt: row.end_at,
  published: row.published,
  priority: row.priority,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapToRow = (a: Partial<Announcement>) => ({
  title: a.title,
  slug: a.slug,
  summary: a.summary,
  content: a.content,
  category: a.category,
  image_url: a.imageUrl,
  target_url: a.targetUrl,
  start_at: a.startAt,
  end_at: a.endAt,
  published: a.published,
  priority: a.priority,
});

const mapSettings = (row: any): Settings => ({
  displayMode: row.display_mode,
  rotationDuration: row.rotation_duration,
  transitionDuration: row.transition_duration,
  transitionType: row.transition_type,
});

export const useAppStore = create<AppState>((set, get) => ({
  announcements: [],
  settings: {
    displayMode: 'rotation',
    rotationDuration: 10,
    transitionDuration: 800,
    transitionType: 'fade-up',
  },
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,

  fetchData: async () => {
    const [announcementsRes, settingsRes] = await Promise.all([
      supabase.from('announcements').select('*').order('priority', { ascending: false }).order('created_at', { ascending: false }),
      supabase.from('settings').select('*').limit(1).single()
    ]);

    if (announcementsRes.data) {
      set({ announcements: announcementsRes.data.map(mapAnnouncement) });
    }
    if (settingsRes.data) {
      set({ settings: mapSettings(settingsRes.data) });
    }
  },

  initialize: async () => {
    if (get().isInitialized) return;
    set({ isInitialized: true, isLoading: true });
    
    // Check auth
    const { data: { session } } = await supabase.auth.getSession();
    set({ isAuthenticated: !!session });

    // Listen to auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ isAuthenticated: !!session });
    });

    // Fetch initial data
    await get().fetchData();

    set({ isLoading: false });

    // Polling fallback (every 30 seconds)
    const pollInterval = setInterval(async () => {
      console.log('Polling for updates...');
      await get().fetchData();
    }, 30000);

    // Re-fetch on tab focus
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        console.log('Tab focused, re-fetching data...');
        await get().fetchData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Setup realtime subscriptions
    await supabase.removeAllChannels();

    supabase.channel('public:announcements')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, async (payload) => {
        console.log('Realtime change received for announcements:', payload);
        await get().fetchData();
      })
      .subscribe((status) => {
        console.log('Realtime subscription status (announcements):', status);
      });

    supabase.channel('public:settings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, async (payload) => {
        console.log('Realtime change received for settings:', payload);
        await get().fetchData();
      })
      .subscribe((status) => {
        console.log('Realtime subscription status (settings):', status);
      });
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ isAuthenticated: false });
  },
  
  addAnnouncement: async (announcement) => {
    const { error } = await supabase.from('announcements').insert(mapToRow(announcement));
    if (error) {
      console.error('Error adding announcement:', error);
      throw error;
    }
    // Manual re-fetch to ensure UI updates immediately
    await get().fetchData();
  },
  
  updateAnnouncement: async (id, updatedFields) => {
    const { error } = await supabase.from('announcements').update(mapToRow(updatedFields)).eq('id', id);
    if (error) {
      console.error('Error updating announcement:', error);
      throw error;
    }
    // Manual re-fetch to ensure UI updates immediately
    await get().fetchData();
  },
  
  deleteAnnouncement: async (id) => {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
    // Manual re-fetch to ensure UI updates immediately
    await get().fetchData();
  },
  
  updateSettings: async (newSettings) => {
    const { data: settingsData } = await supabase.from('settings').select('id').limit(1).single();
    if (settingsData?.id) {
      const { error } = await supabase.from('settings').update({
        display_mode: newSettings.displayMode,
        rotation_duration: newSettings.rotationDuration,
        transition_duration: newSettings.transitionDuration,
        transition_type: newSettings.transitionType,
        updated_at: new Date().toISOString()
      }).eq('id', settingsData.id);
      
      if (error) {
        console.error('Error updating settings:', error);
      } else {
        // Manual re-fetch to ensure UI updates immediately
        await get().fetchData();
      }
    }
  },
}));
