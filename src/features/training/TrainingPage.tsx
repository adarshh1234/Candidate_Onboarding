import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  Award,
  Video,
} from 'lucide-react';
import { useOnboardingStore } from '@/store/onboarding.store';
import { PageHeader } from '@/components/layout/PageHeader';
import { StepFooter } from '@/components/layout/StepFooter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { ProgressRing } from '@/components/common/ProgressRing';
import { toast } from '@/components/ui/toast';
import { StatusBadge } from '@/components/common/StatusBadge';
import { TrainingModule } from '@/types';

export const TrainingPage: React.FC = () => {
  const stepStatus = useOnboardingStore((state) => state.stepStatus);
  const trainingModules = useOnboardingStore((state) => state.trainingModules);
  const updateTrainingProgress = useOnboardingStore((state) => state.updateTrainingProgress);

  const [activeModule, setActiveModule] = useState<TrainingModule | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [simulatedSeconds, setSimulatedSeconds] = useState<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalModules = trainingModules.length;
  const completedModules = trainingModules.filter((m) => m.isCompleted).length;
  const totalProgress = Math.round(
    trainingModules.reduce((acc, curr) => acc + curr.progress, 0) / totalModules,
  );

  const handleOpenModule = (mod: TrainingModule) => {
    setActiveModule(mod);
    setSimulatedSeconds(Math.round((mod.progress / 100) * mod.videoDurationSeconds));
    setIsPlaying(false);
  };

  const handleCloseDialog = () => {
    if (activeModule) {
      const progress = Math.min(
        100,
        Math.round((simulatedSeconds / activeModule.videoDurationSeconds) * 100),
      );
      updateTrainingProgress(activeModule.id, progress);
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsPlaying(false);
    setActiveModule(null);
  };

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  // Video playback simulation
  useEffect(() => {
    if (isPlaying && activeModule) {
      intervalRef.current = setInterval(() => {
        setSimulatedSeconds((prev) => {
          if (prev >= activeModule.videoDurationSeconds) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsPlaying(false);
            updateTrainingProgress(activeModule.id, 100, true);
            toast.success('Module Finished!', `You completed: ${activeModule.title}`);
            return activeModule.videoDurationSeconds;
          }
          const nextSec = prev + 5; // Fast simulation: 5s jump each interval
          const progress = Math.min(
            100,
            Math.round((nextSec / activeModule.videoDurationSeconds) * 100),
          );
          updateTrainingProgress(activeModule.id, progress);
          return nextSec;
        });
      }, 500);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, activeModule, updateTrainingProgress]);

  const handleMarkModuleComplete = () => {
    if (activeModule) {
      updateTrainingProgress(activeModule.id, 100, true);
      setSimulatedSeconds(activeModule.videoDurationSeconds);
      setIsPlaying(false);
      toast.success('Marked Completed', `Module "${activeModule.title}" marked finished.`);
    }
  };

  const formatVideoTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        stepId="training"
        title="Orientation & Foundations"
        description="Get acquainted with our engineering architecture, development best practices, and enterprise culture."
        badge={
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {completedModules} of {totalModules} Completed
            </span>
            <StatusBadge status={stepStatus.training} size="md" />
          </div>
        }
      />

      {/* Progress Card + Certificate Note */}
      <Card className="p-6 bg-gradient-to-r from-indigo-50/70 to-purple-50/40 dark:from-slate-900 dark:to-indigo-950/40 border-indigo-100 dark:border-indigo-900/60">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 text-left">
            <ProgressRing progress={totalProgress} size={90} strokeWidth={8} />
            <div className="space-y-1">
              <h3 className="font-heading text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Foundational Learning Curriculum
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
                Completing these 4 core modules qualifies you for your Apex Developer Badge and official
                first-week security clearance.
              </p>
              <div className="flex items-center gap-2 pt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <Award className="w-4 h-4" />
                <span>Certificate unlocks upon 100% completion</span>
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="font-heading text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {completedModules}/{totalModules}
            </span>
            <span className="block text-[11px] text-slate-400 uppercase font-semibold">
              Modules Done
            </span>
          </div>
        </div>
      </Card>

      {/* Module List */}
      <div className="space-y-4">
        {trainingModules.map((mod, index) => {
          return (
            <Card
              key={mod.id}
              className={`p-5 transition-all text-left ${
                mod.isCompleted
                  ? 'border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/15 dark:bg-emerald-950/10'
                  : ''
              }`}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                      Module 0{index + 1}
                    </span>
                    <h4 className="font-heading text-sm font-bold text-slate-900 dark:text-slate-100">
                      {mod.title}
                    </h4>
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      {mod.duration}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {mod.description}
                  </p>

                  {/* Key topics chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {mod.keyTopics.map((topic, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-[10px] rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>

                  {/* Individual progress bar */}
                  <div className="max-w-md pt-2 space-y-1">
                    <div className="flex justify-between text-[11px] font-medium text-slate-500">
                      <span>Progress</span>
                      <span>{mod.progress}%</span>
                    </div>
                    <Progress value={mod.progress} />
                  </div>
                </div>

                {/* Action button */}
                <div className="shrink-0 self-end md:self-center">
                  <Button
                    type="button"
                    variant={mod.isCompleted ? 'outline' : 'primary'}
                    size="sm"
                    onClick={() => handleOpenModule(mod)}
                    className="gap-2 text-xs"
                  >
                    {mod.isCompleted ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5" />
                        Replay
                      </>
                    ) : mod.progress > 0 ? (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Continue ({mod.progress}%)
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Start Module
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Step Footer: Continue is allowed always */}
      <StepFooter
        backTo="/candidate/policies"
        nextTo="/candidate/team"
        canContinue={true}
        continueText="Continue to Team"
      />

      {/* Interactive Video Player Dialog */}
      {activeModule && (
        <Dialog
          isOpen={!!activeModule}
          onClose={handleCloseDialog}
          title={activeModule.title}
          description={`Duration: ${activeModule.duration} • Simulated Interactive Orientation`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-left">
            {/* Mock Player Screen */}
            <div className="relative aspect-video rounded-2xl bg-slate-950 text-white flex flex-col justify-between p-5 overflow-hidden shadow-2xl border border-slate-800">
              {/* Background gradient animation */}
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950 via-slate-900 to-purple-950 opacity-90" />

              <div className="relative z-10 flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Video className="w-4 h-4 text-indigo-400" />
                  HD 1080p • Apex Engineering Series
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px]">
                  {formatVideoTime(simulatedSeconds)} / {formatVideoTime(activeModule.videoDurationSeconds)}
                </span>
              </div>

              {/* Center Play Button Overlay */}
              <div className="relative z-10 flex flex-col items-center justify-center my-auto">
                <button
                  type="button"
                  onClick={togglePlayPause}
                  className="w-16 h-16 rounded-full bg-indigo-600/90 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                  aria-label={isPlaying ? 'Pause video' : 'Play video'}
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 fill-current" />
                  ) : (
                    <Play className="w-8 h-8 fill-current ml-1" />
                  )}
                </button>
                <p className="text-xs text-slate-400 mt-2 font-medium">
                  {isPlaying ? 'Playing simulation...' : 'Click to stream walkthrough'}
                </p>
              </div>

              {/* Bottom Scrubber */}
              <div className="relative z-10 space-y-2">
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${(simulatedSeconds / activeModule.videoDurationSeconds) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Controls Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={togglePlayPause}
                  className="gap-1.5"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isPlaying ? 'Pause' : 'Play'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSimulatedSeconds(0)}
                  className="gap-1 text-slate-500"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleMarkModuleComplete}
                  className="gap-1.5 text-xs text-emerald-600 dark:text-emerald-400"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark as Complete
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleCloseDialog}
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};
