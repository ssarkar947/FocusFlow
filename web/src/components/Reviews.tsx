import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Calendar, PenTool } from 'lucide-react';

export const Reviews: React.FC = () => {
  const { dailyReviews, weeklyReviews, saveDailyReview, saveWeeklyReview } = useStore();

  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');

  // Daily Form State
  const [dailyDate, setDailyDate] = useState(new Date().toISOString().split('T')[0]);
  const [wentWell, setWentWell] = useState('');
  const [blocked, setBlocked] = useState('');
  const [biggestWin, setBiggestWin] = useState('');
  const [lessonsLearned, setLessonsLearned] = useState('');
  const [mood, setMood] = useState<number>(3);
  const [energy, setEnergy] = useState<number>(3);

  // Weekly Form State
  const [weeklyDate, setWeeklyDate] = useState(() => {
    // Default to last Sunday
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day; // Adjust to Sunday
    return new Date(d.setDate(diff)).toISOString().split('T')[0];
  });
  const [topAchievement, setTopAchievement] = useState('');
  const [biggestBottleneck, setBiggestBottleneck] = useState('');
  const [nextWeekPlan, setNextWeekPlan] = useState('');

  const handleSaveDaily = (e: React.FormEvent) => {
    e.preventDefault();
    saveDailyReview({
      date: dailyDate,
      wentWell,
      blocked,
      biggestWin,
      lessonsLearned,
      mood,
      energy,
    });
    alert('Daily review saved successfully!');
    setWentWell('');
    setBlocked('');
    setBiggestWin('');
    setLessonsLearned('');
  };

  const handleSaveWeekly = (e: React.FormEvent) => {
    e.preventDefault();
    saveWeeklyReview({
      weekStart: weeklyDate,
      topAchievement,
      biggestBottleneck,
      nextWeekPlan,
      projectsCompleted: [],
      focusHours: 0,
    });
    alert('Weekly review saved successfully!');
    setTopAchievement('');
    setBiggestBottleneck('');
    setNextWeekPlan('');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary mb-1">Reviews Module</h1>
          <p className="text-text-secondary text-sm">Reflect on your metrics. Track blockers, highlight lessons, and plan next actions.</p>
        </div>

        {/* Tab Selector */}
        <div className="bg-bg-muted p-1 rounded-full flex border border-border-main self-start md:self-auto">
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'daily' ? 'bg-bg-surface text-text-primary shadow-xs' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Daily Reviews
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'weekly' ? 'bg-bg-surface text-text-primary shadow-xs' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Weekly Reviews
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form Entry (Takes up 2 spans) */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'daily' ? (
            <div className="bg-bg-surface border border-border-main rounded-3xl p-6 md:p-8 shadow-sm">
              <h3 className="font-semibold text-text-primary mb-6 flex items-center gap-2">
                <PenTool size={18} className="text-accent-main" />
                <span>Today's Daily Review</span>
              </h3>

              <form onSubmit={handleSaveDaily} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-text-secondary">Date</label>
                    <input
                      type="date"
                      required
                      value={dailyDate}
                      onChange={(e) => setDailyDate(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 bg-bg-muted rounded-xl border border-border-main text-xs text-text-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-text-secondary">Mood (1 to 5)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={5}
                      value={mood}
                      onChange={(e) => setMood(Number(e.target.value))}
                      className="w-full mt-1.5 px-3 py-2 bg-bg-muted rounded-xl border border-border-main text-xs text-text-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-text-secondary">Energy (1 to 5)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={5}
                      value={energy}
                      onChange={(e) => setEnergy(Number(e.target.value))}
                      className="w-full mt-1.5 px-3 py-2 bg-bg-muted rounded-xl border border-border-main text-xs text-text-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-secondary">What went well today?</label>
                  <textarea
                    required
                    placeholder="Focus blocks completed, productive talks..."
                    value={wentWell}
                    onChange={(e) => setWentWell(e.target.value)}
                    rows={2}
                    className="w-full mt-1.5 px-3 py-2 bg-bg-muted rounded-xl border border-border-main text-xs text-text-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-secondary">What blocked me?</label>
                  <textarea
                    required
                    placeholder="Distractions, technical bugs, unexpected calls..."
                    value={blocked}
                    onChange={(e) => setBlocked(e.target.value)}
                    rows={2}
                    className="w-full mt-1.5 px-3 py-2 bg-bg-muted rounded-xl border border-border-main text-xs text-text-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-text-secondary">Biggest Win</label>
                    <input
                      type="text"
                      required
                      placeholder="Finished project website design!"
                      value={biggestWin}
                      onChange={(e) => setBiggestWin(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 bg-bg-muted rounded-xl border border-border-main text-xs text-text-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-text-secondary">Lessons Learned</label>
                    <input
                      type="text"
                      required
                      placeholder="Start complex tasks earlier in the morning."
                      value={lessonsLearned}
                      onChange={(e) => setLessonsLearned(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 bg-bg-muted rounded-xl border border-border-main text-xs text-text-primary focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-text-primary hover:bg-opacity-95 text-bg-surface font-semibold rounded-xl text-xs transition-all active:scale-98"
                >
                  Save Daily Log
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-bg-surface border border-border-main rounded-3xl p-6 md:p-8 shadow-sm">
              <h3 className="font-semibold text-text-primary mb-6 flex items-center gap-2">
                <PenTool size={18} className="text-accent-main" />
                <span>Sunday Weekly Review</span>
              </h3>

              <form onSubmit={handleSaveWeekly} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-text-secondary">Week Starting Sunday</label>
                  <input
                    type="date"
                    required
                    value={weeklyDate}
                    onChange={(e) => setWeeklyDate(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 bg-bg-muted rounded-xl border border-border-main text-xs text-text-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-secondary">Top Weekly Achievement</label>
                  <textarea
                    required
                    placeholder="Launched agency homepage draft, got 2 tasks completed ahead of time..."
                    value={topAchievement}
                    onChange={(e) => setTopAchievement(e.target.value)}
                    rows={2}
                    className="w-full mt-1.5 px-3 py-2 bg-bg-muted rounded-xl border border-border-main text-xs text-text-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-secondary">Biggest Bottleneck / Distraction</label>
                  <textarea
                    required
                    placeholder="Spent too much time detailing secondary pages, social media distraction..."
                    value={biggestBottleneck}
                    onChange={(e) => setBiggestBottleneck(e.target.value)}
                    rows={2}
                    className="w-full mt-1.5 px-3 py-2 bg-bg-muted rounded-xl border border-border-main text-xs text-text-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-secondary">Execution Plan for Next Week</label>
                  <textarea
                    required
                    placeholder="Focus strictly on Lead Gen project. Block off 9 AM - 11 AM daily..."
                    value={nextWeekPlan}
                    onChange={(e) => setNextWeekPlan(e.target.value)}
                    rows={2}
                    className="w-full mt-1.5 px-3 py-2 bg-bg-muted rounded-xl border border-border-main text-xs text-text-primary focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-text-primary hover:bg-opacity-95 text-bg-surface font-semibold rounded-xl text-xs transition-all active:scale-98"
                >
                  Save Weekly Plan
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Column: Past Entries List */}
        <div className="bg-bg-surface border border-border-main rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-semibold text-text-primary flex items-center gap-2">
              <Calendar size={18} className="text-accent-main" />
              <span>Past Reflections</span>
            </h3>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {activeTab === 'daily' ? (
                dailyReviews.length === 0 ? (
                  <div className="text-xs text-text-muted italic py-4">No daily logs saved yet.</div>
                ) : (
                  dailyReviews
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((rev) => (
                      <div key={rev.date} className="border-b border-border-main pb-3 last:border-0 last:pb-0 text-xs">
                        <div className="flex justify-between items-center font-bold text-text-primary mb-1">
                          <span>{new Date(rev.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}</span>
                          <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full">
                            Mood: {rev.mood}/5
                          </span>
                        </div>
                        <p className="text-text-secondary leading-snug truncate">
                          <span className="font-semibold">Win:</span> {rev.biggestWin}
                        </p>
                        <p className="text-text-muted mt-0.5 text-[10px]">
                          Task Completion Score: {rev.completionScore}%
                        </p>
                      </div>
                    ))
                )
              ) : (
                weeklyReviews.length === 0 ? (
                  <div className="text-xs text-text-muted italic py-4">No weekly summaries saved yet.</div>
                ) : (
                  weeklyReviews
                    .sort((a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime())
                    .map((rev) => (
                      <div key={rev.weekStart} className="border-b border-border-main pb-3 last:border-0 last:pb-0 text-xs">
                        <div className="flex justify-between items-center font-bold text-text-primary mb-1">
                          <span>Week of {new Date(rev.weekStart).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
                          <span className="text-[10px] text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 px-2 py-0.5 rounded-full">
                            {rev.focusHours}h focused
                          </span>
                        </div>
                        <p className="text-text-secondary leading-snug truncate">
                          <span className="font-semibold">Achievement:</span> {rev.topAchievement}
                        </p>
                      </div>
                    ))
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
