import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, FileText, Shield, Paperclip, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/ui/status-badge';
import { casesApi, evidenceApi, notesApi, attachmentsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ChainOfCustodyTimeline } from '@/components/evidence/ChainOfCustodyTimeline';
import { AddChainOfCustodyDialog } from '@/components/evidence/AddChainOfCustodyDialog';

export default function CaseView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [caseData, setCaseData] = useState<any>(null);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);
  const [custodyDialogOpen, setCustodyDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadCaseData();
    }
  }, [id]);

  async function loadCaseData() {
    try {
      const [caseInfo, evidenceData, notesData, attachmentsData] = await Promise.all([
        casesApi.getById(id!),
        evidenceApi.getByCase(id!),
        notesApi.getByCase(id!),
        attachmentsApi.getByCase(id!),
      ]);

      setCaseData(caseInfo);
      setEvidence(evidenceData || []);
      setNotes(notesData || []);
      setAttachments(attachmentsData || []);
    } catch (error) {
      console.error('Error loading case:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load case data',
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading case...</div>;
  }

  if (!caseData) {
    return <div className="text-center py-12">Case not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/cases')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-primary">
              {caseData.case_number}
            </h1>
            <StatusBadge status={caseData.status} />
          </div>
          <p className="text-muted-foreground">{caseData.title}</p>
        </div>
        <Button variant="outline" onClick={() => navigate(`/cases/${id}/edit`)}>
          Edit Case
        </Button>
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Case Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <span className="text-sm text-muted-foreground">Priority</span>
              <p className="font-medium capitalize">{caseData.priority}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Created By</span>
              <p className="font-medium">{caseData.profiles?.full_name}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Created At</span>
              <p className="font-medium">
                {new Date(caseData.created_at).toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Last Updated</span>
              <p className="font-medium">
                {new Date(caseData.updated_at).toLocaleString()}
              </p>
            </div>
          </div>
          {caseData.description && (
            <div>
              <span className="text-sm text-muted-foreground">Description</span>
              <p className="mt-1">{caseData.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="evidence" className="space-y-4">
        <TabsList>
          <TabsTrigger value="evidence">
            <Shield className="mr-2 h-4 w-4" />
            Evidence ({evidence.length})
          </TabsTrigger>
          <TabsTrigger value="notes">
            <FileText className="mr-2 h-4 w-4" />
            Notes ({notes.length})
          </TabsTrigger>
          <TabsTrigger value="attachments">
            <Paperclip className="mr-2 h-4 w-4" />
            Attachments ({attachments.length})
          </TabsTrigger>
          <TabsTrigger value="custody">
            <Clock className="mr-2 h-4 w-4" />
            Chain of Custody
          </TabsTrigger>
        </TabsList>

        <TabsContent value="evidence" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Evidence Items</h3>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Evidence
            </Button>
          </div>
          <div className="grid gap-4">
            {evidence.map((item) => (
              <Card key={item.id} className="border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-semibold text-primary">
                        {item.evidence_number}
                      </h4>
                      <p className="text-sm text-muted-foreground">{item.type}</p>
                      <p className="mt-2">{item.description}</p>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <StatusBadge status={item.status} />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedEvidenceId(item.id);
                          setCustodyDialogOpen(true);
                        }}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        View Custody
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {evidence.length === 0 && (
              <p className="text-center py-8 text-muted-foreground">
                No evidence items yet
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Case Notes</h3>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Note
            </Button>
          </div>
          <div className="space-y-4">
            {notes.map((note) => (
              <Card key={note.id} className="border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium">
                      {note.profiles?.full_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(note.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap">{note.content}</p>
                </CardContent>
              </Card>
            ))}
            {notes.length === 0 && (
              <p className="text-center py-8 text-muted-foreground">No notes yet</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="attachments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Attachments</h3>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Upload File
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {attachments.map((attachment) => (
              <Card key={attachment.id} className="border-primary/20">
                <CardContent className="pt-6">
                  <Paperclip className="h-8 w-8 text-primary mb-2" />
                  <p className="font-medium truncate">{attachment.file_name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(attachment.file_size / 1024).toFixed(2)} KB
                  </p>
                </CardContent>
              </Card>
            ))}
            {attachments.length === 0 && (
              <p className="text-center py-8 text-muted-foreground col-span-3">
                No attachments yet
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="custody" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Chain of Custody Timeline</h3>
            <p className="text-sm text-muted-foreground">
              Select an evidence item to view its custody history
            </p>
          </div>
          {evidence.length > 0 ? (
            <div className="space-y-6">
              {evidence.map((item) => (
                <div key={item.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-primary">{item.evidence_number}</h4>
                      <p className="text-sm text-muted-foreground">{item.type}</p>
                    </div>
                    <AddChainOfCustodyDialog
                      evidenceId={item.id}
                      onEntryAdded={loadCaseData}
                    />
                  </div>
                  <ChainOfCustodyTimeline evidenceId={item.id} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              No evidence items to track
            </p>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick View Dialog for Evidence Custody */}
      <Dialog open={custodyDialogOpen} onOpenChange={setCustodyDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chain of Custody</DialogTitle>
          </DialogHeader>
          {selectedEvidenceId && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <AddChainOfCustodyDialog
                  evidenceId={selectedEvidenceId}
                  onEntryAdded={loadCaseData}
                />
              </div>
              <ChainOfCustodyTimeline evidenceId={selectedEvidenceId} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
