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
import { useUpdateActionItem } from '@/hooks/useActionItems';
import { useTeamMembers } from '@/hooks/useTeams';
import type { ActionItem } from '@/types';

const actionItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  status: z.enum(['open', 'in_progress', 'completed', 'cancelled']),
  assignedTo: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string().optional(),
});

type ActionItemFormData = z.infer<typeof actionItemSchema>;

interface EditActionItemDialogProps {
  teamId: string;
  actionItem: ActionItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditActionItemDialog({
  teamId,
  actionItem,
  open,
  onOpenChange,
  onSuccess,
}: EditActionItemDialogProps) {
  const updateActionItem = useUpdateActionItem(teamId);
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
    defaultValues: {
      title: actionItem.title,
      description: actionItem.description || '',
      status: actionItem.status,
      assignedTo: actionItem.assignedTo || 'unassigned',
      priority: actionItem.priority,
      dueDate: actionItem.dueDate ? actionItem.dueDate.split('T')[0] : '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: actionItem.title,
        description: actionItem.description || '',
        status: actionItem.status,
        assignedTo: actionItem.assignedTo || 'unassigned',
        priority: actionItem.priority,
        dueDate: actionItem.dueDate ? actionItem.dueDate.split('T')[0] : '',
      });
    }
  }, [open, actionItem, reset]);

  const onSubmit = async (data: ActionItemFormData) => {
    try {
      await updateActionItem.mutateAsync({
        actionItemId: actionItem._id,
        data: {
          title: data.title,
          description: data.description || undefined,
          status: data.status,
          assignedTo: data.assignedTo || undefined,
          priority: data.priority,
          dueDate: data.dueDate || undefined,
        },
      });
      onSuccess?.();
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>Edit Action Item</DialogTitle>
          <DialogDescription>
            Update action item details
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 relative">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter action item title..."
              {...register('title')}
              disabled={updateActionItem.isPending}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter description..."
              className="min-h-[100px]"
              {...register('description')}
              disabled={updateActionItem.isPending}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={watch('status')}
                onValueChange={(value: 'open' | 'in_progress' | 'completed' | 'cancelled') =>
                  setValue('status', value)
                }
                disabled={updateActionItem.isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent 
                  position="popper"
                  className="z-[100]"
                  style={{ zIndex: 100 }}
                >
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select
                value={watch('priority')}
                onValueChange={(value: 'low' | 'medium' | 'high') => setValue('priority', value)}
                disabled={updateActionItem.isPending}
              >
                <SelectTrigger>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assign To</Label>
              <Select
                value={watch('assignedTo') || 'unassigned'}
                onValueChange={(value) => setValue('assignedTo', value === 'unassigned' ? undefined : value)}
                disabled={updateActionItem.isPending}
              >
                <SelectTrigger>
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
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                {...register('dueDate')}
                disabled={updateActionItem.isPending}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateActionItem.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateActionItem.isPending}>
              {updateActionItem.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

