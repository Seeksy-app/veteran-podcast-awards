import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

interface TrackingContext {
  email: string;
  investorAccessId: string;
}

type LoginOverride = { email: string; investorAccessId: string };

export const useInvestorTracking = (context: TrackingContext | null) => {
  const trackedProgressRef = useRef<Set<string>>(new Set());

  const trackEvent = useCallback(
    async (
      eventType: string,
      eventData: Record<string, string | number | boolean | null> = {},
      loginOverride?: LoginOverride,
    ) => {
      const ctx = loginOverride ?? (context ? { email: context.email, investorAccessId: context.investorAccessId } : null);
      if (!ctx) return;

      try {
        await supabase.from('investor_engagement_events').insert([
          {
            investor_access_id: ctx.investorAccessId,
            email: ctx.email,
            event_type: eventType,
            event_data: eventData as Json,
          },
        ]);
      } catch (error) {
        console.error('Failed to track event:', error);
      }
    },
    [context],
  );

  /** Call after successful email verification (pass override while `context` is not yet updated). */
  const trackLogin = useCallback(
    (override: LoginOverride) => {
      return trackEvent('login', {}, override);
    },
    [trackEvent],
  );

  const trackTabView = useCallback(
    (tabId: string, tabLabel: string) => {
      return trackEvent('tab_view', { tab_name: tabLabel, tab_id: tabId });
    },
    [trackEvent],
  );

  const trackVideoProgress = useCallback(
    (videoId: string, videoTitle: string, progressPercent: number, durationSeconds: number) => {
      const checkpoints = [25, 50, 75, 100];
      const checkpoint = checkpoints.find(
        (cp) => progressPercent >= cp && !trackedProgressRef.current.has(`${videoId}-${cp}`),
      );

      if (checkpoint) {
        trackedProgressRef.current.add(`${videoId}-${checkpoint}`);
        trackEvent('video_progress', {
          video_id: videoId,
          video_title: videoTitle,
          progress_percent: checkpoint,
          duration_seconds: durationSeconds,
        });
      }
    },
    [trackEvent],
  );

  const resetVideoTracking = useCallback(() => {
    trackedProgressRef.current.clear();
  }, []);

  return {
    trackLogin,
    trackTabView,
    trackVideoProgress,
    resetVideoTracking,
  };
};
