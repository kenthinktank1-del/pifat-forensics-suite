import { useState } from 'react';
import { Smartphone, CheckCircle2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AcquisitionVisualizer() {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'capturing' | 'hashing' | 'completed'>('idle');

  const steps = [
    { id: 'scanning', label: 'Scanning Device', color: 'text-info' },
    { id: 'capturing', label: 'Capturing Data', color: 'text-warning' },
    { id: 'hashing', label: 'Computing Hash', color: 'text-warning' },
    { id: 'completed', label: 'Completed', color: 'text-success' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Device Acquisition</h1>
        <p className="text-muted-foreground">Visual acquisition workflow</p>
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Device Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <span className="text-sm text-muted-foreground">Device Type</span>
              <p className="font-medium">iOS Device</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Manufacturer</span>
              <p className="font-medium">Apple Inc.</p>
            </div>
          </div>

          <div className="space-y-3 py-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-3">
                {status === step.id ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : index < steps.findIndex(s => s.id === status) || status === 'completed' ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-muted" />
                )}
                <span className={step.color}>{step.label}</span>
              </div>
            ))}
          </div>

          {status === 'completed' && (
            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">SHA-256 Hash:</span>
                <code className="text-xs bg-secondary px-2 py-1 rounded">
                  a3f5b8c2d9e1f4a7...
                </code>
              </div>
            </div>
          )}

          <Button
            className="w-full"
            onClick={() => setStatus(status === 'idle' ? 'scanning' : 'idle')}
          >
            {status === 'idle' ? 'Start Acquisition' : 'Reset'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
