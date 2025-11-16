// Base API Response
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// User Types
export interface User {
  _id: string;
  name: string;
  email: string;
  avatarInitials?: string;
  createdAt: string;
  updatedAt: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Team Types
export interface Team {
  _id: string;
  id: string; // Alias for _id for easier use
  name: string;
  description?: string;
  createdBy: string;
  members: TeamMember[];
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  userId: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  joinedAt: string;
}

export interface CreateTeamData {
  name: string;
  description?: string;
}

export interface InviteMemberData {
  email: string;
  role?: 'admin' | 'member';
}

// Retrospective Types
export type RetroStatus = 'active' | 'completed' | 'archived';

export interface Retrospective {
  _id: string;
  id: string; // Alias for _id
  name: string;
  teamId: string;
  status: RetroStatus;
  sprintNumber?: number;
  startDate?: string;
  endDate?: string;
  createdBy: {
    _id: string;
    name: string;
  };
  cardCount?: {
    wentWell: number;
    needsImprovement: number;
    kudos: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Alias for easier use
export type Retro = Retrospective;

export interface CreateRetroData {
  name: string;
  sprintNumber?: number;
  startDate?: string;
  endDate?: string;
}

export interface RetroFilters {
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
  };
}

// Card Types
export type CardType = 'went_well' | 'needs_improvement' | 'kudos';

export interface Card {
  _id: string;
  id: string; // Alias for _id
  retroId: string;
  type: CardType;
  content: string;
  author: string;
  authorName: string;
  votes: string[];
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCardData {
  type: CardType;
  content: string;
}

export interface UpdateCardData {
  content?: string;
  votes?: string[];
}

// Action Item Types
export type ActionItemStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';
export type ActionItemPriority = 'low' | 'medium' | 'high';

export interface ActionItem {
  _id: string;
  retroId: string;
  teamId: string;
  title: string;
  description?: string;
  assignedTo?: string;
  assignedToName?: string;
  status: ActionItemStatus;
  priority: ActionItemPriority;
  dueDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
