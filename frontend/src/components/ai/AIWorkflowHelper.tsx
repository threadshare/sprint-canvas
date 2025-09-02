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

interface AIWorkflowHelperProps {
  phase: 'foundation' | 'differentiation' | 'approach';
  roomId: string;
  data: any;
  context: string;
  className?: string;
}

export const AIWorkflowHelper: React.FC<AIWorkflowHelperProps> = ({
  phase,
  roomId,
  data,
  context,
  className,
}) => {
  const [activeSuggestions, setActiveSuggestions] = useState<string[]>([]);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());
  const [aiPanelOpen, setAiPanelOpen] = useState(false);

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

  const getPhaseName = (phase: string) => {
    const names = {
      foundation: '基础阶段',
      differentiation: '差异化阶段',
      approach: '方法阶段',
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
                AI 助手 - {getPhaseName(phase)}
              </span>
              <Badge variant="secondary" className="text-xs">
                {activeSuggestions.length} 条建议
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
                {Math.round(progress * 100)}% 完成
              </span>
            </div>
          </div>
        </div>

        <Popover open={aiPanelOpen} onOpenChange={setAiPanelOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="text-xs">
              <MessageCircle className="h-4 w-4 mr-1" />
              AI 对话
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" side="left">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">选择 AI 助手</h4>
              <div className="grid grid-cols-1 gap-2">
                {['think', 'critique', 'research'].map((type) => (
                  <Button
                    key={type}
                    variant="outline"
                    size="sm"
                    className="justify-start text-xs"
                    onClick={() => {
                      // Open individual AI chat
                      setAiPanelOpen(false);
                    }}
                  >
                    <ChevronRight className="h-3 w-3 mr-1" />
                    {type === 'think' && '帮我想 - 补充思考'}
                    {type === 'critique' && '批判我 - 挑战假设'}
                    {type === 'research' && '查一查 - 深度研究'}
                  </Button>
                ))}
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
                💡 小贴士
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                {phase === 'foundation' && '先填写客户和问题信息，AI 会自动提供针对性建议'}
                {phase === 'differentiation' && '添加差异化因素后，AI 会帮助分析竞争优势'}
                {phase === 'approach' && '列出执行路径后，AI 会协助评估可行性'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};