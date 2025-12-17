import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Eye, MousePointer, Play, Clock, User } from 'lucide-react';
import { format } from 'date-fns';

interface EngagementEvent {
  id: string;
  email: string;
  event_type: string;
  event_data: {
    tab_id?: string;
    tab_label?: string;
    video_id?: string;
    video_title?: string;
    progress_percent?: number;
    duration_seconds?: number;
  };
  created_at: string;
}

interface GroupedEvents {
  [email: string]: EngagementEvent[];
}

export const InvestorEngagementPanel = () => {
  const { data: events, isLoading } = useQuery({
    queryKey: ['investor-engagement-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investor_engagement_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      return data as EngagementEvent[];
    },
  });

  const groupedEvents: GroupedEvents = events?.reduce((acc, event) => {
    if (!acc[event.email]) {
      acc[event.email] = [];
    }
    acc[event.email].push(event);
    return acc;
  }, {} as GroupedEvents) || {};

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'portal_opened':
        return <Eye className="w-4 h-4 text-blue-500" />;
      case 'tab_clicked':
        return <MousePointer className="w-4 h-4 text-green-500" />;
      case 'video_progress':
        return <Play className="w-4 h-4 text-purple-500" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getEventLabel = (event: EngagementEvent) => {
    switch (event.event_type) {
      case 'portal_opened':
        return 'Opened Portal';
      case 'tab_clicked':
        return `Clicked "${event.event_data.tab_label || event.event_data.tab_id}" tab`;
      case 'video_progress':
        return `Video "${event.event_data.video_title}" - ${event.event_data.progress_percent}%`;
      default:
        return event.event_type;
    }
  };

  const getInvestorStats = (events: EngagementEvent[]) => {
    const portalOpens = events.filter(e => e.event_type === 'portal_opened').length;
    const tabClicks = events.filter(e => e.event_type === 'tab_clicked').length;
    const videoProgress = events.filter(e => e.event_type === 'video_progress');
    const maxProgress = videoProgress.length > 0 
      ? Math.max(...videoProgress.map(e => e.event_data.progress_percent || 0))
      : 0;
    
    return { portalOpens, tabClicks, maxProgress };
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading engagement data...
        </CardContent>
      </Card>
    );
  }

  const investorEmails = Object.keys(groupedEvents);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-foreground">Investor Engagement</h2>
        <p className="text-muted-foreground">Detailed timeline of investor portal activity</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <User className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{investorEmails.length}</p>
                <p className="text-sm text-muted-foreground">Unique Investors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Eye className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{events?.filter(e => e.event_type === 'portal_opened').length || 0}</p>
                <p className="text-sm text-muted-foreground">Total Portal Opens</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Play className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{events?.filter(e => e.event_type === 'video_progress').length || 0}</p>
                <p className="text-sm text-muted-foreground">Video Progress Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per-Investor Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Activity by Investor</CardTitle>
          <CardDescription>Click to expand detailed timeline</CardDescription>
        </CardHeader>
        <CardContent>
          {investorEmails.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No engagement data yet</p>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {investorEmails.map((email) => {
                const investorEvents = groupedEvents[email];
                const stats = getInvestorStats(investorEvents);
                const lastActivity = investorEvents[0]?.created_at;

                return (
                  <AccordionItem key={email} value={email}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{stats.portalOpens} opens</Badge>
                          <Badge variant="secondary">{stats.tabClicks} tabs</Badge>
                          {stats.maxProgress > 0 && (
                            <Badge variant="secondary">{stats.maxProgress}% video</Badge>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ScrollArea className="h-64">
                        <div className="space-y-2 pl-7">
                          {investorEvents.map((event) => (
                            <div
                              key={event.id}
                              className="flex items-center gap-3 py-2 border-l-2 border-border pl-4"
                            >
                              {getEventIcon(event.event_type)}
                              <div className="flex-1">
                                <p className="text-sm font-medium">{getEventLabel(event)}</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(event.created_at), 'MMM d, yyyy h:mm:ss a')}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
