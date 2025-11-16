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
import { useTeamMembers } from '@/hooks/useTeams';
import type { Card } from '@/types';

const actionItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional().or(z.literal('')),
  assignedTo: z.string().optional().or(z.literal('')),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string().optional().or(z.literal('')),
});

type ActionItemFormData = z.infer<typeof actionItemSchema>;

interface ConvertToActionItemDialogProps {
  teamId: string;
  retroId: string;
  card: Card;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ConvertToActionItemDialog({
  teamId,
  retroId,
  card,
  open,
  onOpenChange,
  onSuccess,
}: ConvertToActionItemDialogProps) {
  const createActionItem = useCreateActionItem(teamId);
  const { data: members = [] } = useTeamMembers(teamId);

  // Generate title from card content (first 50 chars or less)
  const defaultTitle = card.content.length > 50 
    ? card.content.substring(0, 50).trim() + '...' 
    : card.content.trim();

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
      assignedTo: 'unassigned',
      title: defaultTitle,
      description: card.content,
      dueDate: '',
    },
  });

  // Reset form when dialog opens or card changes
  useEffect(() => {
    if (open && card) {
      const newDefaultTitle = card.content.length > 50 
        ? card.content.substring(0, 50).trim() + '...' 
        : card.content.trim();
      
      reset({
        priority: 'medium',
        assignedTo: 'unassigned',
        title: newDefaultTitle,
        description: card.content,
        dueDate: '',
      });
    }
  }, [open, card, reset]);

  const onSubmit = async (data: ActionItemFormData) => {
    try {
      await createActionItem.mutateAsync({
        title: data.title,
        description: data.description || undefined,
        retroId: retroId, // Use the card's retro
        assignedTo: data.assignedTo === 'unassigned' ? undefined : data.assignedTo || undefined,
        priority: data.priority,
        dueDate: data.dueDate || undefined,
      });
      reset({
        priority: 'medium',
        assignedTo: 'unassigned',
        title: defaultTitle,
        description: card.content,
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
          <DialogTitle className="text-2xl font-bold">Convert to Action Item</DialogTitle>
          <DialogDescription className="text-base">
            Create an action item from this &quot;Needs Improvement&quot; card
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative">
          {/* Original Card Content Preview */}
          <div className="p-3 bg-muted rounded-lg border border-border">
            <Label className="text-xs text-muted-foreground mb-1 block">From card:</Label>
            <p className="text-sm text-muted-foreground italic line-clamp-2">{card.content}</p>
          </div>

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

          {/* Priority and Assign To Row */}
          <div className="grid grid-cols-2 gap-4 pb-2">
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
          </div>

          {/* Due Date */}
          <div className="space-y-2 pt-2">
            <Label htmlFor="dueDate" className="text-sm font-medium">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              {...register('dueDate')}
              disabled={createActionItem.isPending}
              className="h-11"
            />
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

