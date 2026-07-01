import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, Goal, Project, Task, FocusSession, DailyReview, WeeklyReview, UserSettings, TaskStatus } from '../../../shared/types';
import { calculatePriority, calculateProjectProgress, calculateGoalProgress } from '../../../shared/helpers';

interface StoreActions {
  // Goal actions
  addGoal: (goal: Omit<Goal, 'id' | 'progress' | 'createdAt'>) => void;
  updateGoal: (id: string, goal: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  // Project actions
  addProject: (project: Omit<Project, 'id' | 'progress' | 'createdAt'>) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Task actions
  addTask: (task: Omit<Task, 'id' | 'priority' | 'status' | 'createdAt' | 'isBigThree' | 'actualTime'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  toggleTaskCompletion: (id: string) => void;
  deleteTask: (id: string) => void;
  duplicateTask: (id: string) => void;
  setBigThree: (taskIds: string[]) => void;

  // Focus Session actions
  startFocusSession: (taskId: string) => void;
  pauseFocusSession: () => void;
  resumeFocusSession: () => void;
  endFocusSession: (completed: boolean) => void;
  incrementInterruption: () => void;

  // Review actions
  saveDailyReview: (review: Omit<DailyReview, 'completionScore'>) => void;
  saveWeeklyReview: (review: Omit<WeeklyReview, 'completionScore'>) => void;

  // Settings actions
  updateSettings: (settings: Partial<UserSettings>) => void;
  
  // Extension Sync
  importState: (state: Partial<AppState>) => void;
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  accentColor: 'indigo',
  defaultFocusDuration: 25,
  workingHours: {
    start: '09:00',
    end: '17:00',
  },
  weekStartsOn: 0,
  notificationsEnabled: true,
};

// Helper to notify the extension via DOM custom events
const notifyExtension = (state: any) => {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('FOCUSFLOW_STATE_CHANGED', {
      detail: JSON.parse(JSON.stringify({
        goals: state.goals,
        projects: state.projects,
        tasks: state.tasks,
        sessions: state.sessions,
        dailyReviews: state.dailyReviews,
        weeklyReviews: state.weeklyReviews,
        settings: state.settings,
      })),
    });
    window.dispatchEvent(event);
  }
};

export const useStore = create<AppState & StoreActions>()(
  persist(
    (set, get) => {
      // Recalculate progress for all projects and goals
      const recalculateAllProgress = (tasks: Task[], projects: Project[], goals: Goal[]) => {
        const updatedProjects = projects.map(proj => {
          const projectTasks = tasks.filter(t => t.projectId === proj.id);
          return {
            ...proj,
            progress: calculateProjectProgress(projectTasks),
          };
        });

        const updatedGoals = goals.map(goal => {
          const goalProjects = updatedProjects.filter(p => p.goalId === goal.id);
          return {
            ...goal,
            progress: calculateGoalProgress(goalProjects),
          };
        });

        return { updatedProjects, updatedGoals };
      };

      return {
        // Initial state
        goals: [],
        projects: [],
        tasks: [],
        sessions: [],
        dailyReviews: [],
        weeklyReviews: [],
        settings: DEFAULT_SETTINGS,
        syncQueue: [],

        // Goal actions
        addGoal: (goalData) => {
          const newGoal: Goal = {
            ...goalData,
            id: crypto.randomUUID(),
            progress: 0,
            createdAt: new Date().toISOString(),
          };
          set((state) => {
            const nextState = { goals: [...state.goals, newGoal] };
            notifyExtension({ ...state, ...nextState });
            return nextState;
          });
        },

        updateGoal: (id, goalData) => {
          set((state) => {
            const nextState = {
              goals: state.goals.map((g) => (g.id === id ? { ...g, ...goalData } : g)),
            };
            notifyExtension({ ...state, ...nextState });
            return nextState;
          });
        },

        deleteGoal: (id) => {
          set((state) => {
            const projectsToDelete = state.projects.filter((p) => p.goalId === id).map((p) => p.id);
            const nextState = {
              goals: state.goals.filter((g) => g.id !== id),
              projects: state.projects.filter((p) => p.goalId !== id),
              tasks: state.tasks.filter((t) => !projectsToDelete.includes(t.projectId)),
            };
            notifyExtension({ ...state, ...nextState });
            return nextState;
          });
        },

        // Project actions
        addProject: (projData) => {
          const newProj: Project = {
            ...projData,
            id: crypto.randomUUID(),
            progress: 0,
            createdAt: new Date().toISOString(),
          };
          set((state) => {
            const nextProjects = [...state.projects, newProj];
            const { updatedProjects, updatedGoals } = recalculateAllProgress(state.tasks, nextProjects, state.goals);
            const nextState = { projects: updatedProjects, goals: updatedGoals };
            notifyExtension({ ...state, ...nextState });
            return nextState;
          });
        },

        updateProject: (id, projData) => {
          set((state) => {
            const nextProjects = state.projects.map((p) => (p.id === id ? { ...p, ...projData } : p));
            const { updatedProjects, updatedGoals } = recalculateAllProgress(state.tasks, nextProjects, state.goals);
            const nextState = { projects: updatedProjects, goals: updatedGoals };
            notifyExtension({ ...state, ...nextState });
            return nextState;
          });
        },

        deleteProject: (id) => {
          set((state) => {
            const nextProjects = state.projects.filter((p) => p.id !== id);
            const nextTasks = state.tasks.filter((t) => t.projectId !== id);
            const { updatedProjects, updatedGoals } = recalculateAllProgress(nextTasks, nextProjects, state.goals);
            const nextState = { projects: updatedProjects, goals: updatedGoals, tasks: nextTasks };
            notifyExtension({ ...state, ...nextState });
            return nextState;
          });
        },

        // Task actions
        addTask: (taskData) => {
          const priority = calculatePriority(taskData.deadline, taskData.impact);
          const newTask: Task = {
            ...taskData,
            id: crypto.randomUUID(),
            priority,
            status: 'Todo',
            actualTime: 0,
            isBigThree: false,
            createdAt: new Date().toISOString(),
          };
          set((state) => {
            const nextTasks = [...state.tasks, newTask];
            const { updatedProjects, updatedGoals } = recalculateAllProgress(nextTasks, state.projects, state.goals);
            const nextState = { tasks: nextTasks, projects: updatedProjects, goals: updatedGoals };
            notifyExtension({ ...state, ...nextState });
            return nextState;
          });
        },

        updateTask: (id, taskData) => {
          set((state) => {
            const nextTasks = state.tasks.map((t) => {
              if (t.id !== id) return t;
              const merged = { ...t, ...taskData };
              // Recalculate priority if deadline or impact changed
              if (taskData.deadline !== undefined || taskData.impact !== undefined) {
                merged.priority = calculatePriority(merged.deadline, merged.impact);
              }
              return merged;
            });
            const { updatedProjects, updatedGoals } = recalculateAllProgress(nextTasks, state.projects, state.goals);
            const nextState = { tasks: nextTasks, projects: updatedProjects, goals: updatedGoals };
            notifyExtension({ ...state, ...nextState });
            return nextState;
          });
        },

        toggleTaskCompletion: (id) => {
          set((state) => {
            const nextTasks = state.tasks.map((t) => {
              if (t.id !== id) return t;
              const isCompleted = t.status === 'Completed';
              return {
                ...t,
                status: (isCompleted ? 'Todo' : 'Completed') as TaskStatus,
                completedAt: isCompleted ? undefined : new Date().toISOString(),
              };
            });
            const { updatedProjects, updatedGoals } = recalculateAllProgress(nextTasks, state.projects, state.goals);
            const nextState = { tasks: nextTasks, projects: updatedProjects, goals: updatedGoals };
            notifyExtension({ ...state, ...nextState });
            return nextState;
          });
        },

        deleteTask: (id) => {
          set((state) => {
            const nextTasks = state.tasks.filter((t) => t.id !== id);
            const { updatedProjects, updatedGoals } = recalculateAllProgress(nextTasks, state.projects, state.goals);
            const nextState = { tasks: nextTasks, projects: updatedProjects, goals: updatedGoals };
            notifyExtension({ ...state, ...nextState });
            return nextState;
          });
        },

        duplicateTask: (id) => {
          const taskToDuplicate = get().tasks.find((t) => t.id === id);
          if (!taskToDuplicate) return;

          const duplicated: Task = {
            ...taskToDuplicate,
            id: crypto.randomUUID(),
            name: `${taskToDuplicate.name} (Copy)`,
            status: 'Todo',
            actualTime: 0,
            isBigThree: false,
            createdAt: new Date().toISOString(),
            completedAt: undefined,
          };

          set((state) => {
            const nextTasks = [...state.tasks, duplicated];
            const { updatedProjects, updatedGoals } = recalculateAllProgress(nextTasks, state.projects, state.goals);
            const nextState = { tasks: nextTasks, projects: updatedProjects, goals: updatedGoals };
            notifyExtension({ ...state, ...nextState });
            return nextState;
          });
        },

        setBigThree: (taskIds) => {
          set((state) => {
            const nextTasks = state.tasks.map((t) => ({
              ...t,
              isBigThree: taskIds.includes(t.id),
            }));
            const nextState = { tasks: nextTasks };
            notifyExtension({ ...state, ...nextState });
            return nextState;
          });
        },

        // Focus Session actions
        startFocusSession: (taskId) => {
          const newSession: FocusSession = {
            id: crypto.randomUUID(),
            taskId,
            startTime: new Date().toISOString(),
            duration: 0,
            breaks: [],
            interruptionsCount: 0,
            completed: false,
          };
          set((state) => {
            const nextState = {
              sessions: [...state.sessions, newSession],
              tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, status: 'In Progress' as TaskStatus } : t)),
            };
            notifyExtension({ ...state, ...nextState });
            return nextState;
          });
        },

        pauseFocusSession: () => {
          set((state) => {
            const lastSession = state.sessions[state.sessions.length - 1];
            if (!lastSession || lastSession.completed) return state;

            const updatedSession = {
              ...lastSession,
              breaks: [...lastSession.breaks, { start: new Date().toISOString() }],
            };

            const nextState = {
              sessions: state.sessions.map((s) => (s.id === lastSession.id ? updatedSession : s)),
            };
            notifyExtension({ ...state, ...nextState });
            return nextState;
          });
        },

        resumeFocusSession: () => {
          set((state) => {
            const lastSession = state.sessions[state.sessions.length - 1];
            if (!lastSession || lastSession.completed) return state;

            const nextBreaks = lastSession.breaks.map((b, idx) => {
              if (idx === lastSession.breaks.length - 1 && !b.end) {
                return { ...b, end: new Date().toISOString() };
              }
              return b;
            });

            const updatedSession = {
              ...lastSession,
              breaks: nextBreaks,
            };

            const nextState = {
              sessions: state.sessions.map((s) => (s.id === lastSession.id ? updatedSession : s)),
            };
            notifyExtension({ ...state, ...nextState });
            return nextState;
          });
        },

        endFocusSession: (completed) => {
          set((state) => {
            const lastSession = state.sessions[state.sessions.length - 1];
            if (!lastSession || lastSession.completed) return state;

            const endTime = new Date().toISOString();
            
            // Calculate final duration (excluding breaks)
            const startTimeMs = new Date(lastSession.startTime).getTime();
            const endTimeMs = new Date(endTime).getTime();
            let totalBreakTimeMs = 0;

            lastSession.breaks.forEach((b) => {
              const breakStart = new Date(b.start).getTime();
              const breakEnd = b.end ? new Date(b.end).getTime() : endTimeMs;
              totalBreakTimeMs += (breakEnd - breakStart);
            });

            const durationSec = Math.max(0, Math.floor((endTimeMs - startTimeMs - totalBreakTimeMs) / 1000));
            const durationMin = Math.round(durationSec / 60);

            const updatedSession: FocusSession = {
              ...lastSession,
              endTime,
              duration: durationSec,
              completed,
            };

            // Update task actual focus time
            const nextTasks = state.tasks.map((t) => {
              if (t.id === lastSession.taskId) {
                return {
                  ...t,
                  actualTime: t.actualTime + durationMin,
                  status: completed ? ('Completed' as TaskStatus) : t.status,
                  completedAt: completed ? new Date().toISOString() : t.completedAt,
                };
              }
              return t;
            });

            const { updatedProjects, updatedGoals } = recalculateAllProgress(nextTasks, state.projects, state.goals);

            const nextState = {
              sessions: state.sessions.map((s) => (s.id === lastSession.id ? updatedSession : s)),
              tasks: nextTasks,
              projects: updatedProjects,
              goals: updatedGoals,
            };
            notifyExtension({ ...state, ...nextState });
            return nextState;
          });
        },

        incrementInterruption: () => {
          set((state) => {
            const lastSession = state.sessions[state.sessions.length - 1];
            if (!lastSession || lastSession.completed) return state;

            const updatedSession = {
              ...lastSession,
              interruptionsCount: lastSession.interruptionsCount + 1,
            };

            const nextState = {
              sessions: state.sessions.map((s) => (s.id === lastSession.id ? updatedSession : s)),
            };
            notifyExtension({ ...state, ...nextState });
            return nextState;
          });
        },

        // Review actions
        saveDailyReview: (reviewData) => {
          const todayStr = reviewData.date;
          // Calculate completed tasks for the day
          const completedTasksToday = get().tasks.filter((t) => {
            if (t.status !== 'Completed' || !t.completedAt) return false;
            return t.completedAt.startsWith(todayStr);
          });
          const totalTasksForDay = get().tasks.filter((t) => {
            const createdMatch = t.createdAt.startsWith(todayStr);
            const completedMatch = t.completedAt && t.completedAt.startsWith(todayStr);
            return createdMatch || completedMatch;
          });

          const completionScore = totalTasksForDay.length > 0 
            ? Math.round((completedTasksToday.length / totalTasksForDay.length) * 100)
            : 100;

          const newReview: DailyReview = {
            ...reviewData,
            completionScore,
          };

          set((state) => {
            // Remove existing review for this date if it exists
            const filteredReviews = state.dailyReviews.filter((r) => r.date !== todayStr);
            const nextState = {
              dailyReviews: [...filteredReviews, newReview],
            };
            notifyExtension({ ...state, ...nextState });
            return nextState;
          });
        },

        saveWeeklyReview: (reviewData) => {
          // Calculate focus hours for the week
          const weekStart = new Date(reviewData.weekStart);
          const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
          
          const weeklySessions = get().sessions.filter((s) => {
            const sessDate = new Date(s.startTime);
            return sessDate >= weekStart && sessDate < weekEnd;
          });

          const totalDurationSec = weeklySessions.reduce((sum, s) => sum + s.duration, 0);
          const focusHours = parseFloat((totalDurationSec / 3600).toFixed(1));

          // Find completed projects
          const completedProjects = get().projects.filter((p) => {
            if (p.status !== 'Completed') return false;
            // Let's assume projects completed this week
            const tasksInProj = get().tasks.filter(t => t.projectId === p.id);
            const lastTaskCompleted = tasksInProj
              .filter(t => t.status === 'Completed' && t.completedAt)
              .map(t => new Date(t.completedAt!).getTime());
            
            if (lastTaskCompleted.length === 0) return false;
            const maxCompTime = Math.max(...lastTaskCompleted);
            const compDate = new Date(maxCompTime);
            return compDate >= weekStart && compDate < weekEnd;
          }).map(p => p.id);

          const newWeeklyReview: WeeklyReview = {
            ...reviewData,
            projectsCompleted: completedProjects,
            focusHours,
            completionScore: get().tasks.length > 0
              ? Math.round((get().tasks.filter(t => t.status === 'Completed').length / get().tasks.length) * 100)
              : 100,
          };

          set((state) => {
            const filteredReviews = state.weeklyReviews.filter((r) => r.weekStart !== reviewData.weekStart);
            const nextState = {
              weeklyReviews: [...filteredReviews, newWeeklyReview],
            };
            notifyExtension({ ...state, ...nextState });
            return nextState;
          });
        },

        // Settings actions
        updateSettings: (settingsData) => {
          set((state) => {
            const nextState = {
              settings: { ...state.settings, ...settingsData },
            };
            notifyExtension({ ...state, ...nextState });
            return nextState;
          });
        },

        // Extension Sync
        importState: (importedState) => {
          set((state) => {
            return {
              ...state,
              ...importedState,
              goals: importedState.goals || state.goals || [],
              projects: importedState.projects || state.projects || [],
              tasks: importedState.tasks || state.tasks || [],
              sessions: importedState.sessions || state.sessions || [],
              dailyReviews: importedState.dailyReviews || state.dailyReviews || [],
              weeklyReviews: importedState.weeklyReviews || state.weeklyReviews || [],
              settings: { ...state.settings, ...(importedState.settings || {}) },
            };
          });
        },
      };
    },
    {
      name: 'focusflow-storage',
      partialize: (state) => ({
        goals: state.goals,
        projects: state.projects,
        tasks: state.tasks,
        sessions: state.sessions,
        dailyReviews: state.dailyReviews,
        weeklyReviews: state.weeklyReviews,
        settings: state.settings,
      }),
    }
  )
);

// Setup background extension listener if running in browser
if (typeof window !== 'undefined') {
  window.addEventListener('FOCUSFLOW_STATE_UPDATE_FROM_EXTENSION', (event: any) => {
    if (event.detail) {
      useStore.getState().importState(event.detail);
    }
  });
}
