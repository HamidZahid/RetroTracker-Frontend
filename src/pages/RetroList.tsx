import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Search, Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { RetroCard } from '@/components/retros/RetroCard';
import { CreateRetroDialog } from '@/components/retros/CreateRetroDialog';
import { useRetros } from '@/hooks/useRetros';
import { debounce } from '@/lib/utils';
import type { RetroFilters } from '@/types';

export function RetroListPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const filters: RetroFilters = {
    search: search || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  };

  const { data: retros = [], isLoading } = useRetros(teamId, filters);

  const debouncedSearch = debounce((value: string) => setSearch(value), 300);

  const clearFilters = () => {
    setSearch('');
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters = search || startDate || endDate;

  return (
    <div className="space-y-8 w-full">
      {/* Header with gradient */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 gradient-info text-white shadow-xl w-full">
        <div className="absolute inset-0 bg-black/5" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Retrospectives</h1>
            <p className="text-white/90 mt-1 text-sm sm:text-base">
              Review past sprints and track improvements
            </p>
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            size="lg"
            className="!bg-white !text-[hsl(212,100%,48%)] hover:!bg-white/90 shadow-xl hover:shadow-2xl w-full sm:w-auto border-2 border-white/30 font-bold"
          >
            <Plus className="mr-2 h-5 w-5" />
            New Retrospective
          </Button>
        </div>
        {/* Decorative blur elements */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
      </div>

      {/* Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search retrospectives..."
            className="pl-11"
            value={search}
            onChange={(e) => debouncedSearch(e.target.value)}
          />
        </div>

        {/* Date Range Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-sm font-medium">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full sm:w-auto"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate" className="text-sm font-medium">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full sm:w-auto"
              min={startDate || undefined}
            />
          </div>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="h-10"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Retro Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[280px] rounded-2xl" />
          ))}
        </div>
      ) : retros.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="rounded-2xl gradient-info/10 p-10 mb-6">
            <Calendar className="h-16 w-16 text-[hsl(var(--info-start))]" />
          </div>
          <h3 className="text-2xl font-bold mb-3">No retrospectives yet</h3>
          <p className="text-muted-foreground max-w-lg mb-8">
            {hasActiveFilters 
              ? 'No results found. Try adjusting your filters.' 
              : 'Create your first retrospective to get started'}
          </p>
          {!hasActiveFilters && (
            <Button onClick={() => setIsCreateOpen(true)} size="lg" className="gradient-primary text-white shadow-lg">
              <Plus className="mr-2 h-5 w-5" />
              Create Retrospective
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {retros.map((retro) => (
            <RetroCard key={retro.id} retro={retro} />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <CreateRetroDialog
        teamId={teamId!}
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </div>
  );
}
