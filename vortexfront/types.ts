export enum Status {
  Todo = 'To Do',
  InProgress = 'In Progress',
  InReview = 'In Review',
  Done = 'Done',
}

export interface Tag {
  label: string;
  color: string;
  icon?: string;
  iconColor?: string;
}

export interface Card {
  id: string;
  number: number;
  title: string;
  tags: Tag[];
  assignees?: string[];
  dueDate?: string;
  description?: string;
}

export interface WorkspaceMember {
  id: string;
  name?: string;
  username?: string;
  email?: string;
  avatarUrl?: string;
}

export interface Column {
  id: string; 
  title: string;
  keyword: string; 
  color: string;   
  isDoneColumn?: boolean;
  cards: Card[];
}

export interface Space {
  id: string;
  name: string;
  icon: string;
  repoUrl?: string;
  defaultBranch?: string;
  columns?: Column[];
  members?: WorkspaceMember[];
}

export interface FilterState {
  tags: string[];
  statuses: string[];
  assignees: string[];
}

export interface ChangeLogEntry {
  id: string;
  type: 'manual' | 'automatic';
  description: string;
  user: {
    name: string;
    avatar: string;
  };
  timestamp: string;
  details?: string;
  cardId?: string;
}

export interface AppNotification {
  id: string;
  type: string;
  priority: 'critical' | 'important' | 'info' | string;
  title: string;
  message: string;
  reason?: string | null;
  workspaceId?: string | null;
  cardId?: string | null;
  actorLogin?: string | null;
  actorName?: string | null;
  actorAvatar?: string | null;
  read: boolean;
  resolved: boolean;
  snoozedUntil?: string | null;
  createdAt?: string | null;
  suggestedActions: string[];
}
