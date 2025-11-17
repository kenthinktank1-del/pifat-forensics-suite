import { useEffect, useState } from 'react';
import { Activity, FolderOpen, Shield, FileText, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { casesApi, evidenceApi } from '@/lib/api';
import { useAdmin } from '@/hooks/useAdmin';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalCases: 0,
    activeCases: 0,
    totalEvidence: 0,
    recentActivity: 0,
  });
  const { isAdmin } = useAdmin();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [cases, evidence] = await Promise.all([
          casesApi.getAll(),
          evidenceApi.getAll(),
        ]);

        setStats({
          totalCases: cases?.length || 0,
          activeCases: cases?.filter((c: any) => c.status === 'open').length || 0,
          totalEvidence: evidence?.length || 0,
          recentActivity: cases?.filter((c: any) => {
            const diff = Date.now() - new Date(c.created_at).getTime();
            return diff < 7 * 24 * 60 * 60 * 1000; // Last 7 days
          }).length || 0,
        });
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const statCards = [
    {
      title: 'Total Cases',
      value: stats.totalCases,
      icon: FolderOpen,
      description: 'All cases in system',
    },
    {
      title: 'Active Cases',
      value: stats.activeCases,
      icon: Activity,
      description: 'Currently open',
    },
    {
      title: 'Evidence Items',
      value: stats.totalEvidence,
      icon: Shield,
      description: 'Collected evidence',
    },
    {
      title: 'Recent Activity',
      value: stats.recentActivity,
      icon: TrendingUp,
      description: 'Last 7 days',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">
          {isAdmin ? 'Admin' : 'Analyst'} Dashboard
        </h1>
        <p className="text-muted-foreground">Overview of forensic investigations</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{loading ? '...' : stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common forensic tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/cases/create"
              className="block p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <div className="font-medium">Create New Case</div>
              <div className="text-sm text-muted-foreground">Start a new investigation</div>
            </a>
            <a
              href="/evidence"
              className="block p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <div className="font-medium">Log Evidence</div>
              <div className="text-sm text-muted-foreground">Record new evidence item</div>
            </a>
            <a
              href="/ai/analyzer"
              className="block p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <div className="font-medium">AI Analysis</div>
              <div className="text-sm text-muted-foreground">Analyze evidence with AI</div>
            </a>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              System Status
            </CardTitle>
            <CardDescription>Platform health</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Database</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="text-sm text-success">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Storage</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="text-sm text-success">Available</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">AI Services</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="text-sm text-success">Ready</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
