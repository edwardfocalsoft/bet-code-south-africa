import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface ReportPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReport: (postId: string, reason: string) => Promise<boolean>;
  postId: string;
}

const reportReasons = [
  'Spam or misleading content',
  'Harassment or bullying',
  'Inappropriate content',
  'False information',
  'Scam or fraud',
  'Other',
];

const ReportPostDialog: React.FC<ReportPostDialogProps> = ({
  open,
  onOpenChange,
  onReport,
  postId,
}) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const reason = selectedReason === 'Other' ? customReason : selectedReason;
    if (!reason.trim() || loading) return;

    setLoading(true);
    const success = await onReport(postId, reason);
    if (success) {
      setSelectedReason('');
      setCustomReason('');
      onOpenChange(false);
    }
    setLoading(false);
  };

  const handleClose = () => {
    setSelectedReason('');
    setCustomReason('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report Post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Help us understand what's happening with this post.
          </p>
          
          <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
            {reportReasons.map((reason) => (
              <div key={reason} className="flex items-center space-x-2">
                <RadioGroupItem value={reason} id={reason} />
                <Label htmlFor={reason} className="text-sm font-normal">
                  {reason}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {selectedReason === 'Other' && (
            <Textarea
              placeholder="Please describe the issue..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="min-h-[80px]"
            />
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!selectedReason || (selectedReason === 'Other' && !customReason.trim()) || loading}
            >
              {loading ? 'Reporting...' : 'Report'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportPostDialog;