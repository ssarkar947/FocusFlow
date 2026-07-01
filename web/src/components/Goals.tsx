import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Target, Calendar, Edit3, Trash2, FolderDot } from 'lucide-react';
import type { Goal } from '../../../shared/types';

const COLORS = [
  { name: 'Peach', value: '#FF8A7A', bg: 'bg-[#FF8A7A]' },
  { name: 'Sage', value: '#8FAE92', bg: 'bg-[#8FAE92]' },
  { name: 'Amber', value: '#E6A045', bg: 'bg-[#E6A045]' },
  { name: 'Indigo', value: '#6366F1', bg: 'bg-[#6366F1]' },
  { name: 'Emerald', value: '#10B981', bg: 'bg-[#10B981]' },
  { name: 'Rose', value: '#F43F5E', bg: 'bg-[#F43F5E]' },
];

const ICONS = ['🎯', '💡', '🌱', '📈', '🧘', '💻', '💸', '🎨', '🚀'];

export const Goals: React.FC = () => {
  const { goals, projects, addGoal, updateGoal, deleteGoal } = useStore();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [color, setColor] = useState(COLORS[0].value);
  const [icon, setIcon] = useState(ICONS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const goalData = {
      name,
      description,
      deadline: deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days default
      color,
      icon,
    };

    if (editingId) {
      updateGoal(editingId, goalData);
      setEditingId(null);
    } else {
      addGoal(goalData);
    }

    resetForm();
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setDeadline('');
    setColor(COLORS[0].value);
    setIcon(ICONS[0]);
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (goal: Goal) => {
    setName(goal.name);
    setDescription(goal.description);
    setDeadline(goal.deadline);
    setColor(goal.color);
    setIcon(goal.icon);
    setEditingId(goal.id);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this goal? All projects and tasks belonging to this goal will also be deleted.')) {
      deleteGoal(id);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary mb-1">Goals Module</h1>
          <p className="text-text-secondary text-sm">Define your long-term vision. Track progress through execution.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-text-primary hover:bg-opacity-95 text-bg-surface px-4 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1 active:scale-95 shadow-sm"
        >
          <Plus size={16} />
          <span>New Goal</span>
        </button>
      </div>

      {/* Goal Form (Create / Edit) */}
      {isAdding && (
        <div className="bg-bg-surface border border-border-main rounded-3xl p-6 md:p-8 shadow-sm">
          <h3 className="font-semibold text-text-primary mb-6">{editingId ? 'Edit Goal' : 'Create New Goal'}</h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-semibold text-text-secondary">Goal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Launch Grow Agency, Build Healthy Habit"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 bg-bg-muted rounded-xl border border-border-main text-sm text-text-primary focus:outline-none focus:border-text-secondary transition-colors"
                />
              </div>

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
            </div>

            <div>
              <label className="text-xs font-semibold text-text-secondary">Goal Description</label>
              <textarea
                placeholder="What does success look like for this goal?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full mt-1.5 px-3 py-2 bg-bg-muted rounded-xl border border-border-main text-sm text-text-primary focus:outline-none focus:border-text-secondary transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-semibold text-text-secondary">Select Accent Color</label>
                <div className="flex gap-3 mt-2 flex-wrap">
                  {COLORS.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setColor(c.value)}
                      className={`h-8 w-8 rounded-full border-2 ${c.bg} transition-all ${
                        color === c.value ? 'border-text-primary scale-110 shadow-sm' : 'border-transparent hover:scale-105'
                      }`}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-secondary flex items-center gap-1">
                  <span>Select Icon</span>
                </label>
                <div className="flex gap-2.5 mt-2 flex-wrap">
                  {ICONS.map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setIcon(i)}
                      className={`h-8 w-8 text-lg rounded-lg bg-bg-muted hover:bg-border-main flex items-center justify-center transition-all ${
                        icon === i ? 'bg-border-main border border-text-muted scale-110' : ''
                      }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
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
                {editingId ? 'Save Changes' : 'Create Goal'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="bg-bg-surface border border-border-main rounded-3xl p-12 text-center shadow-xs">
          <div className="h-16 w-16 rounded-full bg-bg-muted flex items-center justify-center mx-auto mb-4 text-text-muted">
            <Target size={32} />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-1">No goals set</h3>
          <p className="text-text-secondary text-sm max-w-sm mx-auto mb-6">
            FocusFlow begins with a destination. Set your first goal to create related projects and track execution.
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="px-5 py-2.5 bg-text-primary hover:bg-opacity-95 text-bg-surface text-sm font-semibold rounded-full shadow-sm"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const goalProjects = projects.filter((p) => p.goalId === goal.id);
            return (
              <div
                key={goal.id}
                className="bg-bg-surface border border-border-main rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden"
              >
                {/* Accent Color Band */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: goal.color }}
                />

                <div className="space-y-4">
                  {/* Title & Icon Header */}
                  <div className="flex justify-between items-start pt-1">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl h-10 w-10 bg-bg-muted rounded-xl flex items-center justify-center">
                        {goal.icon}
                      </span>
                      <div>
                        <h3 className="font-bold text-lg text-text-primary">{goal.name}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-text-muted mt-0.5">
                          <Calendar size={12} />
                          <span>By {new Date(goal.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(goal)}
                        className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-muted rounded-lg transition-colors"
                        title="Edit goal"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(goal.id)}
                        className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                        title="Delete goal"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Goal Description */}
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {goal.description || 'No description provided.'}
                  </p>

                  {/* Progress Indicator */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-text-secondary">
                      <span>Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-bg-muted h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${goal.progress}%`,
                          backgroundColor: goal.color,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Sub-projects list */}
                <div className="mt-5 pt-4 border-t border-border-main space-y-2">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-text-muted flex items-center gap-1">
                    <FolderDot size={12} />
                    <span>Projects ({goalProjects.length})</span>
                  </div>

                  {goalProjects.length === 0 ? (
                    <div className="text-[11px] text-text-muted italic py-1">No active projects assigned.</div>
                  ) : (
                    <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                      {goalProjects.map((proj) => (
                        <div key={proj.id} className="flex justify-between items-center text-xs bg-bg-muted/30 border border-border-main px-3 py-1.5 rounded-xl">
                          <span className="font-medium text-text-primary truncate max-w-[180px]">{proj.name}</span>
                          <span className="text-[10px] font-semibold text-text-secondary bg-bg-surface border border-border-main px-1.5 py-0.5 rounded-md">
                            {proj.progress}% Done
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
