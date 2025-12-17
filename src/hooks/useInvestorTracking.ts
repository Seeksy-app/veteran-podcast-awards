import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

interface TrackingContext {
  email: string;
  investorAccessId: string;
}

export const useInvestorTracking = (context: TrackingContext | null) => {
  const trackedProgressRef = useRef<Set<string>>(new Set());

  const trackEvent = useCallback(async (
    eventType: string,
    eventData: Record<string, string | number | boolean | null> = {}
  ) => {
    if (!context) return;

    try {
      await supabase.from('investor_engagement_events').insert([{
        investor_access_id: context.investorAccessId,
        email: context.email,
        event_type: eventType,
        event_data: eventData as Json,
      }]);
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }, [context]);

  const trackPortalOpen = useCallback(() => {
    trackEvent('portal_opened');
  }, [trackEvent]);

  const trackTabClick = useCallback((tabId: string, tabLabel: string) => {
    trackEvent('tab_clicked', { tab_id: tabId, tab_label: tabLabel });
  }, [trackEvent]);

  const trackVideoProgress = useCallback((
    videoId: string,
    videoTitle: string,
    progressPercent: number,
    durationSeconds: number
  ) => {
    // Only track at 25%, 50%, 75%, 100% checkpoints
    const checkpoints = [25, 50, 75, 100];
    const checkpoint = checkpoints.find(cp => 
      progressPercent >= cp && !trackedProgressRef.current.has(`${videoId}-${cp}`)
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
  }, [trackEvent]);

  const resetVideoTracking = useCallback(() => {
    trackedProgressRef.current.clear();
  }, []);

  return {
    trackPortalOpen,
    trackTabClick,
    trackVideoProgress,
    resetVideoTracking,
  };
};
