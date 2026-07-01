import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Play, Pause, CheckCircle, AlertTriangle, Coffee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const FocusTimer: React.FC = () => {
  const { 
    sessions, 
    tasks, 
    pauseFocusSession, 
    resumeFocusSession, 
    endFocusSession, 
    incrementInterruption,
    settings 
  } = useStore();

  const activeSession = sessions[sessions.length - 1];
  const isTimerActive = !!(activeSession && !activeSession.completed);
  
  const currentTask = tasks.find(t => t.id === activeSession?.taskId);
  
  // Custom or default focus duration in seconds
  const defaultDurationSec = (settings?.defaultFocusDuration || 25) * 60;
  
  const [timeLeft, setTimeLeft] = useState(defaultDurationSec);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  
  const timerRef = useRef<any>(null);

  // Sync isPaused with activeSession break state
  const breaks = activeSession?.breaks || [];
  const lastBreak = breaks[breaks.length - 1];
  const activeSessionPaused = lastBreak && !lastBreak.end;

  // Reset time left when activeSession changes
  useEffect(() => {
    if (isTimerActive) {
      setTimeLeft(defaultDurationSec);
      setSessionCompleted(false);
    }
  }, [activeSession?.id, defaultDurationSec, isTimerActive]);

  useEffect(() => {
    if (!isTimerActive) return;
    setIsPaused(!!activeSessionPaused);
  }, [activeSessionPaused, isTimerActive]);

  useEffect(() => {
    if (!isTimerActive) return;
    if (!isPaused && timeLeft > 0 && !sessionCompleted) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, timeLeft, sessionCompleted, isTimerActive]);

  const handleTimerComplete = () => {
    // Play completion sound
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4 note
      gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.log('Audio playback block or not supported', e);
    }
    
    setSessionCompleted(true);
  };

  const handleTogglePlay = () => {
    if (isPaused) {
      resumeFocusSession();
    } else {
      pauseFocusSession();
    }
  };

  const handleCompleteSession = (taskCompleted: boolean) => {
    endFocusSession(taskCompleted);
    setSessionCompleted(false);
    setTimeLeft(defaultDurationSec);
  };

  const handleCancelSession = () => {
    if (confirm('Cancel this focus session? No progress will be saved.')) {
      endFocusSession(false);
      setSessionCompleted(false);
      setTimeLeft(defaultDurationSec);
    }
  };

  // Only return UI after ALL hooks have been registered to avoid React hooks errors
  if (!isTimerActive) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Percentage elapsed for circular outline
  const percentage = ((defaultDurationSec - timeLeft) / defaultDurationSec) * 100;
  
  return (
    <div className="fixed inset-0 bg-bg-base z-50 flex flex-col items-center justify-between p-8 md:p-16">
      {/* Header */}
      <div className="w-full max-w-4xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
          <span className="text-sm font-medium tracking-wide uppercase text-text-secondary">Focusing Mode</span>
        </div>
        <button 
          onClick={handleCancelSession}
          className="text-sm px-4 py-2 rounded-full border border-border-main hover:bg-bg-muted transition-colors text-text-secondary font-medium"
        >
          Cancel Session
        </button>
      </div>

      {/* Main Focus Center */}
      <div className="flex flex-col items-center justify-center flex-grow py-8 max-w-lg w-full">
        {currentTask && (
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-text-primary mb-2">
              {currentTask.name}
            </h2>
            <p className="text-sm text-text-muted">
              {currentTask.description || 'Distraction-free focus'}
            </p>
          </div>
        )}

        {/* Circular Display */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center mb-12">
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              className="stroke-bg-muted fill-none"
              strokeWidth="4"
            />
            {/* Foreground progress */}
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              className="stroke-accent-main fill-none"
              strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 144}`}
              strokeDashoffset={`${2 * Math.PI * 144 * (1 - percentage / 100)}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
            />
          </svg>
          <div className="flex flex-col items-center justify-center z-10">
            <span className="text-5xl md:text-6xl font-bold tracking-tighter tabular-nums text-text-primary">
              {formatTime(timeLeft)}
            </span>
            <span className="text-xs uppercase tracking-widest text-text-muted mt-2">
              {isPaused ? 'Paused' : 'Remaining'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6">
          <button
            onClick={handleTogglePlay}
            disabled={sessionCompleted}
            className={`h-14 w-14 rounded-full flex items-center justify-center text-white transition-all shadow-md active:scale-95 ${
              isPaused 
                ? 'bg-accent-main hover:bg-opacity-90' 
                : 'bg-text-primary hover:bg-opacity-90'
            }`}
          >
            {isPaused ? <Play size={24} /> : <Pause size={24} />}
          </button>
          
          <button
            onClick={incrementInterruption}
            className="flex items-center gap-2 px-4 py-3 rounded-full border border-border-main hover:bg-bg-muted text-sm text-text-secondary font-medium transition-all"
            title="Log an external distraction/interruption"
          >
            <AlertTriangle size={16} />
            <span>Distraction ({activeSession.interruptionsCount})</span>
          </button>

          <button
            onClick={() => handleCompleteSession(true)}
            className="h-14 w-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-all shadow-md active:scale-95"
            title="Complete Task and Session"
          >
            <CheckCircle size={24} />
          </button>
        </div>
      </div>

      {/* Completion Modal / Modal overlay */}
      <AnimatePresence>
        {sessionCompleted && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-bg-surface border border-border-main p-8 rounded-2xl max-w-md w-full text-center shadow-xl"
            >
              <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <Coffee size={24} />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">Focus Session Completed!</h3>
              <p className="text-sm text-text-secondary mb-6">
                Excellent work. You completed your focus block. How would you like to update your task progress?
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleCompleteSession(true)}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-all shadow-sm"
                >
                  Mark Task as Complete
                </button>
                <button
                  onClick={() => handleCompleteSession(false)}
                  className="w-full py-3 border border-border-main hover:bg-bg-muted text-text-primary font-medium rounded-xl transition-all"
                >
                  Keep Task In-Progress (Take Break)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Footer message */}
      <div className="text-xs text-text-muted tracking-wide max-w-sm text-center">
        Keep FocusFlow running. Switch tabs or minimize. Your progress is sync'd in real-time.
      </div>
    </div>
  );
};
