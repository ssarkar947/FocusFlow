import type { Priority, Task, Project } from './types';

/**
 * Calculates the priority of a task based on its deadline, impact, and effort.
 */
export function calculatePriority(
  deadlineStr: string,
  impact: 'High' | 'Medium' | 'Low'
): Priority {
  if (!deadlineStr) return 'Low Priority';

  const deadline = new Date(deadlineStr);
  const now = new Date();
  
  // Set both to start of day to compute full days remaining
  deadline.setHours(0, 0, 0, 0);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffTime = deadline.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysRemaining <= 2 && impact === 'High') {
    return 'Urgent + Important';
  }
  
  if (
    (daysRemaining > 2 && impact === 'High') ||
    (impact === 'Medium' && daysRemaining <= 5)
  ) {
    return 'Important';
  }
  
  if (daysRemaining <= 3) {
    return 'Urgent';
  }
  
  return 'Low Priority';
}

/**
 * Calculates project progress based on completed tasks and their weights.
 */
export function calculateProjectProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  
  const totalWeight = tasks.reduce((sum, task) => sum + (task.weight || 0), 0);
  if (totalWeight === 0) {
    // If no tasks have weights, weigh them equally
    const completedTasksCount = tasks.filter(t => t.status === 'Completed').length;
    return Math.round((completedTasksCount / tasks.length) * 100);
  }
  
  const completedWeight = tasks
    .filter(task => task.status === 'Completed')
    .reduce((sum, task) => sum + (task.weight || 0), 0);
    
  return Math.round((completedWeight / totalWeight) * 100);
}

/**
 * Calculates goal progress based on projects progress.
 */
export function calculateGoalProgress(projects: Project[]): number {
  if (projects.length === 0) return 0;
  
  const sumProgress = projects.reduce((sum, project) => sum + (project.progress || 0), 0);
  return Math.round(sumProgress / projects.length);
}
