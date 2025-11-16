import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, CheckCircle2, Circle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useActionItems } from '@/hooks/useActionItems';
import { useRetros } from '@/hooks/useRetros';
import { CreateActionItemDialog } from '@/components/actionItems/CreateActionItemDialog';
import { EditActionItemDialog } from '@/components/actionItems/EditActionItemDialog';
import type { ActionItem } from '@/types';
import { formatDate } from '@/lib/utils';
import { debounce } from '@/lib/utils';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

const STATUS_ICONS = {
  open: Circle,
  in_progress: Clock,
  completed: CheckCircle2,
  cancelled: XCircle,
};

const STATUS_COLORS = {
  open: 'bg-blue-500',
  in_progress: 'bg-yellow-500',
  completed: 'bg-green-500',
  cancelled: 'bg-red-500',
};

const PRIORITY_COLORS = {
  low: 'bg-gray-500',
  medium: 'bg-yellow-500',
  high: 'bg-red-500',
};

export function ActionItemsPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ActionItem | null>(null);
  const [filters, setFilters] = useState<{
    status?: string;
    retroId?: string;
    search?: string;
  }>({});
  const [search, setSearch] = useState('');

  const { data: retros = [], isLoading: retrosLoading } = useRetros(teamId);
  const { data: actionItems = [], isLoading: actionItemsLoading } = useActionItems(teamId, {
    status: filters.status as any,
    retroId: filters.retroId,
    search: search || undefined,
  });

  const isLoading = retrosLoading || actionItemsLoading;

  const debouncedSearch = debounce((value: string) => setSearch(value), 300);

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 gradient-success text-white shadow-xl w-full">
        <div className="absolute inset-0 bg-black/5" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Action Items</h1>
            <p className="text-white/90 mt-1 text-sm sm:text-base">
              Track and manage action items from retrospectives
            </p>
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            size="lg"
            className="!bg-white !text-[hsl(158,85%,38%)] hover:!bg-white/90 shadow-xl hover:shadow-2xl w-full sm:w-auto border-2 border-white/30 font-bold"
          >
            <Plus className="mr-2 h-5 w-5" />
            New Action Item
          </Button>
        </div>
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search action items..."
            className="pl-11"
            onChange={(e) => debouncedSearch(e.target.value)}
          />
        </div>
        <Select
          value={filters.status || 'all'}
          onValueChange={(value) => setFilters({ ...filters, status: value === 'all' ? undefined : value })}
        >
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.retroId || 'all'}
          onValueChange={(value) => setFilters({ ...filters, retroId: value === 'all' ? undefined : value })}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Retros" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Retros</SelectItem>
            {retros.map((retro) => (
              <SelectItem key={retro.id} value={retro._id}>
                {retro.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Action Items Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[200px] rounded-xl" />
          ))}
        </div>
      ) : actionItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <CheckCircle2 className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold mb-2">No action items</h3>
            <p className="text-muted-foreground mb-6">
              {search || filters.status || filters.retroId
                ? 'No action items match your filters'
                : 'Create your first action item to get started'}
            </p>
            {!search && !filters.status && !filters.retroId && (
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Action Item
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {actionItems.map((item) => {
            const StatusIcon = STATUS_ICONS[item.status];

            return (
              <Card
                key={item._id}
                className="hover-lift cursor-pointer border-2"
                onClick={() => setEditingItem(item)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg flex-1">{item.title}</CardTitle>
                    <div className={`w-3 h-3 rounded-full ${STATUS_COLORS[item.status]}`} />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className={PRIORITY_COLORS[item.priority] + ' text-white border-0'}>
                      {item.priority}
                    </Badge>
                    <Badge variant="outline">
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {item.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {item.description}
                    </p>
                  )}
                  {item.assignedToName && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Assigned to: </span>
                      <span className="font-medium">{item.assignedToName}</span>
                    </div>
                  )}
                  {item.dueDate && (
                    <div className="text-sm text-muted-foreground">
                      Due: {formatDate(item.dueDate)}
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      const retro = retros.find((r) => r._id === item.retroId);
                      if (retro) {
                        navigate(`/retros/${retro.id}`);
                      }
                    }}
                  >
                    View Retro
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      {isCreateOpen && teamId && (
        <CreateActionItemDialog
          teamId={teamId}
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          onSuccess={() => setIsCreateOpen(false)}
        />
      )}

      {/* Edit Dialog */}
      {editingItem && teamId && (
        <EditActionItemDialog
          teamId={teamId}
          actionItem={editingItem}
          open={!!editingItem}
          onOpenChange={(open) => {
            if (!open) {
              setEditingItem(null);
            }
          }}
          onSuccess={() => setEditingItem(null)}
        />
      )}
    </div>
  );
}

