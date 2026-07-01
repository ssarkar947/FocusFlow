import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, CheckCircle2, Circle, Flame, Timer, Award, Calendar, Star } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { 
    tasks, 
    projects, 
    sessions, 
    addTask, 
    toggleTaskCompletion, 
    setBigThree,
    startFocusSession
  } = useStore();

  const [newTaskName, setNewTaskName] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [taskImpact, setTaskImpact] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [taskDeadline, setTaskDeadline] = useState(new Date().toISOString().split('T')[0]);

  // Today's Date String
  const todayStr = new Date().toISOString().split('T')[0];

  // Tasks belonging to today (deadline is today, or completed today, or active)
  const activeTasks = tasks.filter(t => t.status !== 'Archived');
  const todoTasks = activeTasks.filter(t => t.status !== 'Completed');
  const completedTasks = activeTasks.filter(t => t.status === 'Completed');

  // Today's Big 3
  const bigThree = activeTasks.filter(t => t.isBigThree);
  const bigThreeCompleted = bigThree.filter(t => t.status === 'Completed');
  
  // Progress calculations
  const progressPercent = bigThree.length > 0 
    ? Math.round((bigThreeCompleted.length / bigThree.length) * 100)
    : 0;

  // Focus Stats
  const todaySessions = sessions.filter(s => s.startTime.startsWith(todayStr));
  const todayFocusSec = todaySessions.reduce((sum, s) => sum + s.duration, 0);
  const todayFocusHours = parseFloat((todayFocusSec / 3600).toFixed(1));

  // Streaks
  // Calculate streak from session dates
  const uniqueSessionDates = Array.from(
    new Set(sessions.map(s => s.startTime.split('T')[0]))
  ).sort().reverse();
  
  let currentStreak = 0;
  let tempDate = new Date();
  
  for (let i = 0; i < 30; i++) {
    const checkStr = tempDate.toISOString().split('T')[0];
    if (uniqueSessionDates.includes(checkStr)) {
      currentStreak++;
      tempDate.setDate(tempDate.getDate() - 1);
    } else {
      // If it's today and empty, check yesterday
      if (i === 0) {
        tempDate.setDate(tempDate.getDate() - 1);
        const checkStrYesterday = tempDate.toISOString().split('T')[0];
        if (uniqueSessionDates.includes(checkStrYesterday)) {
          currentStreak++;
          tempDate.setDate(tempDate.getDate() - 1);
          continue;
        }
      }
      break;
    }
  }

  // Handle Quick Add Task
  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim() || !selectedProjectId) return;
    
    addTask({
      projectId: selectedProjectId,
      name: newTaskName,
      description: '',
      deadline: taskDeadline,
      estimatedTime: 25,
      impact: taskImpact,
      weight: 10,
      tags: [],
      notes: '',
      isRecurring: false,
    });
    setNewTaskName('');
  };

  // Select Today's Big 3 if not already selected
  const handleSelectBigThree = (taskId: string) => {
    if (bigThree.length >= 3 && !bigThree.find(t => t.id === taskId)) {
      alert("You can only select up to 3 focus tasks for Today's Big 3.");
      return;
    }
    const currentBigThreeIds = bigThree.map(t => t.id);
    if (currentBigThreeIds.includes(taskId)) {
      setBigThree(currentBigThreeIds.filter(id => id !== taskId));
    } else {
      setBigThree([...currentBigThreeIds, taskId]);
    }
  };

  // Upcoming deadlines
  const upcomingTasks = todoTasks
    .filter(t => t.deadline)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 3);

  // Greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto py-4">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary mb-1">
            {getGreeting()}, Focuser
          </h1>
          <p className="text-text-secondary text-sm">
            Here's what your day looks like. Stay centered, work deeply.
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-3 bg-bg-surface border border-border-main rounded-2xl px-5 py-3 shadow-sm flex-1 md:flex-none">
            <div className="h-10 w-10 rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-600 flex items-center justify-center">
              <Flame size={20} fill="currentColor" />
            </div>
            <div>
              <div className="text-xl font-bold text-text-primary leading-tight">{currentStreak}</div>
              <div className="text-xs text-text-muted">Day Streak</div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-bg-surface border border-border-main rounded-2xl px-5 py-3 shadow-sm flex-1 md:flex-none">
            <div className="h-10 w-10 rounded-full bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 flex items-center justify-center">
              <Timer size={20} />
            </div>
            <div>
              <div className="text-xl font-bold text-text-primary leading-tight">{todayFocusHours}h</div>
              <div className="text-xs text-text-muted">Focus Hours</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Execution, Right Analytics/Quick Add */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Big 3 & Planner */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Today's Big 3 Progress Ring & Tasks */}
          <div className="bg-bg-surface border border-border-main rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row gap-8 items-center">
            
            {/* Circular Progress Ring */}
            <div className="relative w-40 h-40 flex-shrink-0 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="50%" cy="50%" r="42%" className="stroke-bg-muted fill-none" strokeWidth="6" />
                <circle
                  cx="50%"
                  cy="50%"
                  r="42%"
                  className="stroke-accent-main fill-none"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 67.2}`}
                  strokeDashoffset={`${2 * Math.PI * 67.2 * (1 - progressPercent / 100)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                />
              </svg>
              <div className="text-center">
                <span className="text-3xl font-extrabold text-text-primary leading-none">{progressPercent}%</span>
                <p className="text-[10px] text-text-muted uppercase tracking-wider mt-1">Today's Focus</p>
              </div>
            </div>

            {/* Today's Big 3 List */}
            <div className="flex-grow space-y-4 w-full">
              <div>
                <h3 className="font-semibold text-text-primary flex items-center gap-2">
                  Today's Big 3 Focus
                  {progressPercent === 100 && bigThree.length > 0 && (
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full">
                      Done!
                    </span>
                  )}
                </h3>
                <p className="text-xs text-text-muted">Select three tasks to complete today. Finish them first.</p>
              </div>

              <div className="space-y-2">
                {bigThree.length === 0 ? (
                  <div className="border border-dashed border-border-main rounded-2xl p-4 text-center text-xs text-text-muted">
                    No focus tasks set. Pin 3 tasks from below to prioritize your day.
                  </div>
                ) : (
                  bigThree.map((task) => (
                    <div 
                      key={task.id} 
                      className={`flex items-center justify-between border rounded-2xl p-3 transition-all ${
                        task.status === 'Completed'
                          ? 'bg-bg-muted/30 border-border-main opacity-80'
                          : 'bg-bg-surface border-border-main shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button onClick={() => toggleTaskCompletion(task.id)} className="text-text-secondary hover:text-accent-main transition-colors flex-shrink-0">
                          {task.status === 'Completed' ? (
                            <CheckCircle2 className="text-emerald-600" size={20} />
                          ) : (
                            <Circle size={20} />
                          )}
                        </button>
                        <div>
                          <span className={`text-sm font-medium ${task.status === 'Completed' ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                            {task.name}
                          </span>
                          <div className="text-[10px] text-text-muted">
                            {projects.find(p => p.id === task.projectId)?.name || 'Project'}
                          </div>
                        </div>
                      </div>

                      {task.status !== 'Completed' && (
                        <button
                          onClick={() => startFocusSession(task.id)}
                          className="text-xs px-3 py-1.5 rounded-full bg-accent-main text-white font-medium hover:bg-opacity-90 transition-all flex items-center gap-1 active:scale-95"
                        >
                          <Timer size={12} />
                          <span>Start Focus</span>
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Today's Other Tasks Selector / List */}
          <div className="bg-bg-surface border border-border-main rounded-3xl p-6 md:p-8 shadow-sm space-y-5">
            <h3 className="font-semibold text-text-primary">Planner & Tasks</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {todoTasks.filter(t => !t.isBigThree).length === 0 && completedTasks.length === 0 ? (
                <div className="text-center py-8 text-xs text-text-muted">
                  No tasks active. Create one to begin your workflow.
                </div>
              ) : (
                <>
                  {todoTasks.filter(t => !t.isBigThree).map((task) => (
                    <div key={task.id} className="flex items-center justify-between border border-border-main rounded-2xl p-3 hover:border-text-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleSelectBigThree(task.id)} className="text-text-muted hover:text-amber-500 transition-colors" title="Pin to Big 3">
                          <Star size={16} className={task.isBigThree ? "fill-amber-500 text-amber-500" : ""} />
                        </button>
                        <button onClick={() => toggleTaskCompletion(task.id)} className="text-text-secondary hover:text-accent-main transition-colors">
                          <Circle size={18} />
                        </button>
                        <div>
                          <span className="text-sm font-medium text-text-primary">{task.name}</span>
                          <span className="text-[10px] text-text-muted ml-2">
                            ({projects.find(p => p.id === task.projectId)?.name || 'Project'})
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          task.priority === 'Urgent + Important' ? 'bg-red-50 text-red-600 dark:bg-red-950/20' :
                          task.priority === 'Important' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20' :
                          task.priority === 'Urgent' ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/20' :
                          'bg-stone-100 text-stone-600 dark:bg-stone-800'
                        }`}>
                          {task.priority}
                        </span>
                        
                        <button
                          onClick={() => startFocusSession(task.id)}
                          className="h-7 w-7 rounded-full border border-border-main hover:bg-bg-muted flex items-center justify-center transition-colors text-text-secondary"
                        >
                          <Timer size={14} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Completed Tasks section */}
                  {completedTasks.length > 0 && (
                    <div className="pt-4 mt-4 border-t border-border-main space-y-2">
                      <div className="text-xs font-semibold text-text-muted mb-2">Completed Today</div>
                      {completedTasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between bg-bg-muted/20 border border-border-main rounded-2xl p-3 opacity-70">
                          <div className="flex items-center gap-3">
                            <button onClick={() => toggleTaskCompletion(task.id)} className="text-emerald-600">
                              <CheckCircle2 size={18} />
                            </button>
                            <span className="text-sm font-medium text-text-muted line-through">{task.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Quick Add & Deadlines */}
        <div className="space-y-8">
          
          {/* Quick Add Task */}
          <div className="bg-bg-surface border border-border-main rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-text-primary flex items-center gap-2">
              Quick Add Task
            </h3>
            
            <form onSubmit={handleQuickAdd} className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-text-muted">Task Name</label>
                <input
                  type="text"
                  required
                  placeholder="What needs to be done?"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-bg-muted rounded-xl border border-border-main text-sm text-text-primary focus:outline-none focus:border-text-secondary transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-text-muted">Assign to Project</label>
                <select
                  required
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-bg-muted rounded-xl border border-border-main text-sm text-text-primary focus:outline-none transition-colors"
                >
                  <option value="">Select a project...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-text-muted">Impact</label>
                  <select
                    value={taskImpact}
                    onChange={(e) => setTaskImpact(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 bg-bg-muted rounded-xl border border-border-main text-sm text-text-primary focus:outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-text-muted">Deadline</label>
                  <input
                    type="date"
                    required
                    value={taskDeadline}
                    onChange={(e) => setTaskDeadline(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-bg-muted rounded-xl border border-border-main text-sm text-text-primary focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!selectedProjectId}
                className="w-full py-2.5 mt-2 bg-text-primary hover:bg-opacity-95 text-bg-surface font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-1 active:scale-95 disabled:opacity-50"
              >
                <Plus size={16} />
                <span>Add Task</span>
              </button>
            </form>
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-bg-surface border border-border-main rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-text-primary flex items-center gap-2">
              <Calendar size={18} className="text-accent-main" />
              <span>Upcoming Deadlines</span>
            </h3>

            <div className="space-y-3">
              {upcomingTasks.length === 0 ? (
                <div className="text-xs text-text-muted py-2">No upcoming tasks with deadlines.</div>
              ) : (
                upcomingTasks.map((task) => {
                  const daysLeft = Math.ceil((new Date(task.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={task.id} className="flex justify-between items-center text-xs border-b border-border-main pb-2 last:border-b-0 last:pb-0">
                      <div>
                        <div className="font-medium text-text-primary truncate max-w-[140px]">{task.name}</div>
                        <div className="text-[10px] text-text-muted">
                          {projects.find(p => p.id === task.projectId)?.name || 'Project'}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`font-semibold ${daysLeft <= 2 ? 'text-red-500 font-bold' : 'text-text-secondary'}`}>
                          {daysLeft < 0 ? 'Overdue' : daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft} days left`}
                        </span>
                        <div className="text-[9px] text-text-muted">{new Date(task.deadline).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Achievements Card */}
          <div className="bg-bg-surface border border-border-main rounded-3xl p-6 shadow-sm space-y-3">
            <h3 className="font-semibold text-text-primary flex items-center gap-2">
              <Award size={18} className="text-yellow-500" fill="currentColor" />
              <span>Recent Achievements</span>
            </h3>
            
            <div className="space-y-3 text-xs text-text-secondary">
              {currentStreak >= 3 ? (
                <div className="flex gap-3 items-start">
                  <div className="h-6 w-6 rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Flame size={12} fill="currentColor" />
                  </div>
                  <div>
                    <span className="font-semibold text-text-primary">Consistency Master</span>
                    <p className="text-[10px] text-text-muted">Maintained a focus streak of {currentStreak} days!</p>
                  </div>
                </div>
              ) : null}
              {todayFocusHours >= 2 ? (
                <div className="flex gap-3 items-start">
                  <div className="h-6 w-6 rounded-full bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Timer size={12} />
                  </div>
                  <div>
                    <span className="font-semibold text-text-primary">Deep Focus Block</span>
                    <p className="text-[10px] text-text-muted">Completed over 2 hours of focus sessions today.</p>
                  </div>
                </div>
              ) : null}
              {sessions.filter(s => s.completed).length >= 5 ? (
                <div className="flex gap-3 items-start">
                  <div className="h-6 w-6 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 size={12} />
                  </div>
                  <div>
                    <span className="font-semibold text-text-primary">Productivity Machine</span>
                    <p className="text-[10px] text-text-muted">Completed at least 5 deep work blocks.</p>
                  </div>
                </div>
              ) : null}
              {sessions.filter(s => s.completed).length < 5 && todayFocusHours < 2 && currentStreak < 3 ? (
                <div className="text-text-muted text-xs py-2">
                  Complete your first focus sessions and streaks to unlock achievements.
                </div>
              ) : null}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
