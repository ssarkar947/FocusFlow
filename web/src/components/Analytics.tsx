import React from 'react';
import { useStore } from '../store/useStore';
import { Calendar, Timer, CheckCircle, BarChart3, TrendingUp, Hourglass } from 'lucide-react';

export const Analytics: React.FC = () => {
  const { tasks, sessions } = useStore();

  const completedTasks = tasks.filter(t => t.status === 'Completed');

  // Total Focus Hours
  const totalFocusSec = sessions.reduce((sum, s) => sum + s.duration, 0);
  const totalFocusHours = parseFloat((totalFocusSec / 3600).toFixed(1));

  // Focus sessions count
  const completedSessions = sessions.filter(s => s.completed);
  const totalSessionsCount = sessions.length;
  
  // Averages & Highs
  const avgSessionMin = completedSessions.length > 0
    ? Math.round((completedSessions.reduce((sum, s) => sum + s.duration, 0) / completedSessions.length) / 60)
    : 0;

  const longestSessionMin = sessions.length > 0
    ? Math.round(Math.max(...sessions.map(s => s.duration)) / 60)
    : 0;

  // Productivity Score: Focus sessions completed / started * 100 + Task completion rate
  const sessionSuccessRate = totalSessionsCount > 0 
    ? (completedSessions.length / totalSessionsCount) * 100 
    : 100;
    
  const taskCompletionRate = tasks.length > 0
    ? (completedTasks.length / tasks.length) * 100
    : 100;

  const productivityScore = Math.round((sessionSuccessRate * 0.4) + (taskCompletionRate * 0.6));

  // GitHub-style heatmap (Past 12 Weeks)
  const getHeatmapData = () => {
    const data: { [key: string]: number } = {};
    sessions.forEach(s => {
      const dateStr = s.startTime.split('T')[0];
      data[dateStr] = (data[dateStr] || 0) + s.duration;
    });

    const weeks = [];
    const today = new Date();
    // Start from 12 weeks ago (aligned to Sunday)
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 12 * 7);
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek); // Go back to Sunday

    const currentDate = new Date(startDate);
    
    // Create grid: 7 rows (days), 13 columns (weeks)
    for (let day = 0; day < 7; day++) {
      const row = [];
      const rowDate = new Date(currentDate);
      rowDate.setDate(rowDate.getDate() + day);

      for (let week = 0; week < 13; week++) {
        const d = new Date(rowDate);
        d.setDate(d.getDate() + week * 7);
        const dateStr = d.toISOString().split('T')[0];
        const focusTimeSec = data[dateStr] || 0;
        
        row.push({
          date: dateStr,
          focusTime: focusTimeSec,
          intensity: focusTimeSec === 0 ? 0 :
                     focusTimeSec < 1500 ? 1 : // < 25 min
                     focusTimeSec < 3600 ? 2 : // < 1 hour
                     focusTimeSec < 7200 ? 3 : 4, // < 2 hours or more
        });
      }
      weeks.push(row);
    }
    return weeks;
  };

  const heatmapGrid = getHeatmapData();

  // Focus trends: Past 7 days focus hours
  const getLast7DaysStats = () => {
    const stats = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const daySessions = sessions.filter(s => s.startTime.startsWith(dateStr));
      const daySec = daySessions.reduce((sum, s) => sum + s.duration, 0);
      const dayHours = parseFloat((daySec / 3600).toFixed(1));
      
      stats.push({
        label: d.toLocaleDateString(undefined, { weekday: 'short' }),
        hours: dayHours,
      });
    }
    return stats;
  };

  const last7DaysStats = getLast7DaysStats();
  const maxHours = Math.max(...last7DaysStats.map(s => s.hours), 1); // Avoid division by zero

  return (
    <div className="space-y-10 max-w-5xl mx-auto py-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary mb-1">Analytics Dashboard</h1>
        <p className="text-text-secondary text-sm">Measure focus depth. Understand execution consistency over time.</p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-bg-surface border border-border-main p-5 rounded-2xl shadow-sm space-y-2">
          <div className="flex justify-between items-center text-text-muted">
            <span className="text-xs font-semibold">Total Focus Time</span>
            <Timer size={16} />
          </div>
          <div className="text-2xl font-bold text-text-primary">{totalFocusHours}h</div>
          <p className="text-[10px] text-text-muted">Accumulated deep work</p>
        </div>

        <div className="bg-bg-surface border border-border-main p-5 rounded-2xl shadow-sm space-y-2">
          <div className="flex justify-between items-center text-text-muted">
            <span className="text-xs font-semibold">Productivity Score</span>
            <TrendingUp size={16} />
          </div>
          <div className="text-2xl font-bold text-text-primary">{productivityScore}%</div>
          <p className="text-[10px] text-text-muted">Weighted execution index</p>
        </div>

        <div className="bg-bg-surface border border-border-main p-5 rounded-2xl shadow-sm space-y-2">
          <div className="flex justify-between items-center text-text-muted">
            <span className="text-xs font-semibold">Tasks Completed</span>
            <CheckCircle size={16} />
          </div>
          <div className="text-2xl font-bold text-text-primary">{completedTasks.length}</div>
          <p className="text-[10px] text-text-muted">Out of {tasks.length} tasks registered</p>
        </div>

        <div className="bg-bg-surface border border-border-main p-5 rounded-2xl shadow-sm space-y-2">
          <div className="flex justify-between items-center text-text-muted">
            <span className="text-xs font-semibold">Average Block</span>
            <Hourglass size={16} />
          </div>
          <div className="text-2xl font-bold text-text-primary">{avgSessionMin}m</div>
          <p className="text-[10px] text-text-muted">Longest block: {longestSessionMin}m</p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Weekly Focus Hours Chart (Left Column) */}
        <div className="lg:col-span-2 bg-bg-surface border border-border-main rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="font-semibold text-text-primary flex items-center gap-2">
            <BarChart3 size={18} className="text-accent-main" />
            <span>Weekly Focus Trend (Past 7 Days)</span>
          </h3>

          <div className="h-64 flex items-end justify-between gap-4 pt-4 px-2">
            {last7DaysStats.map((stat, idx) => {
              const pct = (stat.hours / maxHours) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-3 group">
                  <div className="text-xs font-semibold text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                    {stat.hours}h
                  </div>
                  <div className="w-full bg-bg-muted rounded-xl h-44 flex items-end overflow-hidden">
                    <div 
                      className="w-full bg-accent-main hover:bg-opacity-90 rounded-t-lg transition-all"
                      style={{ height: `${Math.max(4, pct)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                    {stat.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Heatmap Grid (Right Column / Full width below) */}
        <div className="bg-bg-surface border border-border-main rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-semibold text-text-primary flex items-center gap-2">
              <Calendar size={18} className="text-accent-main" />
              <span>Activity Grid</span>
            </h3>
            <p className="text-xs text-text-secondary">
              A record of focus blocks completed over the past 12 weeks. Green intensities represent longer focus periods.
            </p>
          </div>

          {/* Activity Heatmap Grid */}
          <div className="flex gap-2 items-center justify-center py-4 select-none">
            {/* Days Column */}
            <div className="flex flex-col justify-between text-[9px] font-semibold text-text-muted h-28 pr-1 py-1">
              <span>S</span>
              <span>M</span>
              <span>T</span>
              <span>W</span>
              <span>T</span>
              <span>F</span>
              <span>S</span>
            </div>

            {/* Grid */}
            <div className="grid grid-flow-col gap-1.5 h-28">
              {heatmapGrid.map((row, rIdx) => (
                <div key={rIdx} className="flex flex-col gap-1.5 justify-between">
                  {row.map((cell, cIdx) => (
                    <div
                      key={cIdx}
                      className={`h-2.5 w-2.5 rounded-xs transition-colors cursor-pointer ${
                        cell.intensity === 0 ? 'bg-bg-muted hover:bg-border-main' :
                        cell.intensity === 1 ? 'bg-emerald-200 dark:bg-emerald-900/30' :
                        cell.intensity === 2 ? 'bg-emerald-400 dark:bg-emerald-800/60' :
                        cell.intensity === 3 ? 'bg-emerald-600 dark:bg-emerald-700/80' :
                        'bg-emerald-700 dark:bg-emerald-500'
                      }`}
                      title={`${cell.date}: ${parseFloat((cell.focusTime / 3600).toFixed(2))}h focused`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end items-center gap-1.5 text-[9px] font-bold text-text-muted uppercase tracking-wider mt-2 pt-2 border-t border-border-main">
            <span>Less</span>
            <div className="h-2 w-2 rounded-xs bg-bg-muted" />
            <div className="h-2 w-2 rounded-xs bg-emerald-200 dark:bg-emerald-900/30" />
            <div className="h-2 w-2 rounded-xs bg-emerald-400 dark:bg-emerald-800/60" />
            <div className="h-2 w-2 rounded-xs bg-emerald-600" />
            <div className="h-2 w-2 rounded-xs bg-emerald-700 dark:bg-emerald-500" />
            <span>More</span>
          </div>
        </div>

      </div>
    </div>
  );
};
