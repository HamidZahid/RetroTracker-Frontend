import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useUpdateCard } from '@/hooks/useCards';
import type { Card } from '@/types';

const cardSchema = z.object({
  content: z.string().min(1, 'Card content is required').max(1000, 'Card content must be less than 1000 characters'),
});

type CardFormData = z.infer<typeof cardSchema>;

interface EditCardDialogProps {
  retroId: string;
  card: Card;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditCardDialog({
  retroId,
  card,
  open,
  onOpenChange,
  onSuccess,
}: EditCardDialogProps) {
  const updateCard = useUpdateCard(retroId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      content: card.content,
    },
  });

  useEffect(() => {
    if (open) {
      reset({ content: card.content });
    }
  }, [open, card.content, reset]);

  const onSubmit = async (data: CardFormData) => {
    try {
      await updateCard.mutateAsync({
        cardId: card._id,
        data: { content: data.content },
      });
      onSuccess?.();
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Card</DialogTitle>
          <DialogDescription>
            Update your card content
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
              disabled={updateCard.isPending}
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
              disabled={updateCard.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateCard.isPending}>
              {updateCard.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

