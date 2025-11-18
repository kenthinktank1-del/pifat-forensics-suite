import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Clock, User, MapPin, Shield, AlertCircle, FileText, Upload } from 'lucide-react';
import { format } from 'date-fns';

interface ChainOfCustodyEntry {
  action: string;
  performed_by: string;
  timestamp: string;
  location?: string;
  notes?: string;
  hash_verification?: string;
}

interface ChainOfCustodyTimelineProps {
  evidenceId: string;
}

export function ChainOfCustodyTimeline({ evidenceId }: ChainOfCustodyTimelineProps) {
  const [entries, setEntries] = useState<ChainOfCustodyEntry[]>([]);
  const [profiles, setProfiles] = useState<{ [key: string]: { full_name: string; email: string } }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChainOfCustody = async () => {
      try {
        const { data: evidence } = await supabase
          .from('evidence')
          .select('chain_of_custody, collected_by, collected_at, metadata')
          .eq('id', evidenceId)
          .single();

        if (evidence) {
          let custodyEntries = (evidence.chain_of_custody as unknown as ChainOfCustodyEntry[]) || [];
          
          // If no entries exist, create initial collection entry
          if (custodyEntries.length === 0) {
            custodyEntries = [{
              action: 'Evidence Collected',
              performed_by: evidence.collected_by,
              timestamp: evidence.collected_at,
              notes: 'Initial evidence collection',
            }];
          }

          setEntries(custodyEntries);

          // Fetch all user profiles
          const userIds = [...new Set(custodyEntries.map(e => e.performed_by))];
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', userIds);

          if (profileData) {
            const profileMap: { [key: string]: { full_name: string; email: string } } = {};
            profileData.forEach(p => {
              profileMap[p.id] = { full_name: p.full_name, email: p.email };
            });
            setProfiles(profileMap);
          }
        }
      } catch (error) {
        console.error('Error fetching chain of custody:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChainOfCustody();
  }, [evidenceId]);

  const getActionIcon = (action: string) => {
    const lowerAction = action.toLowerCase();
    if (lowerAction.includes('collect')) return <Upload className="h-5 w-5" />;
    if (lowerAction.includes('transfer')) return <User className="h-5 w-5" />;
    if (lowerAction.includes('exam') || lowerAction.includes('analyz')) return <FileText className="h-5 w-5" />;
    if (lowerAction.includes('stor')) return <MapPin className="h-5 w-5" />;
    if (lowerAction.includes('verif')) return <Shield className="h-5 w-5" />;
    return <Clock className="h-5 w-5" />;
  };

  const getActionColor = (action: string) => {
    const lowerAction = action.toLowerCase();
    if (lowerAction.includes('collect')) return 'bg-primary/20 text-primary border-primary/30';
    if (lowerAction.includes('transfer')) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (lowerAction.includes('exam') || lowerAction.includes('analyz')) return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    if (lowerAction.includes('stor')) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (lowerAction.includes('verif')) return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    return 'bg-muted text-muted-foreground border-border';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chain of Custody</CardTitle>
          <CardDescription>Loading timeline...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chain of Custody</CardTitle>
          <CardDescription>No custody records found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-5 w-5" />
            <p>No chain of custody entries have been recorded for this evidence.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Chain of Custody Timeline
        </CardTitle>
        <CardDescription>
          Complete history of evidence handling and transfers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-6">
          {/* Timeline line */}
          <div className="absolute left-[27px] top-0 bottom-0 w-0.5 bg-border" />

          {entries.map((entry, index) => {
            const profile = profiles[entry.performed_by];
            const initials = profile?.full_name
              .split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase() || '??';

            return (
              <div
                key={index}
                className="relative flex gap-6 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Avatar with icon */}
                <div className="relative z-10">
                  <Avatar className="h-14 w-14 border-2 border-background shadow-lg">
                    <AvatarFallback className={`${getActionColor(entry.action)} text-sm font-semibold`}>
                      {getActionIcon(entry.action)}
                    </AvatarFallback>
                  </Avatar>
                  {index < entries.length - 1 && (
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-border" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-6">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h4 className="font-semibold text-foreground text-lg">
                        {entry.action}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        by {profile?.full_name || 'Unknown User'}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {format(new Date(entry.timestamp), 'MMM d, yyyy HH:mm')}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    {entry.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{entry.location}</span>
                      </div>
                    )}

                    {entry.notes && (
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <FileText className="h-4 w-4 mt-0.5 shrink-0" />
                        <span>{entry.notes}</span>
                      </div>
                    )}

                    {entry.hash_verification && (
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <Shield className="h-4 w-4 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-medium">Hash Verified:</span>
                          <code className="ml-2 text-xs bg-muted px-2 py-1 rounded">
                            {entry.hash_verification.slice(0, 16)}...
                          </code>
                        </div>
                      </div>
                    )}

                    {profile?.email && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{profile.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
