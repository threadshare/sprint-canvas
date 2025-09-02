import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { EditableCard } from '@/components/cards/EditableCard';
import { MagicLensCard } from '@/components/cards/MagicLensCard';
import { AIWorkflowHelper } from '@/components/ai/AIWorkflowHelper';
import { 
  Route, 
  Users, 
  Zap, 
  TrendingUp, 
  DollarSign, 
  Target,
  Heart,
  Plus,
  ArrowRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Path {
  id: string;
  name: string;
  description: string;
  pros: string[];
  cons: string[];
}

interface PathEvaluation {
  pathId: string;
  score: number;
  notes: string;
}

interface MagicLens {
  name: string;
  description: string;
  evaluations: PathEvaluation[];
}

interface ApproachData {
  paths: Path[];
  magicLenses: MagicLens[];
  selectedPath: string;
  reasoning: string;
}

interface ApproachStageProps {
  data: ApproachData;
  roomId?: string;
  currentUserId?: string;
  currentUserName?: string;
  readOnly?: boolean;
  onDataChange?: (data: ApproachData) => void;
  onComplete?: () => void;
  onOpenAIPanel?: (agentType: 'think' | 'critique' | 'research', initialMessage?: string) => void;
  className?: string;
}

// 预定义的Magic Lenses
const getDefaultLenses = (t: (key: string) => string) => [
  {
    name: t('approach.lensCustomer'),
    description: t('approach.lensCustomerDesc'),
    icon: Users,
  },
  {
    name: t('approach.lensPragmatic'),
    description: t('approach.lensPragmaticDesc'),
    icon: Zap,
  },
  {
    name: t('approach.lensGrowth'),
    description: t('approach.lensGrowthDesc'),
    icon: TrendingUp,
  },
  {
    name: t('approach.lensFinancial'),
    description: t('approach.lensFinancialDesc'),
    icon: DollarSign,
  },
  {
    name: t('approach.lensDifferentiation'),
    description: t('approach.lensDifferentiationDesc'),
    icon: Target,
  },
];

export const ApproachStage: React.FC<ApproachStageProps> = ({
  data,
  roomId,
  currentUserId,
  currentUserName,
  readOnly = false,
  onDataChange,
  onComplete,
  onOpenAIPanel,
  className,
}) => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState<'paths' | 'lenses' | 'decision'>('paths');
  
  const addPath = (name: string, description: string) => {
    const newPath: Path = {
      id: `path-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      pros: [],
      cons: [],
    };
    
    const newData = {
      ...data,
      paths: [...data.paths, newPath],
    };
    onDataChange?.(newData);
  };

  const updatePath = (pathId: string, updates: Partial<Path>) => {
    const newData = {
      ...data,
      paths: data.paths.map(path => 
        path.id === pathId ? { ...path, ...updates } : path
      ),
    };
    onDataChange?.(newData);
  };

  const deletePath = (pathId: string) => {
    const newData = {
      ...data,
      paths: data.paths.filter(path => path.id !== pathId),
      // 清理相关评估
      magicLenses: data.magicLenses.map(lens => ({
        ...lens,
        evaluations: lens.evaluations.filter(evaluation => evaluation.pathId !== pathId),
      })),
    };
    onDataChange?.(newData);
  };

  const initializeLenses = () => {
    const defaultLenses = getDefaultLenses(t);
    const lenses: MagicLens[] = defaultLenses.map(lens => ({
      name: lens.name,
      description: lens.description,
      evaluations: [],
    }));
    
    const newData = {
      ...data,
      magicLenses: lenses,
    };
    onDataChange?.(newData);
    setCurrentStep('lenses');
  };

  const handleEvaluationChange = (lensName: string, pathId: string, score: number, notes: string) => {
    const newData = {
      ...data,
      magicLenses: data.magicLenses.map(lens => {
        if (lens.name === lensName) {
          const existingIndex = lens.evaluations.findIndex(e => e.pathId === pathId);
          const newEvaluation = { pathId, score, notes };
          
          if (existingIndex >= 0) {
            // 更新现有评估
            return {
              ...lens,
              evaluations: lens.evaluations.map((evaluation, index) => 
                index === existingIndex ? newEvaluation : evaluation
              ),
            };
          } else {
            // 添加新评估
            return {
              ...lens,
              evaluations: [...lens.evaluations, newEvaluation],
            };
          }
        }
        return lens;
      }),
    };
    onDataChange?.(newData);
  };

  const selectPath = (pathId: string) => {
    const newData = {
      ...data,
      selectedPath: pathId,
    };
    onDataChange?.(newData);
  };

  const getPathScore = (pathId: string) => {
    let totalScore = 0;
    let lensCount = 0;
    
    data.magicLenses.forEach(lens => {
      const evaluation = lens.evaluations.find(e => e.pathId === pathId);
      if (evaluation) {
        totalScore += evaluation.score;
        lensCount++;
      }
    });
    
    return lensCount > 0 ? totalScore / lensCount : 0;
  };

  const getTopPath = () => {
    if (data.paths.length === 0) return null;
    
    const pathScores = data.paths.map(path => ({
      path,
      score: getPathScore(path.id),
    }));
    
    return pathScores.sort((a, b) => b.score - a.score)[0];
  };

  const isStageComplete = () => {
    return data.paths.length > 0 && 
           data.selectedPath && 
           data.reasoning.trim().length > 0;
  };

  const steps = [
    { id: 'paths', title: t('approach.paths'), description: t('approach.pathsDesc') },
    { id: 'lenses', title: t('approach.magicLenses'), description: t('approach.magicLensesDesc') },
    { id: 'decision', title: t('approach.selectedPath'), description: t('approach.selectedPathDesc') },
  ];

  return (
    <div className={cn('space-y-8', className)}>
      {/* 阶段说明 */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800">{t('approach.stageTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-700 text-sm leading-relaxed mb-4">
            {t('approach.stageDesc')}
          </p>
          
          {/* 步骤指示器 */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => setCurrentStep(step.id as any)}
                  className={cn(
                    'flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                    currentStep === step.id
                      ? 'bg-green-200 text-green-800'
                      : 'bg-white text-green-600 hover:bg-green-100'
                  )}
                >
                  {step.title}
                </button>
                {index < steps.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-green-400 flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI 工作流助手 */}
      {roomId && (
        <AIWorkflowHelper
          phase="approach"
          roomId={roomId}
          data={data}
          context={`当前阶段: approach, 执行路径: ${data.paths.map(p => p.name).join(', ')}, 选中路径: ${data.selectedPath}, 魔法透镜: ${data.magicLenses.map(l => l.name).join(', ')}`}
          onOpenAIPanel={onOpenAIPanel}
          onDataChange={onDataChange}
        />
      )}

      {/* Step 1: Paths */}
      {currentStep === 'paths' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="h-5 w-5" />
              {t('approach.pathsTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-gray-600">
              {t('approach.pathsDesc')}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.paths.map((path) => (
                <Card key={path.id} className="border-gray-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{path.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{path.description}</p>
                      </div>
                      {!readOnly && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deletePath(path.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          {t('common.delete')}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* 优点 */}
                    <div>
                      <h5 className="text-sm font-medium text-green-700 mb-2">{t('approach.pros')}:</h5>
                      <div className="space-y-2">
                        {path.pros.map((pro, index) => (
                          <div key={index} className="text-sm text-green-600 bg-green-50 p-2 rounded">
                            ✓ {pro}
                          </div>
                        ))}
                        {!readOnly && (
                          <EditableCard
                            placeholder={t('approach.addPro')}
                            variant="advantage"
                            className="min-h-[60px]"
                            onSave={(text) => {
                              updatePath(path.id, {
                                pros: [...path.pros, text]
                              });
                            }}
                          />
                        )}
                      </div>
                    </div>
                    
                    {/* 缺点 */}
                    <div>
                      <h5 className="text-sm font-medium text-red-700 mb-2">{t('approach.cons')}:</h5>
                      <div className="space-y-2">
                        {path.cons.map((con, index) => (
                          <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                            ✗ {con}
                          </div>
                        ))}
                        {!readOnly && (
                          <EditableCard
                            placeholder={t('approach.addCon')}
                            variant="problem"
                            className="min-h-[60px]"
                            onSave={(text) => {
                              updatePath(path.id, {
                                cons: [...path.cons, text]
                              });
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* 添加新路径 */}
              {!readOnly && (
                <EditableCard
                  placeholder={t('approach.addPathPlaceholder')}
                  variant="default"
                  className="min-h-[200px]"
                  onSave={(text) => {
                    const lines = text.split('\n');
                    const name = lines[0] || '';
                    const description = lines.slice(1).join('\n') || '';
                    if (name.trim()) {
                      addPath(name, description);
                    }
                  }}
                />
              )}
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={initializeLenses}
                disabled={data.paths.length === 0}
                className="bg-green-600 hover:bg-green-700"
              >
                {t('approach.nextMagicLenses')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Magic Lenses */}
      {currentStep === 'lenses' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {t('approach.magicLensesTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {t('approach.magicLensesDesc')}
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {data.magicLenses.map((lens, index) => {
              const defaultLenses = getDefaultLenses(t);
              const lensConfig = defaultLenses[index];
              return (
                <MagicLensCard
                  key={lens.name}
                  id={lens.name}
                  name={lens.name}
                  description={lens.description}
                  icon={lensConfig?.icon}
                  evaluations={lens.evaluations}
                  paths={data.paths}
                  onEvaluationChange={(pathId, score, notes) => 
                    handleEvaluationChange(lens.name, pathId, score, notes)
                  }
                  readOnly={readOnly}
                />
              );
            })}
          </div>

          <div className="flex justify-between">
            <Button 
              variant="outline"
              onClick={() => setCurrentStep('paths')}
            >
              {t('common.previous')}
            </Button>
            <Button 
              onClick={() => setCurrentStep('decision')}
              className="bg-green-600 hover:bg-green-700"
            >
              {t('approach.nextFinalDecision')}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Decision */}
      {currentStep === 'decision' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              {t('approach.selectedPathTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-gray-600">
              {t('approach.finalDecisionDesc')}
            </p>
            
            {/* 评估结果总览 */}
            <div className="space-y-4">
              <h4 className="font-medium">{t('approach.evaluationSummary')}:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.paths.map((path) => {
                  const score = getPathScore(path.id);
                  const isSelected = data.selectedPath === path.id;
                  const isTop = getTopPath()?.path.id === path.id;
                  
                  return (
                    <div
                      key={path.id}
                      className={cn(
                        'p-4 rounded-lg border-2 cursor-pointer transition-all',
                        isSelected
                          ? 'border-green-400 bg-green-50'
                          : isTop
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      )}
                      onClick={() => !readOnly && selectPath(path.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{path.name}</h5>
                        <div className={cn(
                          'px-2 py-1 rounded text-sm font-medium',
                          score >= 4 ? 'bg-green-100 text-green-800' :
                          score >= 3 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        )}>
                          {score.toFixed(1)}/5
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{path.description}</p>
                      
                      {isTop && !isSelected && (
                        <div className="text-xs text-blue-600 font-medium">
                          🏆 {t('approach.highestScore')}
                        </div>
                      )}
                      
                      {isSelected && (
                        <div className="text-xs text-green-600 font-medium">
                          ✓ {t('approach.selected')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* 选择理由 */}
            <div className="space-y-3">
              <h4 className="font-medium">{t('approach.reasoningTitle')}:</h4>
              <EditableCard
                initialText={data.reasoning}
                placeholder={t('approach.reasoningPlaceholder')}
                className="min-h-[120px]"
                readOnly={readOnly}
                onSave={(text) => {
                  onDataChange?.({ ...data, reasoning: text });
                }}
              />
            </div>

            <div className="flex justify-between">
              <Button 
                variant="outline"
                onClick={() => setCurrentStep('lenses')}
              >
                {t('common.previous')}
              </Button>
              {!readOnly && (
                <Button
                  onClick={onComplete}
                  disabled={!isStageComplete()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {t('approach.completeFoundationSprint')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};