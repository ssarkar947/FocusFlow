/// <reference types="chrome" />
import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Star, ExternalLink, Plus, BookOpen, Clock } from 'lucide-react';
import type { Task, Project } from '../../shared/types';

export default function App() {
  const [state, setState] = useState<any>(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [quickNotes, setQuickNotes] = useState('');

  // 1. Load state from chrome extension storage
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      // Get state
      chrome.runtime.sendMessage({ action: 'GET_STATE' }, (response: any) => {
        if (response && response.state) {
          setState(response.state);
          // Set active project selection
          if (response.state.projects && response.state.projects.length > 0) {
            setSelectedProjectId(response.state.projects[0].id);
          }
        }
      });

      // Get quick notes
      chrome.storage.local.get('focusflow_quick_notes', (result: any) => {
        if (result.focusflow_quick_notes) {
          setQuickNotes(result.focusflow_quick_notes);
        }
      });
    }
  }, []);

  // 2. Listen for storage changes from background scripts (synced from web tabs)
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      const listener = (changes: any, areaName: string) => {
        if (areaName === 'local' && changes.focusflow_state) {
          setState(changes.focusflow_state.newValue);
        }
      };
      chrome.storage.onChanged.addListener(listener);
      return () => chrome.storage.onChanged.removeListener(listener);
    }
  }, []);

  // 3. Save state helper
  const saveState = (newState: any) => {
    setState(newState);
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ action: 'UPDATE_STATE', state: newState });
    }
  };

  // 4. Checkbox toggling
  const handleToggleTask = (taskId: string) => {
    if (!state) return;
    
    const updatedTasks = state.tasks.map((t: Task) => {
      if (t.id !== taskId) return t;
      const isCompleted = t.status === 'Completed';
      return {
        ...t,
        status: isCompleted ? 'Todo' : 'Completed',
        completedAt: isCompleted ? undefined : new Date().toISOString(),
      };
    });

    // Recalculate progress for parent project
    const taskToToggle = state.tasks.find((t: Task) => t.id === taskId);
    const updatedProjects = state.projects.map((p: Project) => {
      if (p.id !== taskToToggle?.projectId) return p;
      const projTasks = updatedTasks.filter((t: Task) => t.projectId === p.id && t.status !== 'Archived');
      const completedCount = projTasks.filter((t: Task) => t.status === 'Completed').length;
      return {
        ...p,
        progress: projTasks.length > 0 ? Math.round((completedCount / projTasks.length) * 100) : 0,
      };
    });

    const nextState = { ...state, tasks: updatedTasks, projects: updatedProjects };
    saveState(nextState);
  };

  // 5. Quick Add Task
  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim() || !selectedProjectId || !state) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      projectId: selectedProjectId,
      name: newTaskName,
      description: 'Quick added from Chrome companion.',
      deadline: new Date().toISOString().split('T')[0],
      estimatedTime: 25,
      actualTime: 0,
      impact: 'Medium',
      priority: 'Important',
      status: 'Todo',
      weight: 10,
      tags: ['quick-add'],
      notes: '',
      isRecurring: false,
      createdAt: new Date().toISOString(),
      isBigThree: false,
    };

    const nextState = {
      ...state,
      tasks: [...state.tasks, newTask]
    };
    saveState(nextState);
    setNewTaskName('');
  };

  // 6. Save Quick Notes
  const handleSaveNotes = (val: string) => {
    setQuickNotes(val);
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ focusflow_quick_notes: val });
    }
  };

  // 7. Redirect to web app dashboard
  const handleOpenDashboard = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: 'http://localhost:5173/' });
    }
  };

  if (!state) {
    return (
      <div className="w-[360px] p-6 text-center text-xs font-semibold text-text-secondary bg-bg-base flex flex-col items-center justify-center h-48">
        <Clock className="animate-spin mb-3 text-accent-main" size={24} />
        <span>Syncing with FocusFlow...</span>
      </div>
    );
  }

  // Today's Date
  const todayStr = new Date().toISOString().split('T')[0];

  // Filters
  const activeTasks = state.tasks.filter((t: Task) => t.status !== 'Archived');
  const bigThree = activeTasks.filter((t: Task) => t.isBigThree);
  const bigThreeCompleted = bigThree.filter((t: Task) => t.status === 'Completed');
  
  // Focus Hours today
  const todaySessions = state.sessions ? state.sessions.filter((s: any) => s.startTime.startsWith(todayStr)) : [];
  const todayFocusSec = todaySessions.reduce((sum: number, s: any) => sum + s.duration, 0);
  const todayFocusHours = parseFloat((todayFocusSec / 3600).toFixed(1));

  const progressPercent = bigThree.length > 0
    ? Math.round((bigThreeCompleted.length / bigThree.length) * 100)
    : 0;

  return (
    <div className="w-[360px] bg-bg-base text-text-primary font-sans flex flex-col justify-between overflow-hidden shadow-lg select-none">
      
      {/* Header */}
      <div className="bg-bg-surface border-b border-border-main p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-accent-main flex items-center justify-center text-white shadow-xs">
            <Star size={16} fill="currentColor" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm tracking-tight">FocusFlow</h2>
            <p className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Browser Companion</p>
          </div>
        </div>

        <button
          onClick={handleOpenDashboard}
          className="text-[10px] font-bold text-accent-main bg-accent-main/5 hover:bg-accent-main/15 px-3 py-1 rounded-full flex items-center gap-1 transition-all"
        >
          <span>Dashboard</span>
          <ExternalLink size={10} />
        </button>
      </div>

      {/* Progress & Focus Hours Row */}
      <div className="p-4 bg-bg-muted/30 border-b border-border-main flex justify-between items-center gap-4 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <div className="w-16 bg-bg-muted h-2 rounded-full overflow-hidden">
            <div className="bg-accent-main h-full rounded-full" style={{ width: `${progressPercent}%` }} />
          </div>
          <span className="text-text-secondary">{progressPercent}% Focus</span>
        </div>
        <div className="flex items-center gap-1 text-text-secondary">
          <Clock size={12} className="text-accent-main" />
          <span>{todayFocusHours}h Focused Today</span>
        </div>
      </div>

      {/* Today's Big 3 List */}
      <div className="p-4 space-y-3">
        <h3 className="text-xs uppercase font-extrabold tracking-wider text-text-muted">Today's Big 3</h3>
        
        {bigThree.length === 0 ? (
          <div className="text-center py-4 border border-dashed border-border-main rounded-2xl text-[11px] text-text-muted">
            Open dashboard to pin your Big 3 focus tasks for today.
          </div>
        ) : (
          <div className="space-y-2">
            {bigThree.map((task: Task) => (
              <div 
                key={task.id} 
                className={`flex items-center justify-between border border-border-main rounded-xl p-2.5 bg-bg-surface ${
                  task.status === 'Completed' ? 'opacity-70 bg-bg-muted/20' : ''
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <button onClick={() => handleToggleTask(task.id)} className="text-text-secondary hover:text-accent-main transition-colors">
                    {task.status === 'Completed' ? (
                      <CheckCircle2 className="text-emerald-600" size={16} />
                    ) : (
                      <Circle size={16} />
                    )}
                  </button>
                  <span className={`text-xs font-semibold truncate max-w-[200px] ${task.status === 'Completed' ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                    {task.name}
                  </span>
                </div>

                {task.isSavedLink && (
                  <a href={task.linkUrl} target="_blank" rel="noreferrer" className="text-[8px] text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 px-1.5 py-0.5 rounded-full hover:underline truncate max-w-[80px]">
                    Link
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Add Form */}
      <div className="px-4 pb-4">
        <form onSubmit={handleQuickAdd} className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              required
              placeholder="Quick add task..."
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              className="flex-grow px-3 py-2 bg-bg-muted rounded-xl border border-border-main text-xs text-text-primary focus:outline-none"
            />
            
            <button
              type="submit"
              disabled={state.projects.length === 0}
              className="px-3 bg-text-primary text-bg-surface hover:bg-opacity-90 rounded-xl flex items-center justify-center transition-colors active:scale-95 disabled:opacity-50"
            >
              <Plus size={14} />
            </button>
          </div>

          {state.projects.length > 0 && (
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-bg-muted rounded-xl border border-border-main text-[10px] text-text-secondary focus:outline-none"
            >
              {state.projects.map((p: Project) => (
                <option key={p.id} value={p.id}>Project: {p.name}</option>
              ))}
            </select>
          )}
        </form>
      </div>

      {/* Quick Notes Panel */}
      <div className="px-4 pb-4 space-y-1.5 border-t border-border-main pt-4">
        <div className="flex items-center gap-1.5 text-xs uppercase font-extrabold tracking-wider text-text-muted">
          <BookOpen size={12} />
          <span>Quick Notes</span>
        </div>
        
        <textarea
          placeholder="Jot down quick thoughts, links or ideas..."
          value={quickNotes}
          onChange={(e) => handleSaveNotes(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 bg-bg-muted rounded-xl border border-border-main text-xs text-text-primary focus:outline-none resize-none"
        />
      </div>

      {/* Footer */}
      <div className="bg-bg-muted text-center py-2 border-t border-border-main text-[9px] font-semibold text-text-muted tracking-wide">
        FocusFlow v1.0.0 — Offline-ready
      </div>

    </div>
  );
}
