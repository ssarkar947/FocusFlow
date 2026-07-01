import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Calendar, Edit3, Trash2, FolderCheck } from 'lucide-react';
import type { Project, ProjectStatus, Priority } from '../../../shared/types';

export const Projects: React.FC = () => {
  const { goals, projects, tasks, addProject, updateProject, deleteProject } = useStore();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [goalId, setGoalId] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<Priority>('Important');
  const [status, setStatus] = useState<ProjectStatus>('Planning');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !goalId) return;

    const projectData = {
      name,
      description,
      goalId,
      deadline: deadline || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days default
      priority,
      status,
    };

    if (editingId) {
      updateProject(editingId, projectData);
      setEditingId(null);
    } else {
      addProject(projectData);
    }

    resetForm();
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setGoalId('');
    setDeadline('');
    setPriority('Important');
    setStatus('Planning');
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (proj: Project) => {
    setName(proj.name);
    setDescription(proj.description || '');
    setGoalId(proj.goalId);
    setDeadline(proj.deadline);
    setPriority(proj.priority);
    setStatus(proj.status);
    setEditingId(proj.id);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this project? All associated tasks will also be deleted.')) {
      deleteProject(id);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary mb-1">Projects Module</h1>
          <p className="text-text-secondary text-sm">Organize execution. Manage timelines, priorities and task progress.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-text-primary hover:bg-opacity-95 text-bg-surface px-4 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1 active:scale-95 shadow-sm"
        >
          <Plus size={16} />
          <span>New Project</span>
        </button>
      </div>

      {/* Project Form (Create / Edit) */}
      {isAdding && (
        <div className="bg-bg-surface border border-border-main rounded-3xl p-6 md:p-8 shadow-sm">
          <h3 className="font-semibold text-text-primary mb-6">{editingId ? 'Edit Project' : 'Create New Project'}</h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-semibold text-text-secondary">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design Portfolio, Launch Campaign"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 bg-bg-muted rounded-xl border border-border-main text-sm text-text-primary focus:outline-none focus:border-text-secondary transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-secondary">Parent Goal</label>
                <select
                  required
                  value={goalId}
                  onChange={(e) => setGoalId(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 bg-bg-muted rounded-xl border border-border-main text-sm text-text-primary focus:outline-none focus:border-text-secondary transition-colors"
                >
                  <option value="">Select a Goal...</option>
                  {goals.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-text-secondary">Project Description</label>
              <textarea
                placeholder="What objectives does this project solve?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full mt-1.5 px-3 py-2 bg-bg-muted rounded-xl border border-border-main text-sm text-text-primary focus:outline-none focus:border-text-secondary transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="text-xs font-semibold text-text-secondary">Target Date / Deadline</label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 bg-bg-muted rounded-xl border border-border-main text-sm text-text-primary focus:outline-none focus:border-text-secondary transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-secondary">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full mt-1.5 px-3 py-2 bg-bg-muted rounded-xl border border-border-main text-sm text-text-primary focus:outline-none"
                >
                  <option value="Urgent + Important">Urgent + Important</option>
                  <option value="Important">Important</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Low Priority">Low Priority</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-secondary">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                  className="w-full mt-1.5 px-3 py-2 bg-bg-muted rounded-xl border border-border-main text-sm text-text-primary focus:outline-none"
                >
                  <option value="Planning">Planning</option>
                  <option value="In Progress">In Progress</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
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
                {editingId ? 'Save Changes' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="bg-bg-surface border border-border-main rounded-3xl p-12 text-center shadow-xs">
          <div className="h-16 w-16 rounded-full bg-bg-muted flex items-center justify-center mx-auto mb-4 text-text-muted">
            <FolderCheck size={32} />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-1">No projects set</h3>
          <p className="text-text-secondary text-sm max-w-sm mx-auto mb-6">
            Add a project and map it to a goal. Define deadlines, set priority, and add execution tasks.
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="px-5 py-2.5 bg-text-primary hover:bg-opacity-95 text-bg-surface text-sm font-semibold rounded-full shadow-sm"
          >
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => {
            const parentGoal = goals.find((g) => g.id === proj.goalId);
            const projectTasks = tasks.filter((t) => t.projectId === proj.id && t.status !== 'Archived');
            const projectCompletedTasks = projectTasks.filter((t) => t.status === 'Completed');
            
            return (
              <div
                key={proj.id}
                className="bg-bg-surface border border-border-main rounded-3xl p-5 shadow-sm flex flex-col justify-between relative"
              >
                <div className="space-y-4">
                  {/* Goal and Tag Header */}
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-text-muted">
                    <span 
                      className="px-2 py-0.5 rounded-full"
                      style={{ 
                        backgroundColor: `${parentGoal?.color || '#e7e5e4'}20`, 
                        color: parentGoal?.color || '#78716c' 
                      }}
                    >
                      {parentGoal?.name || 'Unlinked Goal'}
                    </span>
                    
                    <span className={`px-2 py-0.5 rounded-full ${
                      proj.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' :
                      proj.status === 'In Progress' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20' :
                      proj.status === 'On Hold' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20' :
                      'bg-stone-100 text-stone-600 dark:bg-stone-800'
                    }`}>
                      {proj.status}
                    </span>
                  </div>

                  {/* Title & Edit Row */}
                  <div className="flex justify-between items-start pt-1">
                    <div>
                      <h3 className="font-bold text-base text-text-primary leading-snug">{proj.name}</h3>
                      <div className="flex items-center gap-1 text-[11px] text-text-muted mt-1">
                        <Calendar size={11} />
                        <span>Due {new Date(proj.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => handleEdit(proj)}
                        className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-bg-muted rounded-lg transition-colors"
                        title="Edit project"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(proj.id)}
                        className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                        title="Delete project"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Project Description */}
                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                    {proj.description || 'No description provided.'}
                  </p>

                  {/* Progress & Task Ratio */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-text-secondary">
                      <span>Tasks: {projectCompletedTasks.length}/{projectTasks.length}</span>
                      <span>{proj.progress}%</span>
                    </div>
                    <div className="w-full bg-bg-muted h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${proj.progress}%`,
                          backgroundColor: parentGoal?.color || 'var(--accent-main)',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Details */}
                <div className="mt-4 pt-3 border-t border-border-main flex justify-between items-center text-[10px] font-semibold text-text-secondary">
                  <span>Priority</span>
                  <span className={`px-2 py-0.5 rounded-full ${
                    proj.priority === 'Urgent + Important' ? 'bg-red-50 text-red-600 dark:bg-red-950/20' :
                    proj.priority === 'Important' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20' :
                    proj.priority === 'Urgent' ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/20' :
                    'bg-stone-100 text-stone-600 dark:bg-stone-800'
                  }`}>
                    {proj.priority}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
