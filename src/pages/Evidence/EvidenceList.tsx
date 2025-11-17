import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { evidenceApi } from '@/lib/api';

export default function EvidenceList() {
  const [evidence, setEvidence] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadEvidence();
  }, []);

  async function loadEvidence() {
    try {
      const data = await evidenceApi.getAll();
      setEvidence(data || []);
    } catch (error) {
      console.error('Error loading evidence:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredEvidence = evidence.filter(
    (e) =>
      e.evidence_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Evidence</h1>
          <p className="text-muted-foreground">Track and manage forensic evidence</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Log Evidence
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search evidence..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading evidence...</div>
      ) : (
        <div className="grid gap-4">
          {filteredEvidence.map((item) => (
            <Card key={item.id} className="p-6 border-primary/20">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-primary">
                      {item.evidence_number}
                    </h3>
                    <StatusBadge status={item.status} />
                    <Badge variant="outline">{item.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Case: {item.cases?.case_number} - {item.cases?.title}
                  </p>
                  <p className="text-sm">{item.description}</p>
                  {item.hash_sha256 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        SHA-256:
                      </span>
                      <code className="text-xs bg-secondary px-2 py-1 rounded">
                        {item.hash_sha256.substring(0, 16)}...
                      </code>
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Collected by: {item.profiles?.full_name}</span>
                    <span>{new Date(item.collected_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
