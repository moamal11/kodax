import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import { createAppOpenTracker } from '@/services/appOpenTracker';

/** Mounted once by AuthProvider, after the session and profile are verified. */
export function useAppOpenTracking(userId: string | undefined) {
  useEffect(() => {
    if (!userId) return;
    const tracker = createAppOpenTracker(async () => {
      const { error } = await supabase.rpc('record_app_open');
      if (error) throw error;
    });
    if (Platform.OS === 'web') {
      if (typeof document === 'undefined') return () => tracker.stop();
      const onVisibility = () => tracker.setActive(document.visibilityState === 'visible');
      document.addEventListener('visibilitychange', onVisibility);
      onVisibility();
      return () => {
        tracker.stop();
        document.removeEventListener('visibilitychange', onVisibility);
      };
    }
    const sub = AppState.addEventListener('change', state => tracker.setActive(state === 'active'));
    tracker.setActive(AppState.currentState === 'active');
    return () => { tracker.stop(); sub.remove(); };
  }, [userId]);
}
