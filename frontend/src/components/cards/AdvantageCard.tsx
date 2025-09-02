import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { Edit3, Save, X, Code, Lightbulb, Package, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface AdvantageItem {
  id: string;
  description: string;
  category: 'technical' | 'insight' | 'resource' | 'motivation'; // 技术能力/行业洞察/资源优势/团队动机
}

interface AdvantageCardProps {
  advantage?: AdvantageItem;
  placeholder?: string;
  readOnly?: boolean;
  onSave?: (advantage: AdvantageItem) => void;
  onDelete?: () => void;
  className?: string;
}

const getAdvantageCategories = (t: (key: string) => string) => [
  { 
    value: 'technical' as const, 
    label: t('advantage.technical'), 
    description: t('advantage.technicalDesc'), 
    icon: Code,
    color: 'blue'
  },
  { 
    value: 'insight' as const, 
    label: t('advantage.insight'), 
    description: t('advantage.insightDesc'), 
    icon: Lightbulb,
    color: 'yellow'
  },
  { 
    value: 'resource' as const, 
    label: t('advantage.resource'), 
    description: t('advantage.resourceDesc'), 
    icon: Package,
    color: 'purple'
  },
  { 
    value: 'motivation' as const, 
    label: t('advantage.motivation'), 
    description: t('advantage.motivationDesc'), 
    icon: Heart,
    color: 'pink'
  },
];

export const AdvantageCard: React.FC<AdvantageCardProps> = ({
  advantage,
  placeholder,
  readOnly = false,
  onSave,
  onDelete,
  className,
}) => {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(!advantage);
  const [description, setDescription] = useState(advantage?.description || '');
  const [category, setCategory] = useState<'technical' | 'insight' | 'resource' | 'motivation'>(advantage?.category || 'technical');
  const advantageCategories = getAdvantageCategories(t);
  const defaultPlaceholder = placeholder || t('foundation.addAdvantage');

  const handleSave = () => {
    if (!description.trim()) return;
    
    const advantageData: AdvantageItem = {
      id: advantage?.id || `advantage-${Date.now()}`,
      description: description.trim(),
      category,
    };
    
    onSave?.(advantageData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (advantage) {
      setDescription(advantage.description);
      setCategory(advantage.category);
      setIsEditing(false);
    } else {
      setDescription('');
      setCategory('technical');
    }
  };

  const currentCategory = advantageCategories.find(cat => cat.value === category);
  const IconComponent = currentCategory?.icon || Code;

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
        'h-full card-advantage',
        isEditing && 'ring-2 ring-emerald-300 shadow-paper-lg',
        className
      )}>
        {isEditing ? (
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2 text-green-700">
              <Code className="h-4 w-4" />
              <span className="text-sm font-medium">团队优势</span>
            </div>
            
            <div>
              <label className="text-sm font-medium text-green-700 mb-2 block">
                优势类型
              </label>
              <div className="grid grid-cols-2 gap-2">
                {advantageCategories.map((option) => {
                  const CategoryIcon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setCategory(option.value)}
                      className={cn(
                        'p-2 text-sm rounded border-2 transition-all flex flex-col items-center gap-1',
                        category === option.value 
                          ? 'border-green-500 bg-green-100 text-green-800'
                          : 'border-green-200 bg-white text-green-600 hover:bg-green-50'
                      )}
                    >
                      <CategoryIcon className="h-4 w-4" />
                      <div className="text-center">
                        <div className="font-medium text-xs">{option.label}</div>
                        <div className="text-xs opacity-75 leading-tight">{option.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={placeholder}
              className="border-green-300 focus:border-green-500 min-h-20"
              rows={3}
            />
            
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSave}
                size="sm"
                disabled={!description.trim()}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Save className="h-3 w-3 mr-1" />
                保存
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
                className="border-green-300 text-green-600 hover:bg-green-50"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        ) : (
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className={cn(
                  'p-1.5 rounded flex-shrink-0',
                  currentCategory?.color === 'blue' && 'bg-blue-100 text-blue-600',
                  currentCategory?.color === 'yellow' && 'bg-yellow-100 text-yellow-600',
                  currentCategory?.color === 'purple' && 'bg-purple-100 text-purple-600',
                  currentCategory?.color === 'pink' && 'bg-pink-100 text-pink-600'
                )}>
                  <IconComponent className="h-3 w-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={cn(
                    'text-xs px-1.5 py-0.5 rounded inline-block mb-2',
                    currentCategory?.color === 'blue' && 'bg-blue-100 text-blue-700',
                    currentCategory?.color === 'yellow' && 'bg-yellow-100 text-yellow-700',
                    currentCategory?.color === 'purple' && 'bg-purple-100 text-purple-700',
                    currentCategory?.color === 'pink' && 'bg-pink-100 text-pink-700'
                  )}>
                    {currentCategory?.label}
                  </div>
                  <p className="text-sm text-gray-800 leading-relaxed">
                    {advantage?.description}
                  </p>
                </div>
              </div>
              
              {!readOnly && (
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-green-600 hover:bg-green-50"
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