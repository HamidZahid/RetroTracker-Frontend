// Query key factory for consistent cache management
export const queryKeys = {
  teams: {
    all: ['teams'] as const,
    detail: (id: string) => ['teams', id] as const,
    members: (teamId: string) => ['teams', teamId, 'members'] as const,
  },
  retros: {
    all: (teamId: string) => ['retros', teamId] as const,
    filtered: (teamId: string, filters: Record<string, any>) => ['retros', teamId, filters] as const,
    detail: (id: string) => ['retros', id] as const,
    cards: (retroId: string) => ['retros', retroId, 'cards'] as const,
  },
  actionItems: {
    all: (teamId: string) => ['actionItems', teamId] as const,
    detail: (id: string) => ['actionItems', id] as const,
  },
} as const;
