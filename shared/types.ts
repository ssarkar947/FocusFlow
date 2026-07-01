export type Priority = 'Urgent + Important' | 'Important' | 'Urgent' | 'Low Priority';

export type ProjectStatus = 'Planning' | 'In Progress' | 'On Hold' | 'Completed' | 'Archived';

export type TaskStatus = 'Todo' | 'In Progress' | 'Completed' | 'Archived';

export interface Goal {
  id: string;
  name: string;
  description: string;
  progress: number; // calculated from project progress
  deadline: string; // ISO date string
  color: string; // Hex or Tailwind color class
  icon: string; // Icon identifier
  createdAt: string;
}

export interface Project {
  id: string;
  goalId: string; // Parent Goal ID
  name: string;
  description: string;
  progress: number; // calculated from task completion & weights
  deadline: string; // ISO date string
  priority: Priority;
  status: ProjectStatus;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string; // Parent Project ID
  name: string;
  description: string;
  deadline: string; // ISO date string
  estimatedTime: number; // in minutes
  actualTime: number; // in minutes
  impact: 'High' | 'Medium' | 'Low';
  priority: Priority; // calculated or overridden
  status: TaskStatus;
  weight: number; // percentage of project progress (e.g. 10 to 100)
  tags: string[];
  notes: string;
  isRecurring: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly';
  createdAt: string;
  completedAt?: string;
  isBigThree: boolean; // Today's Big 3
  isSavedLink?: boolean; // If created from browser extension context menu
  linkUrl?: string; // URL saved from extension
}

export interface FocusSession {
  id: string;
  taskId: string;
  startTime: string; // ISO timestamp
  endTime?: string; // ISO timestamp
  duration: number; // actual focus duration in seconds
  breaks: { start: string; end?: string }[];
  interruptionsCount: number;
  completed: boolean;
}

export interface DailyReview {
  date: string; // YYYY-MM-DD
  wentWell: string;
  blocked: string;
  biggestWin: string;
  lessonsLearned: string;
  mood: number; // 1 to 5
  energy: number; // 1 to 5
  completionScore: number; // 0 to 100 (automated task completion percentage)
  summary?: string; // AI generated summary placeholder
}

export interface WeeklyReview {
  weekStart: string; // YYYY-MM-DD (usually Sunday)
  projectsCompleted: string[]; // Project IDs
  focusHours: number;
  topAchievement: string;
  biggestBottleneck: string;
  nextWeekPlan: string;
  completionScore: number;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'warm';
  accentColor: string; // e.g. '#FF6B6B' or 'rose'
  defaultFocusDuration: number; // in minutes (25, 45, 60, etc.)
  workingHours: {
    start: string; // HH:MM
    end: string; // HH:MM
  };
  weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
  notificationsEnabled: boolean;
  firebaseConfig?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
}

export interface SyncQueueItem {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  collection: 'goals' | 'projects' | 'tasks' | 'focusSessions' | 'dailyReviews' | 'weeklyReviews';
  data: any;
  timestamp: string;
}

export interface AppState {
  goals: Goal[];
  projects: Project[];
  tasks: Task[];
  sessions: FocusSession[];
  dailyReviews: DailyReview[];
  weeklyReviews: WeeklyReview[];
  settings: UserSettings;
  syncQueue: SyncQueueItem[];
}
