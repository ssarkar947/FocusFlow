import React, { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import { Dashboard } from './components/Dashboard';
import { Goals } from './components/Goals';
import { Projects } from './components/Projects';
import { Tasks } from './components/Tasks';
import { Analytics } from './components/Analytics';
import { Reviews } from './components/Reviews';
import { Settings } from './components/Settings';
import { FocusTimer } from './components/FocusTimer';
import { startFirebaseSync, stopFirebaseSync } from './services/firebase';
import { Target, FolderKanban, CheckSquare, BarChart2, BookOpen, Settings as SettingsIcon, LayoutGrid, Timer } from 'lucide-react';

export const App: React.FC = () => {
  const { 
    goals, 
    projects, 
    tasks, 
    settings, 
    addGoal, 
    addProject, 
    addTask,
    updateSettings
  } = useStore();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'goals' | 'projects' | 'tasks' | 'analytics' | 'reviews' | 'settings'>('dashboard');

  // Synchronize theme with body classes
  useEffect(() => {
    const root = document.documentElement;
    root.removeAttribute('data-theme');
    root.classList.remove('dark');
    
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else if (settings.theme === 'warm') {
      root.setAttribute('data-theme', 'warm');
    } else {
      root.setAttribute('data-theme', 'light');
    }
  }, [settings.theme]);

  // Seed default Firebase Config if none exists
  useEffect(() => {
    if (!settings.firebaseConfig) {
      updateSettings({
        firebaseConfig: {
          apiKey: "AIzaSyA_oVmLvetZX-fn7Jh6ysR_ZubOrnWvl20",
          authDomain: "focusflow-c5eda.firebaseapp.com",
          projectId: "focusflow-c5eda",
          storageBucket: "focusflow-c5eda.firebasestorage.app",
          messagingSenderId: "712539493325",
          appId: "1:712539493325:web:3842dd72ec30727ce36a84"
        }
      });
    }
  }, [settings.firebaseConfig, updateSettings]);

  // Synchronize Firebase Cloud Database Sync
  useEffect(() => {
    if (settings.firebaseConfig && settings.firebaseConfig.apiKey) {
      startFirebaseSync(settings.firebaseConfig);
    }
    return () => {
      stopFirebaseSync();
    };
  }, [settings.firebaseConfig]);

  // Seed default demo data if store is empty to show premium look
  useEffect(() => {
    if (goals.length === 0 && projects.length === 0 && tasks.length === 0) {
      // Seed store manually since actions trigger progress updates
      // Using direct zustand store set is easier, but let's use the actions in sequence to preserve calculations.
      // 1. Add Goal
      addGoal({
        name: 'Build FocusFlow Productivity',
        description: 'Launch the FocusFlow task planner and Chrome Extension synchronizer.',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        color: '#E6A045',
        icon: '🚀',
      });
    }
  }, []);

  // When we added a goal, seed project/tasks if needed
  useEffect(() => {
    if (goals.length === 1 && projects.length === 0) {
      const parentGoalId = goals[0].id;
      addProject({
        goalId: parentGoalId,
        name: 'Web Application Core',
        description: 'Complete the main web portal dashboard, analytics, and state store.',
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'Important',
        status: 'In Progress',
      });
      
      addProject({
        goalId: parentGoalId,
        name: 'Chrome Extension popup',
        description: 'Construct the Manifest V3 popup interface and sync listeners.',
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'Important',
        status: 'Planning',
      });
    }
  }, [goals, projects]);

  useEffect(() => {
    if (projects.length === 2 && tasks.length === 0) {
      const projId1 = projects.find(p => p.name === 'Web Application Core')?.id;
      const projId2 = projects.find(p => p.name === 'Chrome Extension popup')?.id;

      if (projId1) {
        addTask({
          projectId: projId1,
          name: 'Implement Zustand State Store',
          description: 'Establish local storage persistence and priority calculation systems.',
          deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          estimatedTime: 45,
          impact: 'High',
          weight: 40,
          tags: ['state', 'architecture'],
          notes: '',
          isRecurring: false,
        });

        addTask({
          projectId: projId1,
          name: 'Style layout with Tailwind CSS v4',
          description: 'Build a distraction-free responsive workspace layout.',
          deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          estimatedTime: 60,
          impact: 'High',
          weight: 30,
          tags: ['design', 'css'],
          notes: '',
          isRecurring: false,
        });
      }

      if (projId2) {
        addTask({
          projectId: projId2,
          name: 'Create Extension Manifest.json',
          description: 'Configure popup files, icons and message channels in manifest.',
          deadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          estimatedTime: 25,
          impact: 'Medium',
          weight: 20,
          tags: ['manifest', 'extension'],
          notes: '',
          isRecurring: false,
        });
      }
    }
  }, [projects, tasks]);

  // Render correct view based on activeTab
  const renderView = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'goals': return <Goals />;
      case 'projects': return <Projects />;
      case 'tasks': return <Tasks />;
      case 'analytics': return <Analytics />;
      case 'reviews': return <Reviews />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bg-base transition-colors duration-300">
      
      {/* Focus Timer Overlay (Active Session View) */}
      <FocusTimer />

      {/* Main Sidebar Navigation */}
      <aside className="w-64 bg-bg-surface border-r border-border-main flex flex-col justify-between flex-shrink-0 z-10 hidden md:flex">
        
        {/* Top Brand */}
        <div className="p-6 border-b border-border-main">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-accent-main flex items-center justify-center text-white shadow-xs">
              <Timer size={20} />
            </div>
            <div>
              <h2 className="font-extrabold text-base tracking-tight text-text-primary">FocusFlow</h2>
              <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Deep Work Sync</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-grow p-4 space-y-1.5 overflow-y-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-bg-muted text-text-primary'
                : 'text-text-secondary hover:bg-bg-muted/40 hover:text-text-primary'
            }`}
          >
            <LayoutGrid size={18} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('goals')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
              activeTab === 'goals'
                ? 'bg-bg-muted text-text-primary'
                : 'text-text-secondary hover:bg-bg-muted/40 hover:text-text-primary'
            }`}
          >
            <Target size={18} />
            <span>Goals</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
              activeTab === 'projects'
                ? 'bg-bg-muted text-text-primary'
                : 'text-text-secondary hover:bg-bg-muted/40 hover:text-text-primary'
            }`}
          >
            <FolderKanban size={18} />
            <span>Projects</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
              activeTab === 'tasks'
                ? 'bg-bg-muted text-text-primary'
                : 'text-text-secondary hover:bg-bg-muted/40 hover:text-text-primary'
            }`}
          >
            <CheckSquare size={18} />
            <span>Tasks</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
              activeTab === 'analytics'
                ? 'bg-bg-muted text-text-primary'
                : 'text-text-secondary hover:bg-bg-muted/40 hover:text-text-primary'
            }`}
          >
            <BarChart2 size={18} />
            <span>Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
              activeTab === 'reviews'
                ? 'bg-bg-muted text-text-primary'
                : 'text-text-secondary hover:bg-bg-muted/40 hover:text-text-primary'
            }`}
          >
            <BookOpen size={18} />
            <span>Reviews</span>
          </button>
        </nav>

        {/* Bottom Settings Link */}
        <div className="p-4 border-t border-border-main">
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
              activeTab === 'settings'
                ? 'bg-bg-muted text-text-primary'
                : 'text-text-secondary hover:bg-bg-muted/40 hover:text-text-primary'
            }`}
          >
            <SettingsIcon size={18} />
            <span>Settings</span>
          </button>
        </div>

      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0">
        
        {/* Top Header for Mobile Navigation */}
        <header className="h-16 bg-bg-surface border-b border-border-main flex items-center justify-between px-6 md:hidden flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-accent-main flex items-center justify-center text-white shadow-xs">
              <Timer size={16} />
            </div>
            <span className="font-extrabold text-sm text-text-primary">FocusFlow</span>
          </div>

          {/* Simple Mobile Dropdown/Icons for Quick Tab Switching */}
          <div className="flex gap-2">
            <button onClick={() => setActiveTab('dashboard')} className={`p-1.5 rounded-lg ${activeTab === 'dashboard' ? 'text-accent-main bg-bg-muted' : 'text-text-secondary'}`} title="Dashboard">
              <LayoutGrid size={18} />
            </button>
            <button onClick={() => setActiveTab('goals')} className={`p-1.5 rounded-lg ${activeTab === 'goals' ? 'text-accent-main bg-bg-muted' : 'text-text-secondary'}`} title="Goals">
              <Target size={18} />
            </button>
            <button onClick={() => setActiveTab('projects')} className={`p-1.5 rounded-lg ${activeTab === 'projects' ? 'text-accent-main bg-bg-muted' : 'text-text-secondary'}`} title="Projects">
              <FolderKanban size={18} />
            </button>
            <button onClick={() => setActiveTab('tasks')} className={`p-1.5 rounded-lg ${activeTab === 'tasks' ? 'text-accent-main bg-bg-muted' : 'text-text-secondary'}`} title="Tasks">
              <CheckSquare size={18} />
            </button>
            <button onClick={() => setActiveTab('analytics')} className={`p-1.5 rounded-lg ${activeTab === 'analytics' ? 'text-accent-main bg-bg-muted' : 'text-text-secondary'}`} title="Analytics">
              <BarChart2 size={18} />
            </button>
            <button onClick={() => setActiveTab('reviews')} className={`p-1.5 rounded-lg ${activeTab === 'reviews' ? 'text-accent-main bg-bg-muted' : 'text-text-secondary'}`} title="Reviews">
              <BookOpen size={18} />
            </button>
            <button onClick={() => setActiveTab('settings')} className={`p-1.5 rounded-lg ${activeTab === 'settings' ? 'text-accent-main bg-bg-muted' : 'text-text-secondary'}`} title="Settings">
              <SettingsIcon size={18} />
            </button>
          </div>
        </header>

        {/* Scrollable View Area */}
        <main className="flex-grow overflow-y-auto p-6 md:p-8">
          {renderView()}
        </main>
      </div>

    </div>
  );
};
