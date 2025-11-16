import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, UserMinus, Mail, Shield, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useTeam, useTeamMembers, useInviteMember, useRemoveMember } from '@/hooks/useTeams';
import { useAuth } from '@/contexts/AuthContext';
import { InviteMemberDialog } from '@/components/teams/InviteMemberDialog';
import { formatRelativeTime } from '@/lib/utils';

export function TeamMembersPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const { data: team, isLoading: teamLoading } = useTeam(teamId);
  const { data: members = [], isLoading: membersLoading } = useTeamMembers(teamId);
  const inviteMember = useInviteMember(teamId!);
  const removeMember = useRemoveMember(teamId!);

  const isOwner = team?.members.find((m) => m.userId === user?._id)?.role === 'admin';

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (window.confirm(`Are you sure you want to remove ${memberName} from the team?`)) {
      await removeMember.mutateAsync(memberId);
    }
  };

  if (teamLoading || membersLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[200px] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-2">Team not found</h2>
        <Button onClick={() => navigate(-1)} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">{team.name}</h1>
          {team.description && (
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">{team.description}</p>
          )}
        </div>
        {isOwner && (
          <Button onClick={() => setIsInviteOpen(true)} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        )}
      </div>

      {/* Members Grid */}
      {members.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <User className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold mb-2">No members yet</h3>
            <p className="text-muted-foreground mb-6">
              {isOwner
                ? 'Invite team members to get started'
                : 'This team has no members'}
            </p>
            {isOwner && (
              <Button onClick={() => setIsInviteOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => {
            const isCurrentUser = member.userId === user?._id;
            const canRemove = isOwner && !isCurrentUser;

            return (
              <Card key={member.userId} className="hover-lift">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="gradient-primary text-white">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{member.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={member.role === 'admin' ? 'default' : 'outline'}
                            className={member.role === 'admin' ? 'gradient-primary text-white border-0' : ''}
                          >
                            {member.role === 'admin' ? (
                              <>
                                <Shield className="h-3 w-3 mr-1" />
                                Owner
                              </>
                            ) : (
                              <>
                                <User className="h-3 w-3 mr-1" />
                                Member
                              </>
                            )}
                          </Badge>
                          {isCurrentUser && (
                            <Badge variant="outline">You</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Joined {formatRelativeTime(member.joinedAt)}
                  </div>
                  {canRemove && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-destructive hover:text-destructive"
                      onClick={() => handleRemoveMember(member.userId, member.name)}
                      disabled={removeMember.isPending}
                    >
                      <UserMinus className="mr-2 h-4 w-4" />
                      Remove Member
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Invite Dialog */}
      {teamId && (
        <InviteMemberDialog
          teamId={teamId}
          open={isInviteOpen}
          onOpenChange={setIsInviteOpen}
          onSuccess={() => setIsInviteOpen(false)}
        />
      )}
    </div>
  );
}

