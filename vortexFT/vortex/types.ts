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
  position?: number;
  tags: Tag[];
  // IDs de WorkspaceMember asignados a la tarea.
  assignees?: string[];
  dueDate?: string;
  description?: string;
}

export interface Column {
  id: string; 
  title: string;
  keyword: string; 
  color: string;   
  position?: number;
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

export interface WorkspaceMember {
  id: string;
  name: string;
  username?: string;
  email?: string;
  avatarUrl: string;
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

export type NotificationPriority = 'critical' | 'important' | 'info';

export type NotificationAction =
  | 'open_card'
  | 'dismiss'
  | 'assign_me'
  | 'start_now'
  | 'mark_done'
  | 'snooze_24h';

export interface AppNotification {
  id: string;
  type: string;
  priority: NotificationPriority | string;
  title: string;
  message: string;
  reason?: string;
  workspaceId?: string | null;
  cardId?: string | null;
  actorLogin?: string | null;
  actorName?: string | null;
  actorAvatar?: string | null;
  read: boolean;
  resolved: boolean;
  snoozedUntil?: string | null;
  createdAt: string;
  suggestedActions: NotificationAction[];
}
