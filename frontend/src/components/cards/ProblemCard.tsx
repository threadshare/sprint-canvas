import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Edit3, Save, X, AlertCircle, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProblemItem {
  id: string;
  description: string;
  severity: number; // 1-10分痛点强度评分
  impact: 'few' | 'some' | 'many' | 'most'; // 影响范围
}

interface ProblemCardProps {
  problem?: ProblemItem;
  placeholder?: string;
  readOnly?: boolean;
  onSave?: (problem: ProblemItem) => void;
  onDelete?: () => void;
  className?: string;
}

const impactOptions = [
  { value: 'few' as const, label: '少数用户', description: '< 25%', color: 'yellow' },
  { value: 'some' as const, label: '部分用户', description: '25-50%', color: 'orange' },
  { value: 'many' as const, label: '多数用户', description: '50-75%', color: 'red' },
  { value: 'most' as const, label: '绝大多数', description: '> 75%', color: 'purple' },
];

export const ProblemCard: React.FC<ProblemCardProps> = ({
  problem,
  placeholder = '描述一个具体问题...',
  readOnly = false,
  onSave,
  onDelete,
  className,
}) => {
  const [isEditing, setIsEditing] = useState(!problem);
  const [description, setDescription] = useState(problem?.description || '');
  const [severity, setSeverity] = useState(problem?.severity || 5);
  const [impact, setImpact] = useState<'few' | 'some' | 'many' | 'most'>(problem?.impact || 'some');

  const handleSave = () => {
    if (!description.trim()) return;
    
    const problemData: ProblemItem = {
      id: problem?.id || `problem-${Date.now()}`,
      description: description.trim(),
      severity,
      impact,
    };
    
    onSave?.(problemData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (problem) {
      setDescription(problem.description);
      setSeverity(problem.severity);
      setImpact(problem.impact);
      setIsEditing(false);
    } else {
      setDescription('');
      setSeverity(5);
      setImpact('some');
    }
  };

  const currentImpact = impactOptions.find(option => option.value === impact);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn(
        'h-full card-problem',
        isEditing && 'ring-2 ring-amber-300 shadow-paper-lg',
        className
      )}>
        {isEditing ? (
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2 text-orange-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">问题描述</span>
            </div>
            
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={placeholder}
              className="border-orange-300 focus:border-orange-500"
              multiline
            />
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-orange-700 mb-2 block">
                  痛点强度: {severity}/10
                </label>
                <div className="px-1">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={severity}
                    onChange={(e) => setSeverity(Number(e.target.value))}
                    className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-orange-600 mt-1">
                    <span>轻微</span>
                    <span>严重</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-orange-700 mb-2 block">
                  影响范围
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {impactOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setImpact(option.value)}
                      className={cn(
                        'p-2 text-sm rounded border-2 transition-all',
                        impact === option.value 
                          ? 'border-orange-500 bg-orange-100 text-orange-800'
                          : 'border-orange-200 bg-white text-orange-600 hover:bg-orange-50'
                      )}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs opacity-75">{option.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSave}
                size="sm"
                disabled={!description.trim()}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                <Save className="h-3 w-3 mr-1" />
                保存
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
                className="border-orange-300 text-orange-600 hover:bg-orange-50"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        ) : (
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-800 leading-relaxed">
                  {problem?.description}
                </p>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-orange-600">
                  <span className="font-medium">强度:</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 10 }, (_, i) => (
                      <div
                        key={i}
                        className={cn(
                          'w-2 h-2 rounded-full',
                          i < (problem?.severity || 0) ? 'bg-orange-500' : 'bg-orange-200'
                        )}
                      />
                    ))}
                    <span className="ml-1">{problem?.severity}/10</span>
                  </div>
                </div>
                
                <div className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium',
                  currentImpact?.color === 'yellow' && 'bg-yellow-100 text-yellow-700',
                  currentImpact?.color === 'orange' && 'bg-orange-100 text-orange-700',
                  currentImpact?.color === 'red' && 'bg-red-100 text-red-700',
                  currentImpact?.color === 'purple' && 'bg-purple-100 text-purple-700'
                )}>
                  <Users className="h-3 w-3" />
                  {currentImpact?.label}
                </div>
              </div>
              
              {!readOnly && (
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-orange-600 hover:bg-orange-50"
                  >
                    <Edit3 className="h-3 w-3 mr-1" />
                    编辑
                  </Button>
                  {onDelete && (
                    <Button
                      onClick={onDelete}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:bg-red-50"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
};