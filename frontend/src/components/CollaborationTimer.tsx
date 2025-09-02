import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Play, Pause, RotateCcw, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollaborationTimerProps {
  phase: 'thinking' | 'discussion' | 'voting' | 'idle';
  onPhaseChange?: (phase: string) => void;
  onTimeUp?: () => void;
  className?: string;
}

interface TimerPreset {
  name: string;
  minutes: number;
  description: string;
}

const timerPresets: TimerPreset[] = [
  { name: '独立思考', minutes: 5, description: '静默写下想法' },
  { name: '快速讨论', minutes: 3, description: '简短澄清问题' },
  { name: '详细讨论', minutes: 10, description: '深入讨论分析' },
  { name: '投票决策', minutes: 2, description: '选择最佳选项' },
];

export const CollaborationTimer: React.FC<CollaborationTimerProps> = ({
  phase,
  onPhaseChange,
  onTimeUp,
  className,
}) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<TimerPreset | null>(null);
  const [initialTime, setInitialTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setIsRunning(false);
            onTimeUp?.();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, onTimeUp]);

  const startTimer = (preset: TimerPreset) => {
    const seconds = preset.minutes * 60;
    setTimeLeft(seconds);
    setInitialTime(seconds);
    setSelectedPreset(preset);
    setIsRunning(true);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (selectedPreset) {
      const seconds = selectedPreset.minutes * 60;
      setTimeLeft(seconds);
      setInitialTime(seconds);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = initialTime > 0 ? ((initialTime - timeLeft) / initialTime) * 100 : 0;
  const isUrgent = timeLeft <= 30 && timeLeft > 0;
  const isAlmostDone = timeLeft <= 10 && timeLeft > 0;

  return (
    <Card className={cn('border-blue-200 bg-blue-50', className)}>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-800">协作计时器</h3>
            <div className="flex items-center gap-1 text-xs text-blue-600 ml-auto">
              <Users className="h-3 w-3" />
              <span>团队工具</span>
            </div>
          </div>

          {/* Timer Presets */}
          {!isRunning && timeLeft === 0 && (
            <div className="grid grid-cols-2 gap-2">
              {timerPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => startTimer(preset)}
                  className="p-2 text-left rounded border-2 border-blue-200 bg-white hover:border-blue-300 hover:bg-blue-50 transition-all text-sm"
                >
                  <div className="font-medium text-blue-800">{preset.name}</div>
                  <div className="text-xs text-blue-600">{preset.minutes}分钟</div>
                  <div className="text-xs text-gray-600 mt-1">{preset.description}</div>
                </button>
              ))}
            </div>
          )}

          {/* Active Timer */}
          <AnimatePresence>
            {(timeLeft > 0 || isRunning) && selectedPreset && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center space-y-3"
              >
                <div className="relative">
                  <div className={cn(
                    'text-3xl font-mono font-bold transition-colors',
                    isAlmostDone ? 'text-red-600' : isUrgent ? 'text-orange-600' : 'text-blue-800'
                  )}>
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-sm text-blue-600 mt-1">
                    {selectedPreset.name} • {selectedPreset.description}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <motion.div
                    className={cn(
                      'h-2 rounded-full transition-colors',
                      isAlmostDone ? 'bg-red-500' : isUrgent ? 'bg-orange-500' : 'bg-blue-500'
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                {/* Timer Controls */}
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={toggleTimer}
                    size="sm"
                    variant={isRunning ? "outline" : "default"}
                    className={cn(
                      'flex-1',
                      isRunning ? 'border-orange-300 text-orange-600 hover:bg-orange-50' : 'bg-green-600 hover:bg-green-700'
                    )}
                  >
                    {isRunning ? <Pause className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
                    {isRunning ? '暂停' : '继续'}
                  </Button>
                  <Button
                    onClick={resetTimer}
                    size="sm"
                    variant="outline"
                    className="border-blue-300 text-blue-600 hover:bg-blue-50"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    重置
                  </Button>
                </div>

                {/* Phase Status */}
                {phase !== 'idle' && (
                  <div className={cn(
                    'text-xs px-2 py-1 rounded-full inline-block',
                    phase === 'thinking' && 'bg-purple-100 text-purple-700',
                    phase === 'discussion' && 'bg-blue-100 text-blue-700',
                    phase === 'voting' && 'bg-green-100 text-green-700'
                  )}>
                    {phase === 'thinking' && '🤔 独立思考中...'}
                    {phase === 'discussion' && '💭 讨论进行中...'}
                    {phase === 'voting' && '🗳️ 投票决策中...'}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Timer Complete */}
          <AnimatePresence>
            {!isRunning && timeLeft === 0 && selectedPreset && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center space-y-2 py-2"
              >
                <div className="text-green-600 font-semibold">
                  ⏰ {selectedPreset.name} 时间到！
                </div>
                <Button
                  onClick={() => {
                    setSelectedPreset(null);
                    setTimeLeft(0);
                    setInitialTime(0);
                  }}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  继续下一步
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};