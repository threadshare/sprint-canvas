import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EditableCard } from '@/components/cards/EditableCard';
import { Matrix2x2Card } from '@/components/cards/Matrix2x2Card';
import { Plus, Target, Zap, Award, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DifferentiationFactor {
  id: string;
  name: string;
  description: string;
  weight: number;
}

interface ProductPosition {
  name: string;
  x: number;
  y: number;
  isUs: boolean;
}

interface Matrix2x2 {
  xAxis: string;
  yAxis: string;
  products: ProductPosition[];
  winningQuadrant: string;
}

interface DifferentiationData {
  classicFactors: DifferentiationFactor[];
  customFactors: DifferentiationFactor[];
  matrix: Matrix2x2;
  principles: string[];
}

interface DifferentiationStageProps {
  data: DifferentiationData;
  roomId?: string;
  currentUserId?: string;
  currentUserName?: string;
  readOnly?: boolean;
  onDataChange?: (data: DifferentiationData) => void;
  onNextStage?: () => void;
  className?: string;
}

// 经典差异化因素模板
const classicFactorsTemplate = [
  { name: '快 vs 慢', description: '执行速度、响应时间' },
  { name: '易用 vs 复杂', description: '用户体验、学习成本' },
  { name: '免费 vs 昂贵', description: '价格策略、成本结构' },
  { name: '专注 vs 通用', description: '功能范围、目标市场' },
  { name: '个性化 vs 标准化', description: '定制程度、规模化' },
  { name: '自动化 vs 手工', description: '技术依赖、人工介入' },
];

export const DifferentiationStage: React.FC<DifferentiationStageProps> = ({
  data,
  roomId,
  currentUserId,
  currentUserName,
  readOnly = false,
  onDataChange,
  onNextStage,
  className,
}) => {
  const [currentStep, setCurrentStep] = useState<'classic' | 'custom' | 'matrix' | 'principles'>('classic');
  const [selectedFactors, setSelectedFactors] = useState<DifferentiationFactor[]>([]);

  const addClassicFactor = (template: typeof classicFactorsTemplate[0]) => {
    const newFactor: DifferentiationFactor = {
      id: `classic-${Date.now()}`,
      name: template.name,
      description: template.description,
      weight: 1,
    };
    
    const newData = {
      ...data,
      classicFactors: [...data.classicFactors, newFactor],
    };
    onDataChange?.(newData);
  };

  const addCustomFactor = (name: string, description: string) => {
    const newFactor: DifferentiationFactor = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      weight: 1,
    };
    
    const newData = {
      ...data,
      customFactors: [...data.customFactors, newFactor],
    };
    onDataChange?.(newData);
  };

  const deleteFactor = (type: 'classic' | 'custom', id: string) => {
    const newData = {
      ...data,
      [type === 'classic' ? 'classicFactors' : 'customFactors']: 
        data[type === 'classic' ? 'classicFactors' : 'customFactors'].filter(f => f.id !== id),
    };
    onDataChange?.(newData);
  };

  const createMatrix = () => {
    const allFactors = [...data.classicFactors, ...data.customFactors];
    if (allFactors.length < 2) return;

    // 选择权重最高的两个因素作为坐标轴
    const topFactors = allFactors
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 2);

    const newMatrix: Matrix2x2 = {
      xAxis: topFactors[0]?.name || 'X轴',
      yAxis: topFactors[1]?.name || 'Y轴',
      products: [
        { name: '我们的产品', x: 75, y: 75, isUs: true },
        { name: '竞争对手A', x: 25, y: 25, isUs: false },
        { name: '竞争对手B', x: 60, y: 40, isUs: false },
      ],
      winningQuadrant: '右上角',
    };

    const newData = {
      ...data,
      matrix: newMatrix,
    };
    onDataChange?.(newData);
    setCurrentStep('matrix');
  };

  const updateMatrix = (updates: Partial<Matrix2x2>) => {
    const newData = {
      ...data,
      matrix: { ...data.matrix, ...updates },
    };
    onDataChange?.(newData);
  };

  const addPrinciple = (text: string) => {
    if (!text.trim()) return;
    
    const newData = {
      ...data,
      principles: [...data.principles, text.trim()],
    };
    onDataChange?.(newData);
  };

  const deletePrinciple = (index: number) => {
    const newData = {
      ...data,
      principles: data.principles.filter((_, i) => i !== index),
    };
    onDataChange?.(newData);
  };

  const isStageComplete = () => {
    return data.customFactors.length > 0 && 
           data.matrix.xAxis && 
           data.matrix.yAxis && 
           data.principles.length > 0;
  };

  const steps = [
    { id: 'classic', title: '经典差异化因素', description: '从通用维度开始热身' },
    { id: 'custom', title: '自定义差异化因素', description: '创建专属的差异化维度' },
    { id: 'matrix', title: '2x2 分析矩阵', description: '可视化竞争定位' },
    { id: 'principles', title: '项目原则', description: '提炼决策指导原则' },
  ];

  return (
    <div className={cn('space-y-8', className)}>
      {/* 阶段说明 */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="text-purple-800">第二阶段：找到差异化优势</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-purple-700 text-sm leading-relaxed mb-4">
            在这个阶段，我们将定义产品的独特价值定位。首先从经典差异化因素热身，
            然后创建自定义的差异化维度，最后通过2x2矩阵找到我们的"胜利象限"。
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
                      ? 'bg-purple-200 text-purple-800'
                      : 'bg-white text-purple-600 hover:bg-purple-100'
                  )}
                >
                  {step.title}
                </button>
                {index < steps.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-purple-400 flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 步骤1: 经典差异化因素 */}
      {currentStep === 'classic' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              步骤1: 经典差异化因素热身
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-gray-600">
              从这些通用的差异化维度中选择适合您产品的因素，这是一个热身练习。
            </p>
            
            {/* 经典因素模板 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classicFactorsTemplate.map((template, index) => {
                const isAdded = data.classicFactors.some(f => f.name === template.name);
                
                return (
                  <Card 
                    key={index} 
                    className={cn(
                      'cursor-pointer transition-all hover:shadow-md',
                      isAdded 
                        ? 'border-purple-300 bg-purple-50' 
                        : 'border-gray-200 hover:border-purple-200'
                    )}
                    onClick={() => !isAdded && !readOnly && addClassicFactor(template)}
                  >
                    <CardContent className="p-4">
                      <h4 className="font-medium text-sm mb-1">{template.name}</h4>
                      <p className="text-xs text-gray-600">{template.description}</p>
                      {isAdded && (
                        <div className="mt-2 text-purple-600 text-xs">✓ 已添加</div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* 已选择的经典因素 */}
            {data.classicFactors.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">已选择的经典因素:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {data.classicFactors.map((factor) => (
                    <EditableCard
                      key={factor.id}
                      initialText={`${factor.name}\n${factor.description}`}
                      readOnly={readOnly}
                      onDelete={() => deleteFactor('classic', factor.id)}
                      className="bg-purple-50 border-purple-200"
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button 
                onClick={() => setCurrentStep('custom')}
                className="bg-purple-600 hover:bg-purple-700"
              >
                下一步: 自定义因素
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 步骤2: 自定义差异化因素 */}
      {currentStep === 'custom' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              步骤2: 创建自定义差异化因素
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-gray-600">
              编写更具体的、体现您产品独特价值的差异化因素。用反义词的形式描述优势与劣势的对比。
            </p>

            {/* 自定义因素列表 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.customFactors.map((factor) => (
                <EditableCard
                  key={factor.id}
                  initialText={`${factor.name}\n${factor.description}`}
                  readOnly={readOnly}
                  variant="advantage"
                  onDelete={() => deleteFactor('custom', factor.id)}
                />
              ))}
              
              {/* 添加新的自定义因素 */}
              {!readOnly && (
                <EditableCard
                  placeholder="例如: 网络化的 vs 孤立的&#10;通过社区推荐找到客户"
                  variant="advantage"
                  onSave={(text) => {
                    const lines = text.split('\n');
                    const name = lines[0] || '';
                    const description = lines.slice(1).join('\n') || '';
                    addCustomFactor(name, description);
                  }}
                />
              )}
            </div>

            <div className="flex justify-between">
              <Button 
                variant="outline"
                onClick={() => setCurrentStep('classic')}
              >
                上一步
              </Button>
              <Button 
                onClick={createMatrix}
                disabled={data.customFactors.length === 0}
                className="bg-purple-600 hover:bg-purple-700"
              >
                下一步: 创建矩阵
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 步骤3: 2x2 矩阵 */}
      {currentStep === 'matrix' && (
        <div className="space-y-6">
          <Matrix2x2Card
            xAxis={data.matrix.xAxis}
            yAxis={data.matrix.yAxis}
            products={data.matrix.products}
            onProductMove={(index, x, y) => {
              const newProducts = [...data.matrix.products];
              newProducts[index] = { ...newProducts[index], x, y };
              updateMatrix({ products: newProducts });
            }}
            onAxisChange={(axis, label) => {
              updateMatrix({
                [axis === 'x' ? 'xAxis' : 'yAxis']: label
              });
            }}
            readOnly={readOnly}
          />

          <div className="flex justify-between">
            <Button 
              variant="outline"
              onClick={() => setCurrentStep('custom')}
            >
              上一步
            </Button>
            <Button 
              onClick={() => setCurrentStep('principles')}
              className="bg-purple-600 hover:bg-purple-700"
            >
              下一步: 提炼原则
            </Button>
          </div>
        </div>
      )}

      {/* 步骤4: 项目原则 */}
      {currentStep === 'principles' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              步骤4: 提炼项目原则
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-gray-600">
              基于您的差异化优势，提炼出几条简单的项目原则，形成"迷你宣言"。
              这些原则将指导后续的所有决策。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.principles.map((principle, index) => (
                <EditableCard
                  key={index}
                  initialText={principle}
                  readOnly={readOnly}
                  variant="advantage"
                  onSave={(text) => {
                    const newPrinciples = [...data.principles];
                    newPrinciples[index] = text;
                    onDataChange?.({ ...data, principles: newPrinciples });
                  }}
                  onDelete={() => deletePrinciple(index)}
                />
              ))}
              
              {!readOnly && (
                <EditableCard
                  placeholder="例如: 帮助卖家互相帮助"
                  variant="advantage"
                  onSave={addPrinciple}
                />
              )}
            </div>

            <div className="flex justify-between">
              <Button 
                variant="outline"
                onClick={() => setCurrentStep('matrix')}
              >
                上一步
              </Button>
              {!readOnly && (
                <Button
                  onClick={onNextStage}
                  disabled={!isStageComplete()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  下一阶段: 确定方法
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};