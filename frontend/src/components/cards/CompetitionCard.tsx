import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { Edit3, Save, X, Target, Repeat, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface CompetitionItem {
  id: string;
  name: string;
  type: 'direct' | 'alternative' | 'workaround'; // 直接竞争者/替代方案/土办法
  description: string;
}

interface CompetitionCardProps {
  competition?: CompetitionItem;
  placeholder?: string;
  readOnly?: boolean;
  onSave?: (competition: CompetitionItem) => void;
  onDelete?: () => void;
  className?: string;
}

const getCompetitionTypes = (t: (key: string) => string) => [
  { 
    value: 'direct' as const, 
    label: t('competition.direct'), 
    description: t('competition.directDesc'), 
    icon: Target,
    color: 'red'
  },
  { 
    value: 'alternative' as const, 
    label: t('competition.alternative'), 
    description: t('competition.alternativeDesc'), 
    icon: Repeat,
    color: 'blue'
  },
  { 
    value: 'workaround' as const, 
    label: t('competition.workaround'), 
    description: t('competition.workaroundDesc'), 
    icon: Wrench,
    color: 'green'
  },
];

export const CompetitionCard: React.FC<CompetitionCardProps> = ({
  competition,
  placeholder,
  readOnly = false,
  onSave,
  onDelete,
  className,
}) => {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(!competition);
  const [name, setName] = useState(competition?.name || '');
  const [type, setType] = useState<'direct' | 'alternative' | 'workaround'>(competition?.type || 'direct');
  const [description, setDescription] = useState(competition?.description || '');
  const competitionTypes = getCompetitionTypes(t);
  const defaultPlaceholder = placeholder || t('foundation.addCompetitor');

  const handleSave = () => {
    if (!name.trim()) return;
    
    const competitionData: CompetitionItem = {
      id: competition?.id || `competition-${Date.now()}`,
      name: name.trim(),
      type,
      description: description.trim(),
    };
    
    onSave?.(competitionData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (competition) {
      setName(competition.name);
      setType(competition.type);
      setDescription(competition.description);
      setIsEditing(false);
    } else {
      setName('');
      setType('direct');
      setDescription('');
    }
  };

  const currentType = competitionTypes.find(t => t.value === type);
  const IconComponent = currentType?.icon || Target;

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
        'h-full card-competition',
        isEditing && 'ring-2 ring-rose-300 shadow-paper-lg',
        className
      )}>
        {isEditing ? (
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2 text-purple-700">
              <Target className="h-4 w-4" />
              <span className="text-sm font-medium">竞争分析</span>
            </div>
            
            <div>
              <label className="text-sm font-medium text-purple-700 mb-2 block">
                类型
              </label>
              <div className="grid grid-cols-1 gap-2">
                {competitionTypes.map((option) => {
                  const TypeIcon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setType(option.value)}
                      className={cn(
                        'p-2 text-sm rounded border-2 transition-all flex items-center gap-2',
                        type === option.value 
                          ? 'border-purple-500 bg-purple-100 text-purple-800'
                          : 'border-purple-200 bg-white text-purple-600 hover:bg-purple-50'
                      )}
                    >
                      <TypeIcon className="h-4 w-4" />
                      <div className="text-left">
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs opacity-75">{option.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="名称"
              className="border-purple-300 focus:border-purple-500"
            />
            
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="详细描述..."
              className="border-purple-300 focus:border-purple-500 min-h-20"
              rows={3}
            />
            
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSave}
                size="sm"
                disabled={!name.trim()}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                <Save className="h-3 w-3 mr-1" />
                保存
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
                className="border-purple-300 text-purple-600 hover:bg-purple-50"
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
                  currentType?.color === 'red' && 'bg-red-100 text-red-600',
                  currentType?.color === 'blue' && 'bg-blue-100 text-blue-600',
                  currentType?.color === 'green' && 'bg-green-100 text-green-600'
                )}>
                  <IconComponent className="h-3 w-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 text-sm">{competition?.name}</h4>
                  <div className={cn(
                    'text-xs px-1.5 py-0.5 rounded inline-block mt-1',
                    currentType?.color === 'red' && 'bg-red-100 text-red-700',
                    currentType?.color === 'blue' && 'bg-blue-100 text-blue-700',
                    currentType?.color === 'green' && 'bg-green-100 text-green-700'
                  )}>
                    {currentType?.label}
                  </div>
                </div>
              </div>
              
              {competition?.description && (
                <p className="text-xs text-gray-600 leading-relaxed">
                  {competition.description}
                </p>
              )}
              
              {!readOnly && (
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-purple-600 hover:bg-purple-50"
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