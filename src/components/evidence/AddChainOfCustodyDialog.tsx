import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface AddChainOfCustodyDialogProps {
  evidenceId: string;
  onEntryAdded: () => void;
}

const CUSTODY_ACTIONS = [
  'Evidence Transferred',
  'Evidence Examined',
  'Evidence Analyzed',
  'Evidence Stored',
  'Hash Verified',
  'Evidence Photographed',
  'Evidence Sealed',
  'Evidence Released',
  'Custom Action',
];

export function AddChainOfCustodyDialog({ evidenceId, onEntryAdded }: AddChainOfCustodyDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    action: '',
    customAction: '',
    location: '',
    notes: '',
    hashVerification: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const action = formData.action === 'Custom Action' ? formData.customAction : formData.action;
    
    if (!action) {
      toast.error('Please select or enter an action');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get current chain of custody
      const { data: evidence } = await supabase
        .from('evidence')
        .select('chain_of_custody')
        .eq('id', evidenceId)
        .single();

      const currentChain = (evidence?.chain_of_custody as any[]) || [];

      const newEntry = {
        action,
        performed_by: user.id,
        timestamp: new Date().toISOString(),
        ...(formData.location && { location: formData.location }),
        ...(formData.notes && { notes: formData.notes }),
        ...(formData.hashVerification && { hash_verification: formData.hashVerification }),
      };

      // Update chain of custody
      const { error } = await supabase
        .from('evidence')
        .update({
          chain_of_custody: [...currentChain, newEntry],
          updated_at: new Date().toISOString(),
        })
        .eq('id', evidenceId);

      if (error) throw error;

      toast.success('Chain of custody entry added');
      setOpen(false);
      setFormData({
        action: '',
        customAction: '',
        location: '',
        notes: '',
        hashVerification: '',
      });
      onEntryAdded();
    } catch (error: any) {
      console.error('Error adding chain of custody entry:', error);
      toast.error(error.message || 'Failed to add entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Chain of Custody Entry</DialogTitle>
            <DialogDescription>
              Record a new action in the evidence chain of custody
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="action">Action Type *</Label>
              <Select
                value={formData.action}
                onValueChange={(value) => setFormData({ ...formData, action: value })}
              >
                <SelectTrigger id="action">
                  <SelectValue placeholder="Select action type" />
                </SelectTrigger>
                <SelectContent>
                  {CUSTODY_ACTIONS.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.action === 'Custom Action' && (
              <div className="space-y-2">
                <Label htmlFor="customAction">Custom Action *</Label>
                <Input
                  id="customAction"
                  value={formData.customAction}
                  onChange={(e) => setFormData({ ...formData, customAction: e.target.value })}
                  placeholder="Enter custom action"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Evidence Room A"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional details about this action"
                rows={3}
              />
            </div>

            {formData.action === 'Hash Verified' && (
              <div className="space-y-2">
                <Label htmlFor="hashVerification">Hash Value</Label>
                <Input
                  id="hashVerification"
                  value={formData.hashVerification}
                  onChange={(e) => setFormData({ ...formData, hashVerification: e.target.value })}
                  placeholder="SHA256 hash"
                  className="font-mono text-xs"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Entry'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
