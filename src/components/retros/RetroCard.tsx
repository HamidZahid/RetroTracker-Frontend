import { Calendar, Users, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Retro } from '@/types';
import { formatDate, formatRelativeTime } from '@/lib/utils';

interface RetroCardProps {
  retro: Retro;
}

export function RetroCard({ retro }: RetroCardProps) {
  const navigate = useNavigate();

  const totalCards = (retro.cardCount?.wentWell || 0) +
                     (retro.cardCount?.needsImprovement || 0) +
                     (retro.cardCount?.kudos || 0);

  return (
    <Card
      className="group cursor-pointer hover-lift border-2 hover:border-[hsl(var(--primary))] relative overflow-hidden"
      onClick={() => navigate(`/retros/${retro.id}`)}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300" />

      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-2 flex-1">
            <CardTitle className="text-xl font-bold group-hover:bg-gradient-to-r group-hover:from-[hsl(var(--gradient-start))] group-hover:to-[hsl(var(--gradient-end))] group-hover:bg-clip-text group-hover:text-transparent transition-all">
              {retro.name}
            </CardTitle>
            {retro.sprintNumber && (
              <Badge className="gradient-info text-white border-0 shadow-sm">
                Sprint {retro.sprintNumber}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Date Range */}
        {(retro.startDate || retro.endDate) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {retro.startDate && formatDate(retro.startDate)}
              {retro.startDate && retro.endDate && ' - '}
              {retro.endDate && formatDate(retro.endDate)}
            </span>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span className="font-medium">{totalCards}</span>
            <span>cards</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{retro.createdBy.name}</span>
          </div>
        </div>

        {/* Card Counts */}
        {retro.cardCount && (
          <div className="flex gap-3 pt-3 border-t border-border/50">
            <div className="flex-1 rounded-xl gradient-success px-3 py-3 text-center text-white shadow-md group-hover:shadow-lg transition-shadow">
              <div className="text-2xl font-bold">
                {retro.cardCount.wentWell}
              </div>
              <div className="text-xs font-medium opacity-90 mt-1">
                Well
              </div>
            </div>
            <div className="flex-1 rounded-xl gradient-warning px-3 py-3 text-center text-white shadow-md group-hover:shadow-lg transition-shadow">
              <div className="text-2xl font-bold">
                {retro.cardCount.needsImprovement}
              </div>
              <div className="text-xs font-medium opacity-90 mt-1">
                Improve
              </div>
            </div>
            <div className="flex-1 rounded-xl gradient-info px-3 py-3 text-center text-white shadow-md group-hover:shadow-lg transition-shadow">
              <div className="text-2xl font-bold">
                {retro.cardCount.kudos}
              </div>
              <div className="text-xs font-medium opacity-90 mt-1">
                Kudos
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-xs text-muted-foreground pt-2 border-t border-border/50">
          Created {formatRelativeTime(retro.createdAt)}
        </div>
      </CardContent>
    </Card>
  );
}
