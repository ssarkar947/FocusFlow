import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Play, CheckCircle, Trash2, Copy, Archive, Filter, Tag, Calendar, Timer, AlertCircle } from 'lucide-react';
import type { Task } from '../../../shared/types';

export const Tasks: React.FC = () => {
  const { 
    projects, 
    tasks, 
    addTask, 
    updateTask, 
    toggleTaskCompletion, 
    deleteTask, 
    duplicateTask,
    startFocusSession 
  } = useStore();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [deadline, setDeadline] = useState('');
  const [estimatedTime, setEstimatedTime] = useState(25);
  const [impact, setImpact] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [weight, setWeight] = useState(10);
  const [tagsInput, setTagsInput] = useState('');

  // Filter State
  const [filterProjectId, setFilterProjectId] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Todo');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !projectId) return;

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t !== '');

    const taskData = {
      projectId,
      name,
      description,
      deadline: deadline || new Date().toISOString().split('T')[0],
      estimatedTime: Number(estimatedTime),
      impact,
      weight: Number(weight),
      tags,
      notes: '',
      isRecurring: false,
    };

    if (editingId) {
      updateTask(editingId, taskData);
      setEditingId(null);
    } else {
      addTask(taskData);
    }

    resetForm();
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setProjectId('');
    setDeadline('');
    setEstimatedTime(25);
    setImpact('Medium');
    setWeight(10);
    setTagsInput('');
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (task: Task) => {
    setName(task.name);
    setDescription(task.description || '');
    setProjectId(task.projectId);
    setDeadline(task.deadline);
    setEstimatedTime(task.estimatedTime);
    setImpact(task.impact);
    setWeight(task.weight);
    setTagsInput(task.tags.join(', '));
    setEditingId(task.id);
    setIsAdding(true);
  };

  const handleArchive = (id: string) => {
    updateTask(id, { status: 'Archived' });
  };

  const filteredTasks = tasks.filter(t => {
    const matchProject = !filterProjectId || t.projectId === filterProjectId;
    const matchPriority = !filterPriority || t.priority === filterPriority;
    const matchStatus = !filterStatus || t.status === filterStatus;
    return matchProject && matchPriority && matchStatus;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary mb-1">Tasks Module</h1>
          <p className="text-text-secondary text-sm">Create work blocks. Priorities are assigned automatically based on impact and deadlines.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-text-primary hover:bg-opacity-95 text-bg-surface px-4 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1 active:scale-95 shadow-sm"
        >
          <Plus size={16} />
          <span>New Task</span>
        </button>
      </div>

      {/* Task Form (Create / Edit) */}
      {isAdding && (
        <div className="bg-bg-surface border border-border-main rounded-3xl p-6 md:p-8 shadow-sm">
          <h3 className="font-semibold text-text-primary mb-6">{editingId ? 'Edit Task' : 'Create New Task'}</h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-semibold text-text-secondary">Task Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Code auth forms, write proposal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 bg-bg-muted rounded-xl border border-border-main text-sm text-text-primary focus:outline-none focus:border-text-secondary transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-secondary">Parent Project</label>
                <select
                  required
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 bg-bg-muted rounded-xl border border-border-main text-sm text-text-primary focus:outline-none focus:border-text-secondary transition-colors"
                >
                  <option value="">Select a Project...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-text-secondary">Task Description</label>
              <textarea
                placeholder="What exactly needs to be completed?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full mt-1.5 px-3 py-2 bg-bg-muted rounded-xl border border-border-main text-sm text-text-primary focus:outline-none focus:border-text-secondary transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-text-secondary">Deadline</label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 bg-bg-muted rounded-xl border border-border-main text-sm text-text-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-secondary">Expected Impact</label>
                <select
                  value={impact}
                  onChange={(e) => setImpact(e.target.value as any)}
                  className="w-full mt-1.5 px-3 py-2 bg-bg-muted rounded-xl border border-border-main text-sm text-text-primary focus:outline-none"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-secondary">Est. Time (Mins)</label>
                <input
                  type="number"
                  required
                  min={5}
                  step={5}
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(Number(e.target.value))}
                  className="w-full mt-1.5 px-3 py-2 bg-bg-muted rounded-xl border border-border-main text-sm text-text-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-secondary">Progress Weight (%)</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={100}
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full mt-1.5 px-3 py-2 bg-bg-muted rounded-xl border border-border-main text-sm text-text-primary focus:outline-none"
                  title="How much does this task affect project completion? (e.g. 10% or 40%)"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-text-secondary">Tags (Comma-separated)</label>
              <input
                type="text"
                placeholder="e.g. frontend, design, marketing"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 bg-bg-muted rounded-xl border border-border-main text-sm text-text-primary focus:outline-none focus:border-text-secondary transition-colors"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border-main">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-border-main hover:bg-bg-muted text-text-secondary text-sm font-semibold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-text-primary hover:bg-opacity-95 text-bg-surface text-sm font-semibold rounded-xl transition-all"
              >
                {editingId ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtering Bar */}
      <div className="bg-bg-surface border border-border-main rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-secondary">
          <Filter size={16} />
          <span>Filters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto md:flex-grow max-w-2xl justify-end">
          <select
            value={filterProjectId}
            onChange={(e) => setFilterProjectId(e.target.value)}
            className="px-3 py-2 bg-bg-muted rounded-xl border border-border-main text-xs text-text-primary focus:outline-none"
          >
            <option value="">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 bg-bg-muted rounded-xl border border-border-main text-xs text-text-primary focus:outline-none"
          >
            <option value="">All Priorities</option>
            <option value="Urgent + Important">Urgent + Important</option>
            <option value="Important">Important</option>
            <option value="Urgent">Urgent</option>
            <option value="Low Priority">Low Priority</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-bg-muted rounded-xl border border-border-main text-xs text-text-primary focus:outline-none"
          >
            <option value="Todo">Todo / In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Archived">Archived</option>
            <option value="">All Statuses</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-bg-surface border border-border-main rounded-2xl p-8 text-center text-xs text-text-muted">
            No tasks match your filters.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const project = projects.find(p => p.id === task.projectId);
            return (
              <div
                key={task.id}
                className={`bg-bg-surface border rounded-2xl p-4 shadow-sm hover:border-text-secondary transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                  task.status === 'Completed' ? 'opacity-70 bg-bg-muted/10' : ''
                }`}
              >
                <div className="space-y-1.5 flex-grow">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => toggleTaskCompletion(task.id)}
                      className="text-text-secondary hover:text-emerald-600 transition-colors"
                      title={task.status === 'Completed' ? 'Mark Incomplete' : 'Mark Complete'}
                    >
                      {task.status === 'Completed' ? (
                        <CheckCircle className="text-emerald-600" size={18} />
                      ) : (
                        <div className="h-[18px] w-[18px] border-2 border-text-secondary hover:border-emerald-600 rounded-full" />
                      )}
                    </button>
                    
                    <span className={`font-semibold text-sm ${task.status === 'Completed' ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                      {task.name}
                    </span>

                    {task.isSavedLink && (
                      <a
                        href={task.linkUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 px-2 py-0.5 rounded-full hover:underline truncate max-w-[150px]"
                      >
                        Saved Link
                      </a>
                    )}
                  </div>

                  <p className="text-xs text-text-secondary max-w-xl pl-7">
                    {task.description || 'No description provided.'}
                  </p>

                  <div className="flex items-center gap-3 pl-7 text-[10px] text-text-muted flex-wrap">
                    <span className="font-semibold text-text-secondary bg-bg-muted px-2 py-0.5 rounded-md">
                      {project?.name || 'Unassigned Project'}
                    </span>

                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      <span>{new Date(task.deadline).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
                    </span>

                    <span className="flex items-center gap-1">
                      <Timer size={11} />
                      <span>Est: {task.estimatedTime}m / Act: {task.actualTime}m</span>
                    </span>

                    <span className="flex items-center gap-1">
                      <AlertCircle size={11} />
                      <span>Weight: {task.weight}%</span>
                    </span>

                    {task.tags.map(t => (
                      <span key={t} className="flex items-center gap-0.5 bg-bg-muted px-1.5 py-0.5 rounded text-text-secondary">
                        <Tag size={8} />
                        <span>{t}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right side buttons */}
                <div className="flex items-center gap-2 pl-7 sm:pl-0 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-border-main">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    task.priority === 'Urgent + Important' ? 'bg-red-50 text-red-600 dark:bg-red-950/20' :
                    task.priority === 'Important' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20' :
                    task.priority === 'Urgent' ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/20' :
                    'bg-stone-100 text-stone-600 dark:bg-stone-800'
                  }`}>
                    {task.priority}
                  </span>

                  {task.status !== 'Completed' && task.status !== 'Archived' && (
                    <button
                      onClick={() => startFocusSession(task.id)}
                      className="px-3 py-1.5 rounded-full bg-accent-main text-white font-medium text-xs hover:bg-opacity-90 transition-all flex items-center gap-1 active:scale-95 shadow-sm"
                    >
                      <Play size={10} fill="currentColor" />
                      <span>Focus</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleEdit(task)}
                    className="p-1.5 border border-border-main hover:bg-bg-muted text-text-secondary rounded-lg transition-colors"
                    title="Edit task"
                  >
                    <Plus className="rotate-45" size={13} />
                  </button>

                  <button
                    onClick={() => duplicateTask(task.id)}
                    className="p-1.5 border border-border-main hover:bg-bg-muted text-text-secondary rounded-lg transition-colors"
                    title="Duplicate task"
                  >
                    <Copy size={13} />
                  </button>

                  {task.status !== 'Archived' ? (
                    <>
                      <button
                        onClick={() => handleArchive(task.id)}
                        className="p-1.5 border border-border-main hover:bg-bg-muted text-text-secondary rounded-lg transition-colors"
                        title="Archive task"
                      >
                        <Archive size={13} />
                      </button>
                      <button
                        onClick={() => { if (confirm('Delete this task?')) deleteTask(task.id); }}
                        className="p-1.5 border border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded-lg transition-colors"
                        title="Delete task"
                      >
                        <Trash2 size={13} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1.5 border border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded-lg transition-colors"
                      title="Delete permanently"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
