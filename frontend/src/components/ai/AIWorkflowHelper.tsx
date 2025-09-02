import React, { useState, useEffect } from 'react';
import { SmartSuggestionCard } from './SmartSuggestionCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Brain,
  Sparkles,
  MessageCircle,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface AIWorkflowHelperProps {
  phase: 'foundation' | 'differentiation' | 'approach';
  roomId: string;
  data: any;
  context: string;
  className?: string;
  onOpenAIPanel?: (agentType: 'think' | 'critique' | 'research', initialMessage?: string) => void;
  onDataChange?: (data: any) => void;
}

export const AIWorkflowHelper: React.FC<AIWorkflowHelperProps> = ({
  phase,
  roomId,
  data,
  context,
  className,
  onOpenAIPanel,
  onDataChange,
}) => {
  const { t } = useLanguage();
  const [activeSuggestions, setActiveSuggestions] = useState<string[]>([]);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<'think' | 'critique' | 'research' | null>(null);

  // Determine which AI suggestions should be active based on context and data
  useEffect(() => {
    const suggestions: string[] = [];

    // Phase-specific logic for when to show suggestions
    switch (phase) {
      case 'foundation':
        // Show think agent when customers are added
        if (data?.customers?.length > 0 && !dismissedSuggestions.has('foundation-think')) {
          suggestions.push('think');
        }
        // Show critique when problems are identified
        if (data?.problems?.length > 2 && !dismissedSuggestions.has('foundation-critique')) {
          suggestions.push('critique');
        }
        // Show research when competition is mentioned
        if (data?.competition?.length > 0 && !dismissedSuggestions.has('foundation-research')) {
          suggestions.push('research');
        }
        break;

      case 'differentiation':
        // Show think when analyzing factors
        if (data?.classicFactors?.length > 0 && !dismissedSuggestions.has('diff-think')) {
          suggestions.push('think');
        }
        // Show critique when positioning is done
        if (data?.matrix?.products?.length > 0 && !dismissedSuggestions.has('diff-critique')) {
          suggestions.push('critique');
        }
        break;

      case 'approach':
        // Show critique for path analysis
        if (data?.paths?.length > 1 && !dismissedSuggestions.has('approach-critique')) {
          suggestions.push('critique');
        }
        // Show research for validation
        if (data?.magicLenses?.length > 0 && !dismissedSuggestions.has('approach-research')) {
          suggestions.push('research');
        }
        break;
    }

    setActiveSuggestions(suggestions);
  }, [phase, data, dismissedSuggestions]);

  const handleDismissSuggestion = (type: string) => {
    const key = `${phase}-${type}`;
    setDismissedSuggestions(prev => new Set([...prev, key]));
    setActiveSuggestions(prev => prev.filter(s => s !== type));
  };

  const handleApplySuggestion = (suggestionData: any) => {
    // 根据不同阶段和建议类型，应用建议到对应的数据结构
    if (onDataChange && data) {
      // 这里可以根据具体的建议内容解析并更新数据
      // 示例：将建议添加到相应的字段
      console.log('Applying suggestion:', suggestionData);
      // TODO: 实现具体的建议应用逻辑
    }
  };

  const getPhaseName = (phase: string) => {
    const names = {
      foundation: t('foundation.stageTitle'),
      differentiation: t('differentiation.title'),
      approach: t('approach.title'),
    };
    return names[phase as keyof typeof names] || phase;
  };

  const getPhaseProgress = () => {
    switch (phase) {
      case 'foundation':
        const foundationItems = [
          data?.customers?.length > 0,
          data?.problems?.length > 0,
          data?.competition?.length > 0,
          data?.advantages?.length > 0,
        ];
        return foundationItems.filter(Boolean).length / foundationItems.length;
      
      case 'differentiation':
        const diffItems = [
          data?.classicFactors?.length > 0,
          data?.customFactors?.length > 0,
          data?.matrix?.products?.length > 0,
          data?.principles?.length > 0,
        ];
        return diffItems.filter(Boolean).length / diffItems.length;
      
      case 'approach':
        const approachItems = [
          data?.paths?.length > 0,
          data?.magicLenses?.length > 0,
          data?.selectedPath,
          data?.reasoning,
        ];
        return approachItems.filter(Boolean).length / approachItems.length;
      
      default:
        return 0;
    }
  };

  const progress = getPhaseProgress();

  return (
    <div className={cn('space-y-4', className)}>
      {/* AI Status Bar */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Brain className="h-5 w-5 text-blue-600" />
            <Sparkles className="h-3 w-3 text-purple-600 absolute -top-1 -right-1" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-800">
                {t('ai.assistant')} - {getPhaseName(phase)}
              </span>
              <Badge variant="secondary" className="text-xs">
                {activeSuggestions.length} {t('ai.suggestions')}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 bg-gray-200 rounded-full h-1.5 w-24">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">
                {Math.round(progress * 100)}% {t('ai.complete')}
              </span>
            </div>
          </div>
        </div>

        <Popover open={aiPanelOpen} onOpenChange={setAiPanelOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="text-xs">
              <MessageCircle className="h-4 w-4 mr-1" />
              {t('ai.dialog')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" side="left">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">{t('ai.selectAssistant')}</h4>
              <div className="grid grid-cols-1 gap-2">
                {['think', 'critique', 'research'].map((type) => {
                  const isSelected = selectedAgent === type;
                  return (
                    <Button
                      key={type}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "justify-start text-xs transition-all",
                        isSelected && "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-purple-400"
                      )}
                      onClick={() => {
                        setSelectedAgent(type as 'think' | 'critique' | 'research');
                        // Open individual AI chat with the selected agent
                        if (onOpenAIPanel) {
                          onOpenAIPanel(type as 'think' | 'critique' | 'research');
                          setAiPanelOpen(false);
                        }
                      }}
                    >
                      <ChevronRight className={cn(
                        "h-3 w-3 mr-1",
                        isSelected && "text-white"
                      )} />
                      {type === 'think' && t('ai.thinkAssistant')}
                      {type === 'critique' && t('ai.critiqueAssistant')}
                      {type === 'research' && t('ai.researchAssistant')}
                    </Button>
                  );
                })}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active AI Suggestions */}
      <div className="space-y-3">
        {activeSuggestions.map((type) => (
          <SmartSuggestionCard
            key={`${phase}-${type}`}
            type={type as 'think' | 'critique' | 'research'}
            context={context}
            phase={phase}
            roomId={roomId}
            data={data}
            onDismiss={() => handleDismissSuggestion(type)}
            onOpenAIPanel={onOpenAIPanel}
            onApplySuggestion={handleApplySuggestion}
          />
        ))}
      </div>

      {/* Contextual Tips */}
      {progress < 0.3 && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-yellow-800 font-medium">
                💡 {t('ai.tip')}
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                {phase === 'foundation' && t('ai.foundationTip')}
                {phase === 'differentiation' && t('ai.differentiationTip')}
                {phase === 'approach' && t('ai.approachTip')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};