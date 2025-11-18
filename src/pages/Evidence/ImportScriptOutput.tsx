import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, AlertCircle, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function ImportScriptOutput() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<{ [key: string]: File }>({});
  const [caseId, setCaseId] = useState('');

  const requiredFiles = {
    device_properties: 'device_properties.txt',
    device_date: 'device_date.txt',
    battery_status: 'battery_status.txt',
    network_info: 'network_info.txt',
    installed_packages: 'installed_packages.txt',
    storage_info: 'storage_info.txt',
    acquisition_log: 'acquisition.log',
  };

  const handleFileChange = (key: string, file: File | null) => {
    if (file) {
      setFiles(prev => ({ ...prev, [key]: file }));
    }
  };

  const parseDeviceProperties = async (file: File): Promise<any> => {
    const text = await file.text();
    const props: any = {};
    text.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length) {
        props[key.trim()] = valueParts.join('=').trim().replace(/[\[\]]/g, '');
      }
    });
    return props;
  };

  const handleImport = async () => {
    if (!caseId) {
      toast.error('Please select a case first');
      return;
    }

    const missingFiles = Object.entries(requiredFiles)
      .filter(([key]) => !files[key])
      .map(([, name]) => name);

    if (missingFiles.length > 0) {
      toast.error(`Missing required files: ${missingFiles.join(', ')}`);
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Parse device properties
      const deviceProps = await parseDeviceProperties(files.device_properties);
      const deviceModel = deviceProps['ro.product.model'] || 'Unknown Device';
      const deviceSerial = deviceProps['ro.serialno'] || 'Unknown';
      const androidVersion = deviceProps['ro.build.version.release'] || 'Unknown';

      // Create evidence record
      const evidenceNumber = `EVD-${Date.now()}`;
      const { data: evidence, error: evidenceError } = await supabase
        .from('evidence')
        .insert({
          case_id: caseId,
          evidence_number: evidenceNumber,
          type: 'Mobile Device',
          description: `Android device acquisition: ${deviceModel} (Serial: ${deviceSerial}, Android ${androidVersion})`,
          collected_by: user.id,
          collected_at: new Date().toISOString(),
          metadata: {
            device_model: deviceModel,
            device_serial: deviceSerial,
            android_version: androidVersion,
            manufacturer: deviceProps['ro.product.manufacturer'],
            build_id: deviceProps['ro.build.id'],
          },
        })
        .select()
        .single();

      if (evidenceError) throw evidenceError;

      // Upload all files as attachments
      for (const [key, file] of Object.entries(files)) {
        const filePath = `${caseId}/${evidence.id}/${file.name}`;
        
        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('evidence-files')
          .upload(filePath, file);

        if (uploadError) {
          console.error(`Failed to upload ${file.name}:`, uploadError);
          continue;
        }

        // Create attachment record
        await supabase.from('attachments').insert({
          evidence_id: evidence.id,
          case_id: caseId,
          file_name: file.name,
          file_path: filePath,
          file_type: file.type || 'text/plain',
          file_size: file.size,
          uploaded_by: user.id,
        });
      }

      // Create a note with acquisition summary
      const logText = await files.acquisition_log.text();
      await supabase.from('notes').insert({
        case_id: caseId,
        evidence_id: evidence.id,
        content: `**Acquisition Log Summary**\n\n${logText.slice(0, 5000)}${logText.length > 5000 ? '...\n\n(Log truncated. See attachment for full log)' : ''}`,
        created_by: user.id,
      });

      toast.success('Evidence imported successfully');
      navigate(`/cases/${caseId}`);
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(error.message || 'Failed to import evidence');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Import Script Output</h1>
        <p className="text-muted-foreground">
          Import evidence collected from the phone acquisition script
        </p>
      </div>

      <Alert className="mb-6 border-primary/50 bg-primary/10">
        <Download className="h-4 w-4" />
        <AlertDescription>
          <strong>Need the acquisition script?</strong>{' '}
          <a 
            href="/scripts/phone_acquisition_v11.sh" 
            download 
            className="text-primary hover:underline font-medium"
          >
            Download phone_acquisition_v11.sh
          </a>
        </AlertDescription>
      </Alert>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Case</CardTitle>
          <CardDescription>Choose which case to import this evidence into</CardDescription>
        </CardHeader>
        <CardContent>
          <CaseSelector onSelect={setCaseId} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upload Acquisition Files</CardTitle>
          <CardDescription>
            Upload the output files from the phone acquisition script
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(requiredFiles).map(([key, filename]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key} className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {filename}
                {files[key] && <span className="text-xs text-primary">✓ Uploaded</span>}
              </Label>
              <Input
                id={key}
                type="file"
                accept=".txt,.log"
                onChange={(e) => handleFileChange(key, e.target.files?.[0] || null)}
                className="cursor-pointer"
              />
            </div>
          ))}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Additional files like screenshots, app data archives, and the PDF report can be uploaded
              manually to the case after import.
            </AlertDescription>
          </Alert>

          <Button
            onClick={handleImport}
            disabled={loading || !caseId}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>Processing...</>
            ) : (
              <>
                <Upload className="mr-2 h-5 w-5" />
                Import Evidence
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function CaseSelector({ onSelect }: { onSelect: (id: string) => void }) {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useState(() => {
    const fetchCases = async () => {
      const { data } = await supabase
        .from('cases')
        .select('id, case_number, title, status')
        .order('created_at', { ascending: false });
      
      if (data) setCases(data);
      setLoading(false);
    };
    fetchCases();
  });

  if (loading) {
    return <div className="text-muted-foreground">Loading cases...</div>;
  }

  return (
    <select
      onChange={(e) => onSelect(e.target.value)}
      className="w-full p-2 rounded-md border border-border bg-background text-foreground"
    >
      <option value="">Select a case...</option>
      {cases.map(c => (
        <option key={c.id} value={c.id}>
          {c.case_number} - {c.title} ({c.status})
        </option>
      ))}
    </select>
  );
}
