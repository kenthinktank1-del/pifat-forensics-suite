import { Badge } from './badge';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variants: Record<string, { variant: 'default' | 'destructive' | 'outline' | 'secondary', label: string }> = {
    open: { variant: 'default', label: 'Open' },
    closed: { variant: 'secondary', label: 'Closed' },
    in_progress: { variant: 'outline', label: 'In Progress' },
    collected: { variant: 'default', label: 'Collected' },
    analyzed: { variant: 'outline', label: 'Analyzed' },
    archived: { variant: 'secondary', label: 'Archived' },
    active: { variant: 'default', label: 'Active' },
  };

  const config = variants[status] || { variant: 'outline' as const, label: status };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
