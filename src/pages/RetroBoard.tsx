import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, ThumbsUp, CheckSquare2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useRetro } from '@/hooks/useRetros';
import { useCards, useCreateCard, useUpdateCard, useDeleteCard } from '@/hooks/useCards';
import { useAuth } from '@/contexts/AuthContext';
import { CreateCardDialog } from '@/components/cards/CreateCardDialog';
import { EditCardDialog } from '@/components/cards/EditCardDialog';
import { ConvertToActionItemDialog } from '@/components/cards/ConvertToActionItemDialog';
import type { Card as CardType, CardType as CardTypeEnum } from '@/types';
import { formatRelativeTime } from '@/lib/utils';

const COLUMN_TYPES: { type: CardTypeEnum; title: string; color: string; gradient: string }[] = [
  {
    type: 'went_well',
    title: 'Went Well',
    color: 'hsl(var(--success-start))',
    gradient: 'gradient-success',
  },
  {
    type: 'needs_improvement',
    title: 'Needs Improvement',
    color: 'hsl(var(--warning-start))',
    gradient: 'gradient-warning',
  },
  {
    type: 'kudos',
    title: 'Kudos',
    color: 'hsl(var(--info-start))',
    gradient: 'gradient-info',
  },
];

export function RetroBoardPage() {
  const { retroId } = useParams<{ retroId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [createCardColumn, setCreateCardColumn] = useState<CardTypeEnum | null>(null);
  const [editingCard, setEditingCard] = useState<CardType | null>(null);
  const [convertingCard, setConvertingCard] = useState<CardType | null>(null);
  const [showDeletedCards, setShowDeletedCards] = useState(false);

  const { data: retro, isLoading: retroLoading } = useRetro(retroId);
  const { data: cards = [], isLoading: cardsLoading } = useCards(retroId);
  const createCard = useCreateCard(retroId!);
  const updateCard = useUpdateCard(retroId!);
  const deleteCard = useDeleteCard(retroId!);

  const filteredCards = showDeletedCards 
    ? cards 
    : cards.filter((card) => !card.isDeleted);
  const getCardsByType = (type: CardTypeEnum) =>
    filteredCards.filter((card) => card.type === type);

  const handleDeleteCard = async (cardId: string) => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      await deleteCard.mutateAsync(cardId);
    }
  };

  const handleVote = async (card: CardType) => {
    if (!user) return;
    const isVoted = card.votes.includes(user._id);
    const newVotes = isVoted
      ? card.votes.filter((id) => id !== user._id)
      : [...card.votes, user._id];

    await updateCard.mutateAsync({
      cardId: card._id,
      data: { votes: newVotes },
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (retroLoading || cardsLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-6 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-[600px]" />
          ))}
        </div>
      </div>
    );
  }

  if (!retro) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-2">Retrospective not found</h2>
        <Button onClick={() => navigate(-1)} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold break-words">{retro.name}</h1>
            {retro.sprintNumber && (
              <Badge className="mt-2 gradient-info text-white border-0">
                Sprint {retro.sprintNumber}
              </Badge>
            )}
          </div>
        </div>
        {/* Show Deleted Cards Toggle */}
        <div className="flex items-center gap-2 px-2">
          <Switch
            id="show-deleted"
            checked={showDeletedCards}
            onCheckedChange={setShowDeletedCards}
          />
          <Label htmlFor="show-deleted" className="text-sm font-normal cursor-pointer flex items-center gap-2">
            {showDeletedCards ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            Show deleted cards
          </Label>
        </div>
      </div>

      {/* Three Columns */}
      <div className="grid gap-6 lg:grid-cols-3">
        {COLUMN_TYPES.map((column) => {
          const columnCards = getCardsByType(column.type);
          const isCreating = createCardColumn === column.type;

          return (
            <div key={column.type} className="flex flex-col h-full">
              {/* Column Header */}
              <div className={`rounded-t-xl p-4 ${column.gradient} text-white shadow-md mb-4`}>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">{column.title}</h2>
                  <Badge className="bg-white/20 text-white border-0">
                    {columnCards.length}
                  </Badge>
                </div>
              </div>

              {/* Column Content */}
              <Card className="flex-1 rounded-t-none border-t-0 flex flex-col min-h-[400px]">
                <CardContent className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[600px]">
                  {columnCards.length === 0 && !isCreating ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">No cards yet</p>
                    </div>
                  ) : (
                    columnCards.map((card) => {
                      const isAuthor = card.author === user?._id;
                      const isVoted = card.votes.includes(user?._id || '');

                      return (
                        <Card
                          key={card._id}
                          className="border-2 hover:border-primary/50 transition-all group"
                        >
                          <CardContent className="p-4 space-y-3">
                            {/* Card Header */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2 flex-1">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="text-xs gradient-primary text-white">
                                    {getInitials(card.authorName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {card.authorName}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatRelativeTime(card.createdAt)}
                                  </p>
                                </div>
                              </div>
                              {isAuthor && (
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => setEditingCard(card)}
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive"
                                    onClick={() => handleDeleteCard(card._id)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              )}
                            </div>

                            {/* Card Content */}
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {card.content}
                            </p>

                            {/* Card Footer - Votes and Actions */}
                            <div className="flex items-center justify-between gap-2 pt-2 border-t">
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`h-7 px-2 ${
                                  isVoted ? 'text-primary' : 'text-muted-foreground'
                                }`}
                                onClick={() => handleVote(card)}
                              >
                                <ThumbsUp className={`h-3.5 w-3.5 mr-1 ${isVoted ? 'fill-current' : ''}`} />
                                <span className="text-xs">{card.votes.length}</span>
                              </Button>
                              {/* Convert to Action Item button - only for Needs Improvement cards */}
                              {column.type === 'needs_improvement' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 px-2 text-xs"
                                  onClick={() => setConvertingCard(card)}
                                >
                                  <CheckSquare2 className="h-3.5 w-3.5 mr-1" />
                                  Convert to Action Item
                                </Button>
                              )}
                              {/* Deleted indicator */}
                              {card.isDeleted && (
                                <Badge variant="secondary" className="text-xs">
                                  Deleted
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </CardContent>

                {/* Add Card Button */}
                <div className="p-4 border-t">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setCreateCardColumn(column.type)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Card
                  </Button>
                </div>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Create Card Dialog */}
      {createCardColumn && (
        <CreateCardDialog
          retroId={retroId!}
          columnType={createCardColumn}
          open={!!createCardColumn}
          onOpenChange={(open) => !open && setCreateCardColumn(null)}
          onSuccess={() => setCreateCardColumn(null)}
        />
      )}

      {/* Edit Card Dialog */}
      {editingCard && (
        <EditCardDialog
          retroId={retroId!}
          card={editingCard}
          open={!!editingCard}
          onOpenChange={(open) => !open && setEditingCard(null)}
          onSuccess={() => setEditingCard(null)}
        />
      )}

      {/* Convert to Action Item Dialog */}
      {convertingCard && retro && (
        <ConvertToActionItemDialog
          teamId={retro.teamId}
          retroId={retroId!}
          card={convertingCard}
          open={!!convertingCard}
          onOpenChange={(open) => !open && setConvertingCard(null)}
          onSuccess={() => setConvertingCard(null)}
        />
      )}
    </div>
  );
}

