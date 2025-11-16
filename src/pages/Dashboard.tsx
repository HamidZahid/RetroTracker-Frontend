import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, FolderKanban, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TeamSwitcher } from '@/components/teams/TeamSwitcher';
import { CreateTeamDialog } from '@/components/teams/CreateTeamDialog';
import { useTeams } from '@/hooks/useTeams';

export function DashboardPage() {
  const navigate = useNavigate();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const { data: teams = [], isLoading } = useTeams();

  // Auto-select first team
  if (!selectedTeamId && teams.length > 0 && !isLoading) {
    setSelectedTeamId(teams[0].id);
  }

  return (
    <div className="space-y-8 w-full">
      {/* Header with gradient accent */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 gradient-primary text-white shadow-xl w-full">
        <div className="absolute inset-0 bg-black/5" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Dashboard</h1>
          </div>
          <p className="text-white/90 text-sm sm:text-base">
            Manage your teams and retrospectives
          </p>
        </div>
        {/* Decorative blur elements */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
      </div>

      {/* Team Selector and Quick Actions Container */}
      <div className="flex flex-col lg:flex-row lg:items-start gap-8">
        {/* Team Selector */}
        <div className="w-full max-w-xs flex-shrink-0">
          <TeamSwitcher
            selectedTeamId={selectedTeamId}
            onTeamSelect={setSelectedTeamId}
            onCreateTeam={() => setIsCreateTeamOpen(true)}
          />
        </div>

        {/* Quick Actions - Only show when team is selected */}
        {selectedTeamId && (
          <div className="flex-1 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover-lift cursor-pointer border-2 hover:border-[hsl(var(--info-start))] group relative overflow-hidden"
                onClick={() => navigate(`/teams/${selectedTeamId}/retros`)}>
            <div className="absolute inset-0 gradient-info opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle>
                Retrospectives
              </CardTitle>
              <div className="h-12 w-12 rounded-lg gradient-info flex items-center justify-center shadow-md">
                <FolderKanban className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                View and manage team retrospectives
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift cursor-pointer border-2 hover:border-[hsl(var(--success-start))] group relative overflow-hidden"
                onClick={() => navigate(`/teams/${selectedTeamId}/action-items`)}>
            <div className="absolute inset-0 gradient-success opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle>
                Action Items
              </CardTitle>
              <div className="h-12 w-12 rounded-lg gradient-success flex items-center justify-center shadow-md">
                <Plus className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Track action items and follow-ups
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift cursor-pointer border-2 hover:border-[hsl(var(--warning-start))] group relative overflow-hidden"
                onClick={() => navigate(`/teams/${selectedTeamId}/members`)}>
            <div className="absolute inset-0 gradient-warning opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle>
                Team Members
              </CardTitle>
              <div className="h-12 w-12 rounded-lg gradient-warning flex items-center justify-center shadow-md">
                <Users className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Manage team members and roles
              </p>
            </CardContent>
          </Card>
          </div>
        )}
      </div>

      {/* Empty State - Only show when no teams */}
      {teams.length === 0 && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Retro Tracker</CardTitle>
            <CardDescription>
              Get started by creating your first team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsCreateTeamOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Team
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Team Dialog */}
      <CreateTeamDialog
        open={isCreateTeamOpen}
        onOpenChange={setIsCreateTeamOpen}
        onSuccess={() => {
          // Team will be auto-selected after creation
        }}
      />
    </div>
  );
}
