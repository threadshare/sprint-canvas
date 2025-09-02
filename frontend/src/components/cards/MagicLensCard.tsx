import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Star, BarChart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PathEvaluation {
  pathId: string;
  pathName?: string;
  score: number; // 1-5
  notes: string;
}

interface MagicLensProps {
  id: string;
  name: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  evaluations: PathEvaluation[];
  paths: Array<{ id: string; name: string }>;
  onEvaluationChange?: (pathId: string, score: number, notes: string) => void;
  readOnly?: boolean;
  className?: string;
}

const lensIcons = {
  customer: Eye,
  pragmatic: Star,
  growth: BarChart,
  financial: BarChart,
  differentiation: Star,
};

export const MagicLensCard: React.FC<MagicLensProps> = ({
  id,
  name,
  description,
  icon: CustomIcon,
  evaluations,
  paths,
  onEvaluationChange,
  readOnly = false,
  className,
}) => {
  const [activePathId, setActivePathId] = useState<string | null>(null);
  const [tempScore, setTempScore] = useState(3);
  const [tempNotes, setTempNotes] = useState('');

  const IconComponent = CustomIcon || Eye;

  const getEvaluation = (pathId: string): PathEvaluation | undefined => {
    return evaluations.find(e => e.pathId === pathId);
  };

  const getScoreColor = (score: number) => {
    if (score <= 2) return 'text-red-600 bg-red-100';
    if (score <= 3) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const handleStartEvaluation = (pathId: string) => {
    const existing = getEvaluation(pathId);
    setActivePathId(pathId);
    setTempScore(existing?.score || 3);
    setTempNotes(existing?.notes || '');
  };

  const handleSaveEvaluation = () => {
    if (!activePathId) return;
    onEvaluationChange?.(activePathId, tempScore, tempNotes);
    setActivePathId(null);
  };

  const handleCancelEvaluation = () => {
    setActivePathId(null);
    setTempScore(3);
    setTempNotes('');
  };

  const getAverageScore = () => {
    if (evaluations.length === 0) return 0;
    const total = evaluations.reduce((sum, eval) => sum + eval.score, 0);
    return total / evaluations.length;
  };

  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-card-hover',
      'border-indigo-200 bg-indigo-50',
      className
    )}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-800">
            <IconComponent className="h-5 w-5" />
            <span>{name}</span>
          </div>
          
          {evaluations.length > 0 && (
            <div className={cn(
              'px-3 py-1 rounded-full text-sm font-medium',
              getScoreColor(getAverageScore())
            )}>
              平均分: {getAverageScore().toFixed(1)}
            </div>
          )}
        </CardTitle>
        <p className="text-sm text-indigo-600 mt-1">{description}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {paths.map((path) => {
          const evaluation = getEvaluation(path.id);
          const isActive = activePathId === path.id;
          
          return (
            <div key={path.id} className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-indigo-100">
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-gray-800">
                    {path.name}
                  </h4>
                  
                  {evaluation && (
                    <div className="flex items-center gap-3 mt-2">
                      <div className={cn(
                        'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium',
                        getScoreColor(evaluation.score)
                      )}>
                        <span>评分: {evaluation.score}/5</span>
                      </div>
                      
                      {evaluation.notes && (
                        <div className="text-xs text-gray-600 flex-1">
                          {evaluation.notes}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {!readOnly && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStartEvaluation(path.id)}
                    disabled={isActive}
                  >
                    {evaluation ? '重新评估' : '评估'}
                  </Button>
                )}
              </div>
              
              {/* 评估表单 */}
              {isActive && (
                <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      评分 (1-5分)
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          key={score}
                          onClick={() => setTempScore(score)}
                          className={cn(
                            'w-8 h-8 rounded-full border-2 text-sm font-medium transition-all',
                            tempScore === score
                              ? 'border-indigo-500 bg-indigo-100 text-indigo-800'
                              : 'border-gray-300 text-gray-600 hover:border-indigo-300 hover:bg-indigo-50'
                          )}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      1=非常差, 2=差, 3=一般, 4=好, 5=非常好
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      评估理由 (可选)
                    </label>
                    <textarea
                      value={tempNotes}
                      onChange={(e) => setTempNotes(e.target.value)}
                      className="w-full p-3 text-sm border border-gray-300 rounded-lg resize-none"
                      rows={2}
                      placeholder="从这个视角分析，为什么给出这个评分..."
                    />
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelEvaluation}
                    >
                      取消
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveEvaluation}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      保存评估
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        {paths.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <Eye className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">暂无路径可评估</p>
            <p className="text-xs text-gray-400 mt-1">先添加执行路径</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};