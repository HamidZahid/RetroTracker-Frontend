import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useCreateRetro } from '@/hooks/useRetros';

const createRetroSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  sprintNumber: z.string().optional(),
});

type CreateRetroFormData = z.infer<typeof createRetroSchema>;

interface CreateRetroDialogProps {
  teamId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateRetroDialog({ teamId, open, onOpenChange, onSuccess }: CreateRetroDialogProps) {
  const { mutate: createRetro, isPending } = useCreateRetro(teamId);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateRetroFormData>({
    resolver: zodResolver(createRetroSchema),
  });

  const onSubmit = (data: CreateRetroFormData) => {
    createRetro(
      {
        name: data.name,
        sprintNumber: data.sprintNumber ? parseInt(data.sprintNumber) : undefined,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      },
      {
        onSuccess: () => {
          reset();
          setStartDate(undefined);
          setEndDate(undefined);
          onOpenChange(false);
          onSuccess?.();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create Retrospective</DialogTitle>
          <DialogDescription>
            Set up a new retrospective session for your team
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label htmlFor="name">Retrospective Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Sprint 23 Retrospective"
              {...register('name')}
              disabled={isPending}
              className="h-11"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sprintNumber">Sprint Number (Optional)</Label>
            <Input
              id="sprintNumber"
              type="number"
              placeholder="e.g., 23"
              {...register('sprintNumber')}
              disabled={isPending}
              className="h-11"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal h-11',
                      !startDate && 'text-muted-foreground'
                    )}
                    disabled={isPending}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal h-11',
                      !endDate && 'text-muted-foreground'
                    )}
                    disabled={isPending}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="min-w-[120px]">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? 'Creating...' : 'Create Retro'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
