import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateActionItem } from '@/hooks/useActionItems';
import { useRetros } from '@/hooks/useRetros';
import { useTeamMembers } from '@/hooks/useTeams';

const actionItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional().or(z.literal('')),
  retroId: z.string().min(1, 'Please select a retrospective'),
  assignedTo: z.string().optional().or(z.literal('')),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string().optional().or(z.literal('')),
});

type ActionItemFormData = z.infer<typeof actionItemSchema>;

interface CreateActionItemDialogProps {
  teamId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateActionItemDialog({
  teamId,
  open,
  onOpenChange,
  onSuccess,
}: CreateActionItemDialogProps) {
  const createActionItem = useCreateActionItem(teamId);
  const { data: retros = [], isLoading: retrosLoading } = useRetros(teamId);
  const { data: members = [] } = useTeamMembers(teamId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ActionItemFormData>({
    resolver: zodResolver(actionItemSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      priority: 'medium',
      retroId: '',
      assignedTo: 'unassigned',
      title: '',
      description: '',
      dueDate: '',
    },
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      reset({
        priority: 'medium',
        retroId: '',
        assignedTo: 'unassigned',
        title: '',
        description: '',
        dueDate: '',
      });
    }
  }, [open, reset]);

  // Ensure retroId is always a string (not undefined)
  const currentRetroId = watch('retroId');
  useEffect(() => {
    if (currentRetroId === undefined || currentRetroId === null) {
      setValue('retroId', '', { shouldValidate: false });
    }
  }, [currentRetroId, setValue]);

  const onSubmit = async (data: ActionItemFormData) => {
    // Ensure retroId is set (validate manually since Select might not trigger validation)
    const retroId = data.retroId && data.retroId.trim() !== '' ? data.retroId.trim() : '';
    if (!retroId) {
      setValue('retroId', '', { shouldValidate: true });
      return;
    }

    try {
      await createActionItem.mutateAsync({
        title: data.title,
        description: data.description || undefined,
        retroId: retroId,
        assignedTo: data.assignedTo === 'unassigned' ? undefined : data.assignedTo || undefined,
        priority: data.priority,
        dueDate: data.dueDate || undefined,
      });
      reset({
        priority: 'medium',
        retroId: '',
        title: '',
        description: '',
        assignedTo: 'unassigned',
        dueDate: '',
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold">Create Action Item</DialogTitle>
          <DialogDescription className="text-base">
            Create a new action item to track improvements
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative">
          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">Title *</Label>
            <Input
              id="title"
              placeholder="Enter action item title..."
              {...register('title')}
              disabled={createActionItem.isPending}
              className="h-11"
            />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter description..."
              className="min-h-[100px] resize-none"
              {...register('description')}
              disabled={createActionItem.isPending}
            />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Retrospective and Priority Row */}
          <div className="grid grid-cols-2 gap-4 pb-2">
            <div className="space-y-2">
              <Label htmlFor="retroId" className="text-sm font-medium">Retrospective *</Label>
              {retrosLoading ? (
                <div className="h-11 w-full rounded-md border border-input bg-muted animate-pulse" />
              ) : retros.length === 0 ? (
                <div className="space-y-1">
                  <div className="h-11 w-full rounded-md border border-input bg-muted flex items-center px-3 text-sm text-muted-foreground">
                    No retrospectives available
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Create a retrospective first to add action items
                  </p>
                </div>
              ) : (
                <Select
                  value={watch('retroId') && watch('retroId') !== '' ? watch('retroId') : undefined}
                  onValueChange={(value) => {
                    // Always set as string to avoid undefined
                    setValue('retroId', value || '', { shouldValidate: false });
                  }}
                  disabled={createActionItem.isPending || retros.length === 0}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select retrospective" />
                  </SelectTrigger>
                  <SelectContent 
                    position="popper"
                    className="z-[100]"
                    style={{ zIndex: 100 }}
                  >
                    {retros.map((retro) => {
                      const retroIdValue = retro.id || retro._id;
                      return (
                        <SelectItem key={retroIdValue} value={retroIdValue}>
                          {retro.name}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
              {errors.retroId && (
                <p className="text-sm text-destructive mt-1">{errors.retroId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-medium">Priority *</Label>
              <Select
                value={watch('priority') || 'medium'}
                onValueChange={(value: 'low' | 'medium' | 'high') => setValue('priority', value)}
                disabled={createActionItem.isPending}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent 
                  position="popper"
                  className="z-[100]"
                  style={{ zIndex: 100 }}
                >
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assign To and Due Date Row */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="assignedTo" className="text-sm font-medium">Assign To</Label>
              <Select
                value={watch('assignedTo') || 'unassigned'}
                onValueChange={(value) => setValue('assignedTo', value === 'unassigned' ? undefined : value)}
                disabled={createActionItem.isPending}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent 
                  position="popper"
                  className="z-[100]"
                  style={{ zIndex: 100 }}
                >
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.userId} value={member.userId}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate" className="text-sm font-medium">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                {...register('dueDate')}
                disabled={createActionItem.isPending}
                className="h-11"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 gap-3 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createActionItem.isPending}
              className="h-11"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createActionItem.isPending}
              className="h-11 min-w-[140px]"
            >
              {createActionItem.isPending ? 'Creating...' : 'Create Action Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

