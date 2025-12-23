import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Eye, 
  MousePointer, 
  Play, 
  ArrowDown, 
  Clock, 
  Users,
  TrendingUp,
  Video
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface DeckEvent {
  id: string;
  session_id: string;
  event_type: string;
  event_data: Record<string, unknown> | null;
  page_url: string | null;
  created_at: string;
}

export const DeckEngagementPanel = () => {
  const { data: events, isLoading } = useQuery({
    queryKey: ['deck-engagement'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deck_engagement_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      return data as DeckEvent[];
    },
  });

  if (isLoading) {
    return <div className="p-4 text-center">Loading engagement data...</div>;
  }

  // Calculate stats
  const uniqueSessions = new Set(events?.map(e => e.session_id) || []).size;
  const pageViews = events?.filter(e => e.event_type === 'page_view').length || 0;
  const clicks = events?.filter(e => e.event_type === 'click').length || 0;
  const videoPlays = events?.filter(e => e.event_type === 'video_play').length || 0;
  const videoProgress = events?.filter(e => e.event_type === 'video_progress') || [];
  const scrollEvents = events?.filter(e => e.event_type === 'scroll_depth') || [];
  const timeEvents = events?.filter(e => e.event_type === 'time_on_page') || [];

  // Calculate averages
  const avgTimeOnPage = timeEvents.length > 0
    ? Math.round(timeEvents.reduce((sum, e) => sum + (Number(e.event_data?.seconds) || 0), 0) / timeEvents.length)
    : 0;

  const maxScrollDepths = scrollEvents.reduce((acc, e) => {
    const sessionId = e.session_id;
    const depth = Number(e.event_data?.depth_percent) || 0;
    if (!acc[sessionId] || depth > acc[sessionId]) {
      acc[sessionId] = depth;
    }
    return acc;
  }, {} as Record<string, number>);

  const avgScrollDepth = Object.values(maxScrollDepths).length > 0
    ? Math.round(Object.values(maxScrollDepths).reduce((a, b) => a + b, 0) / Object.values(maxScrollDepths).length)
    : 0;

  // Video completion rates
  const videoCompletions = videoProgress.filter(e => Number(e.event_data?.progress_percent) === 100).length;

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'page_view': return <Eye className="h-4 w-4 text-blue-500" />;
      case 'click': return <MousePointer className="h-4 w-4 text-green-500" />;
      case 'video_play': return <Play className="h-4 w-4 text-purple-500" />;
      case 'video_progress': return <Video className="h-4 w-4 text-purple-500" />;
      case 'scroll_depth': return <ArrowDown className="h-4 w-4 text-orange-500" />;
      case 'time_on_page': return <Clock className="h-4 w-4 text-teal-500" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const getEventLabel = (event: DeckEvent) => {
    const data = event.event_data || {};
    switch (event.event_type) {
      case 'page_view':
        return 'Viewed VPA Deck page';
      case 'click':
        return `Clicked: ${data.element_label || data.element_id || 'unknown'}`;
      case 'video_play':
        return `Started video: ${data.video_title || 'unknown'}`;
      case 'video_progress':
        return `Video ${data.progress_percent}% watched`;
      case 'scroll_depth':
        return `Scrolled to ${data.depth_percent}%`;
      case 'time_on_page':
        return `Time on page: ${data.seconds}s`;
      default:
        return event.event_type;
    }
  };

  // Group events by session for timeline view
  const groupedBySession = events?.reduce((acc, event) => {
    const session = event.session_id;
    if (!acc[session]) {
      acc[session] = [];
    }
    acc[session].push(event);
    return acc;
  }, {} as Record<string, DeckEvent[]>) || {};

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{uniqueSessions}</p>
                <p className="text-sm text-muted-foreground">Unique Visitors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <MousePointer className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{clicks}</p>
                <p className="text-sm text-muted-foreground">Total Clicks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{videoPlays}</p>
                <p className="text-sm text-muted-foreground">Video Plays</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{videoCompletions}</p>
                <p className="text-sm text-muted-foreground">Video Completions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-teal-500" />
              <div>
                <p className="text-2xl font-bold">{avgTimeOnPage}s</p>
                <p className="text-sm text-muted-foreground">Avg. Time on Page</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{avgScrollDepth}%</p>
                <p className="text-sm text-muted-foreground">Avg. Scroll Depth</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Recent Sessions ({Object.keys(groupedBySession).length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {Object.entries(groupedBySession).slice(0, 20).map(([sessionId, sessionEvents]) => {
                const firstEvent = sessionEvents[sessionEvents.length - 1];
                const lastEvent = sessionEvents[0];
                return (
                  <div key={sessionId} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="font-mono text-xs">
                        {sessionId.slice(0, 20)}...
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(firstEvent.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {sessionEvents.slice(0, 10).map((event) => (
                        <div key={event.id} className="flex items-center gap-2 text-sm">
                          {getEventIcon(event.event_type)}
                          <span>{getEventLabel(event)}</span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {format(new Date(event.created_at), 'HH:mm:ss')}
                          </span>
                        </div>
                      ))}
                      {sessionEvents.length > 10 && (
                        <p className="text-xs text-muted-foreground">
                          +{sessionEvents.length - 10} more events
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
