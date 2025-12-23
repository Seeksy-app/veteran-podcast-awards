import { useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Generate a unique session ID for this page visit
const generateSessionId = () => {
  return `deck_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const useDeckTracking = () => {
  const sessionIdRef = useRef<string>(generateSessionId());
  const startTimeRef = useRef<number>(Date.now());
  const maxScrollDepthRef = useRef<number>(0);
  const trackedVideoProgressRef = useRef<Set<string>>(new Set());

  const trackEvent = useCallback(async (
    eventType: string,
    eventData: Record<string, string | number | boolean | null> = {}
  ) => {
    try {
      await supabase.from('deck_engagement_events').insert([{
        session_id: sessionIdRef.current,
        event_type: eventType,
        event_data: eventData,
        page_url: window.location.href,
        user_agent: navigator.userAgent,
      }]);
    } catch (error) {
      console.error('Failed to track deck event:', error);
    }
  }, []);

  const trackPageView = useCallback(() => {
    trackEvent('page_view');
  }, [trackEvent]);

  const trackClick = useCallback((elementId: string, elementLabel: string) => {
    trackEvent('click', { element_id: elementId, element_label: elementLabel });
  }, [trackEvent]);

  const trackVideoPlay = useCallback((videoId: string, videoTitle: string) => {
    trackEvent('video_play', { video_id: videoId, video_title: videoTitle });
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
      progressPercent >= cp && !trackedVideoProgressRef.current.has(`${videoId}-${cp}`)
    );

    if (checkpoint) {
      trackedVideoProgressRef.current.add(`${videoId}-${checkpoint}`);
      trackEvent('video_progress', {
        video_id: videoId,
        video_title: videoTitle,
        progress_percent: checkpoint,
        duration_seconds: durationSeconds,
      });
    }
  }, [trackEvent]);

  const trackScrollDepth = useCallback((depthPercent: number) => {
    // Only track new maximum scroll depths at 25% intervals
    const checkpoints = [25, 50, 75, 100];
    const checkpoint = checkpoints.find(cp =>
      depthPercent >= cp && maxScrollDepthRef.current < cp
    );

    if (checkpoint) {
      maxScrollDepthRef.current = checkpoint;
      trackEvent('scroll_depth', { depth_percent: checkpoint });
    }
  }, [trackEvent]);

  const trackTimeOnPage = useCallback(() => {
    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
    trackEvent('time_on_page', { seconds: timeSpent });
  }, [trackEvent]);

  // Set up scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      trackScrollDepth(scrollPercent);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [trackScrollDepth]);

  // Track time on page when leaving
  useEffect(() => {
    const handleBeforeUnload = () => {
      trackTimeOnPage();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [trackTimeOnPage]);

  return {
    trackPageView,
    trackClick,
    trackVideoPlay,
    trackVideoProgress,
    trackTimeOnPage,
  };
};
