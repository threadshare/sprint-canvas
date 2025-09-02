import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EditableCard } from '@/components/cards/EditableCard';
import { MagicLensCard } from '@/components/cards/MagicLensCard';
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
  className?: string;
}

// 预定义的Magic Lenses
const defaultLenses = [
  {
    name: '客户专家',
    description: '从客户角度看，哪个方案对他们最友好，最能解决问题？',
    icon: Users,
  },
  {
    name: '务实专家',
    description: '从效率角度看，哪个方案开发最快、最省钱，能最快推向市场？',
    icon: Zap,
  },
  {
    name: '增长专家',
    description: '从获客角度看，哪个方案能最快地吸引到最多用户？',
    icon: TrendingUp,
  },
  {
    name: '财务专家',
    description: '从商业角度看，哪个方案能为公司和客户创造最大的长期价值？',
    icon: DollarSign,
  },
  {
    name: '差异化视角',
    description: '哪个方案最能体现我们在第二阶段定下的独特优势？',
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
  className,
}) => {
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
    { id: 'paths', title: '执行路径', description: '列出所有可能的执行方案' },
    { id: 'lenses', title: 'Magic Lenses', description: '多角度评估各个方案' },
    { id: 'decision', title: '最终决策', description: '选择最佳路径并说明理由' },
  ];

  return (
    <div className={cn('space-y-8', className)}>
      {/* 阶段说明 */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800">第三阶段：确定项目推进方法</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-700 text-sm leading-relaxed mb-4">
            在这个阶段，我们将确定具体的执行方案。首先列出所有可能的路径，
            然后使用"Magic Lenses"从不同角度系统评估，最后做出最佳选择。
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

      {/* 步骤1: 执行路径 */}
      {currentStep === 'paths' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="h-5 w-5" />
              步骤1: 列出所有可能的执行路径
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-gray-600">
              把所有可能的路径都列出来看看。即使只有一个明确的想法，
              也要思考：万一这条路走不通怎么办？有没有备用方案？
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
                          删除
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* 优点 */}
                    <div>
                      <h5 className="text-sm font-medium text-green-700 mb-2">优点:</h5>
                      <div className="space-y-2">
                        {path.pros.map((pro, index) => (
                          <div key={index} className="text-sm text-green-600 bg-green-50 p-2 rounded">
                            ✓ {pro}
                          </div>
                        ))}
                        {!readOnly && (
                          <EditableCard
                            placeholder="添加一个优点..."
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
                      <h5 className="text-sm font-medium text-red-700 mb-2">缺点:</h5>
                      <div className="space-y-2">
                        {path.cons.map((con, index) => (
                          <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                            ✗ {con}
                          </div>
                        ))}
                        {!readOnly && (
                          <EditableCard
                            placeholder="添加一个缺点..."
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
                  placeholder="路径名称&#10;描述这个执行方案的具体内容..."
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
                下一步: Magic Lenses 评估
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 步骤2: Magic Lenses 评估 */}
      {currentStep === 'lenses' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                步骤2: Magic Lenses 多角度评估
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                现在使用"Magic Lenses"工具，从不同专家的角度来评估每个路径。
                每个镜头代表一种重要的决策视角。
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {data.magicLenses.map((lens, index) => {
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
              上一步
            </Button>
            <Button 
              onClick={() => setCurrentStep('decision')}
              className="bg-green-600 hover:bg-green-700"
            >
              下一步: 最终决策
            </Button>
          </div>
        </div>
      )}

      {/* 步骤3: 最终决策 */}
      {currentStep === 'decision' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              步骤3: 最终决策
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-gray-600">
              基于Magic Lenses的评估结果，选择最佳执行路径并说明理由。
            </p>
            
            {/* 评估结果总览 */}
            <div className="space-y-4">
              <h4 className="font-medium">评估结果总览:</h4>
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
                          🏆 评分最高
                        </div>
                      )}
                      
                      {isSelected && (
                        <div className="text-xs text-green-600 font-medium">
                          ✓ 已选择
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* 选择理由 */}
            <div className="space-y-3">
              <h4 className="font-medium">选择理由:</h4>
              <EditableCard
                initialText={data.reasoning}
                placeholder="说明为什么选择这个路径。哪个Magic Lens的评估最重要？为什么？"
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
                上一步
              </Button>
              {!readOnly && (
                <Button
                  onClick={onComplete}
                  disabled={!isStageComplete()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  完成 Foundation Sprint
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};