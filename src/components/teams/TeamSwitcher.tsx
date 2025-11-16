import { Check, ChevronsUpDown, PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useTeams } from '@/hooks/useTeams';

interface TeamSwitcherProps {
  selectedTeamId: string | null;
  onTeamSelect: (teamId: string) => void;
  onCreateTeam: () => void;
}

export function TeamSwitcher({ selectedTeamId, onTeamSelect, onCreateTeam }: TeamSwitcherProps) {
  const [open, setOpen] = useState(false);
  const { data: teams = [] } = useTeams();

  const selectedTeam = teams.find((team) => team.id === selectedTeamId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select a team"
          className="w-full justify-between"
        >
          {selectedTeam ? selectedTeam.name : 'Select team...'}
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[300px] p-0" 
        align="start"
        side="bottom"
        sideOffset={8}
        style={{ zIndex: 9999, position: 'fixed' }}
      >
        <Command>
          <CommandInput placeholder="Search teams..." />
          <CommandList>
            <CommandEmpty>No teams found.</CommandEmpty>
            <CommandGroup heading="Your Teams">
              {teams.map((team) => (
                <CommandItem
                  key={team.id}
                  onSelect={() => {
                    onTeamSelect(team.id);
                    setOpen(false);
                  }}
                  className="text-sm"
                >
                  {team.name}
                  <Check
                    className={cn(
                      'ml-auto h-4 w-4',
                      selectedTeamId === team.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          <CommandSeparator />
          <CommandList>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  onCreateTeam();
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Team
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
