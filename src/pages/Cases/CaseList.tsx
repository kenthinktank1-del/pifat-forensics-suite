import { useEffect, useState } from 'react';
import { Plus, Search, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { casesApi } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

export default function CaseList() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadCases();
  }, []);

  async function loadCases() {
    try {
      const data = await casesApi.getAll();
      setCases(data || []);
    } catch (error) {
      console.error('Error loading cases:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredCases = cases.filter(
    (c) =>
      c.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Cases</h1>
          <p className="text-muted-foreground">Manage forensic investigations</p>
        </div>
        <Button onClick={() => navigate('/cases/create')}>
          <Plus className="mr-2 h-4 w-4" />
          New Case
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search cases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading cases...</div>
      ) : (
        <div className="grid gap-4">
          {filteredCases.map((caseItem) => (
            <Card key={caseItem.id} className="p-6 border-primary/20 hover:border-primary/40 transition-colors">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-primary">
                      {caseItem.case_number}
                    </h3>
                    <StatusBadge status={caseItem.status} />
                    <span className="text-sm text-muted-foreground">
                      Priority: {caseItem.priority}
                    </span>
                  </div>
                  <p className="text-xl font-medium">{caseItem.title}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {caseItem.description || 'No description'}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Created by: {caseItem.profiles?.full_name}</span>
                    <span>
                      {new Date(caseItem.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/cases/${caseItem.id}`)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
