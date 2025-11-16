import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCreateCard } from '@/hooks/useCards';
import type { CardType } from '@/types';

const cardSchema = z.object({
  content: z.string().min(1, 'Card content is required').max(1000, 'Card content must be less than 1000 characters'),
});

type CardFormData = z.infer<typeof cardSchema>;

interface CreateCardDialogProps {
  retroId: string;
  columnType: CardType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateCardDialog({
  retroId,
  columnType,
  open,
  onOpenChange,
  onSuccess,
}: CreateCardDialogProps) {
  const createCard = useCreateCard(retroId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
  });

  const onSubmit = async (data: CardFormData) => {
    try {
      await createCard.mutateAsync({
        type: columnType,
        content: data.content,
      });
      reset();
      onSuccess?.();
    } catch (error) {
      // Error handled by hook
    }
  };

  const columnTitles: Record<CardType, string> = {
    went_well: 'Went Well',
    needs_improvement: 'Needs Improvement',
    kudos: 'Kudos',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Card to {columnTitles[columnType]}</DialogTitle>
          <DialogDescription>
            Share your feedback for this retrospective
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">Card Content</Label>
            <Textarea
              id="content"
              placeholder="Enter your feedback..."
              className="min-h-[120px]"
              {...register('content')}
              disabled={createCard.isPending}
            />
            {errors.content && (
              <p className="text-sm text-destructive">{errors.content.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createCard.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createCard.isPending}>
              {createCard.isPending ? 'Adding...' : 'Add Card'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

