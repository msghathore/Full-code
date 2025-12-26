import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface ArrivalDialogProps {
  appointmentId: string;
  appointmentTime: string;
  customerName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ArrivalDialog({
  appointmentId,
  appointmentTime,
  customerName,
  open,
  onOpenChange,
  onSuccess
}: ArrivalDialogProps) {
  const [minutesLate, setMinutesLate] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleMarkArrived = async () => {
    setSubmitting(true);
    try {
      const { data, error } = await supabase.rpc('mark_appointment_arrived', {
        p_appointment_id: appointmentId,
        p_minutes_late: minutesLate
      });

      if (error) throw error;

      if (!data || !data.success) {
        throw new Error(data?.error || 'Failed to mark arrival');
      }

      toast.success(`${customerName} marked as arrived`);
      onOpenChange(false);
      onSuccess?.();

      // Reset form
      setMinutesLate(0);
    } catch (err: any) {
      console.error('Error marking arrival:', err);
      toast.error(err.message || 'Failed to mark arrival');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusMessage = () => {
    if (minutesLate === 0) {
      return {
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
        message: 'Customer is on time!',
        variant: 'default' as const
      };
    } else if (minutesLate <= 5) {
      return {
        icon: <Clock className="w-5 h-5 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />,
        message: 'Slightly late, but should be fine.',
        variant: 'default' as const
      };
    } else if (minutesLate <= 15) {
      return {
        icon: <AlertTriangle className="w-5 h-5 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />,
        message: 'Moderately late. Service may be shortened.',
        variant: 'destructive' as const
      };
    } else {
      return {
        icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
        message: 'Significantly late! Consider if full service can be completed.',
        variant: 'destructive' as const
      };
    }
  };

  const status = getStatusMessage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white text-black">
        <DialogHeader>
          <DialogTitle>Mark Customer Arrival</DialogTitle>
          <DialogDescription>
            Record arrival time for {customerName}
            <br />
            <span className="text-xs text-gray-500">Scheduled time: {appointmentTime}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="minutesLate">
              How many minutes late? <span className="text-gray-500 text-xs">(0 = on time)</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="minutesLate"
                type="number"
                min={0}
                max={120}
                value={minutesLate}
                onChange={(e) => setMinutesLate(Math.max(0, parseInt(e.target.value) || 0))}
                className="text-lg font-bold"
              />
              <span className="flex items-center text-gray-600">minutes</span>
            </div>
          </div>

          {/* Quick buttons */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMinutesLate(0)}
              className={minutesLate === 0 ? 'bg-emerald-100 border-emerald-500' : ''}
            >
              On Time
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMinutesLate(5)}
              className={minutesLate === 5 ? 'bg-white/10 border-white/30' : ''}
            >
              5 min
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMinutesLate(10)}
              className={minutesLate === 10 ? 'bg-white/10 border-white/30' : ''}
            >
              10 min
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMinutesLate(15)}
              className={minutesLate === 15 ? 'bg-red-100 border-red-500' : ''}
            >
              15 min
            </Button>
          </div>

          {/* Status Alert */}
          <Alert variant={status.variant} className="flex items-start gap-2">
            {status.icon}
            <AlertDescription className="flex-1">{status.message}</AlertDescription>
          </Alert>

          {/* Late arrival note */}
          {minutesLate > 15 && (
            <Alert variant="destructive">
              <AlertDescription className="text-sm">
                <strong>Important:</strong> Customer is more than 15 minutes late.
                The appointment status will be set to "In Progress" instead of "Ready to Start"
                to allow you to begin service immediately without further confirmation.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleMarkArrived}
            disabled={submitting}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Marking Arrival...
              </>
            ) : (
              'Confirm Arrival'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
