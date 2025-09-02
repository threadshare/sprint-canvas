import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api/client';
import type { AgentRequest, AgentResponse } from '@/lib/api/types';
import {
  Lightbulb,
  Target,
  Search,
  ChevronDown,
  ChevronUp,
  Loader2,
  MessageSquare,
  Sparkles,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SmartSuggestionCardProps {
  type: 'think' | 'critique' | 'research';
  context: string;
  phase: string;
  roomId: string;
  data?: any;
  trigger?: string; // When to show the suggestion
  className?: string;
  onDismiss?: () => void;
  onOpenAIPanel?: (agentType: 'think' | 'critique' | 'research', initialMessage?: string) => void;
  onApplySuggestion?: (suggestion: any) => void;
}

const agentConfig = {
  think: {
    icon: Lightbulb,
    title: '帮我想',
    color: 'blue',
    description: '发现思考盲点',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
  },
  critique: {
    icon: Target,
    title: '批判我',
    color: 'red',
    description: '挑战假设',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
  },
  research: {
    icon: Search,
    title: '查一查',
    color: 'green',
    description: '深度研究',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
  },
};

export const SmartSuggestionCard: React.FC<SmartSuggestionCardProps> = ({
  type,
  context,
  phase,
  roomId,
  data,
  trigger,
  className,
  onDismiss,
  onOpenAIPanel,
  onApplySuggestion,
}) => {
  const [suggestion, setSuggestion] = useState<AgentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const config = agentConfig[type];
  const Icon = config.icon;

  // Auto-generate suggestion based on context
  useEffect(() => {
    if (!context || dismissed) return;

    const generateSuggestion = async () => {
      setLoading(true);
      try {
        const request: AgentRequest = {
          context,
          query: getContextualQuery(),
          room_id: roomId,
          phase,
          data,
        };

        let response: AgentResponse;
        switch (type) {
          case 'think':
            response = await apiClient.askThinkAgent(request);
            break;
          case 'critique':
            response = await apiClient.askCritiqueAgent(request);
            break;
          case 'research':
            response = await apiClient.askResearchAgent(request);
            break;
        }

        setSuggestion(response);
      } catch (error) {
        console.error('Failed to get AI suggestion:', error);
        // Use fallback suggestions
        setSuggestion(getFallbackSuggestion());
      } finally {
        setLoading(false);
      }
    };

    // Delay to avoid too frequent API calls
    const timer = setTimeout(generateSuggestion, 1000);
    return () => clearTimeout(timer);
  }, [context, phase, roomId, type, data, dismissed]);

  const getContextualQuery = () => {
    const queries = {
      think: {
        foundation: '基于当前的客户、问题、竞争和优势信息，还有什么重要的思考角度被忽略了？',
        differentiation: '在差异化分析中，还有哪些维度值得考虑？',
        approach: '对于这些执行路径，还有什么需要补充思考的？',
      },
      critique: {
        foundation: '请挑战当前对客户、问题、竞争的假设，哪些可能不准确？',
        differentiation: '这些差异化因素真的有效吗？市场会如何反应？',
        approach: '这些执行路径有什么潜在风险和不现实的地方？',
      },
      research: {
        foundation: '需要收集什么数据来验证这些客户痛点和市场假设？',
        differentiation: '有什么市场数据支持这些差异化选择？',
        approach: '这些执行路径有什么成功案例或失败教训？',
      },
    };
    
    return queries[type][phase as keyof typeof queries[typeof type]] || context;
  };

  const getFallbackSuggestion = (): AgentResponse => {
    const fallbacks = {
      think: {
        response: '💡 **思考提醒**\n\n考虑从用户的情感需求角度分析问题。除了功能需求，用户在使用过程中的情感体验如何？这可能会揭示新的机会点。',
        suggestions: ['从情感需求角度思考', '考虑边缘用户场景', '分析竞争对手弱点'],
        confidence: 0.7,
      },
      critique: {
        response: '⚠️ **挑战假设**\n\n当前分析可能过于乐观。建议考虑：用户真的愿意改变现有习惯吗？获客成本是否被低估了？',
        suggestions: ['验证用户意愿', '重新评估成本', '考虑执行难度'],
        confidence: 0.8,
      },
      research: {
        response: '📊 **研究建议**\n\n建议收集竞品的用户评价数据，特别关注用户抱怨最多的功能点，这可能是差异化机会。',
        suggestions: ['用户评价分析', '竞品功能对比', '市场趋势研究'],
        confidence: 0.6,
      },
    };
    
    return {
      agent: type,
      ...fallbacks[type],
      context,
      reasoning: [],
      tools: [],
      next_actions: [],
      metadata: {},
    };
  };

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const handleDetailedDiscussion = () => {
    if (onOpenAIPanel && suggestion) {
      // 打开 AI 面板并传递当前建议作为初始消息
      onOpenAIPanel(type, suggestion.response);
    }
  };

  const handleApplySuggestion = () => {
    if (onApplySuggestion && suggestion) {
      // 将建议应用到当前内容
      onApplySuggestion({
        type,
        suggestion: suggestion.response,
        suggestions: suggestion.suggestions,
        phase,
      });
    }
  };

  if (dismissed || !suggestion) {
    return null;
  }

  return (
    <Card className={cn(
      'relative overflow-hidden transition-all duration-300 hover:shadow-lg',
      config.bgColor,
      config.borderColor,
      'border-l-4',
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              'p-1.5 rounded-lg',
              `bg-${config.color}-100`
            )}>
              <Icon className={cn('h-4 w-4', config.textColor)} />
            </div>
            <div>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-3 w-3" />
                {config.title} AI 建议
              </CardTitle>
              <Badge variant="secondary" className="text-xs mt-1">
                基于当前内容自动生成
              </Badge>
            </div>
          </div>
          
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            AI 正在分析当前内容...
          </div>
        ) : (
          <div className="space-y-3">
            {/* Main suggestion - always visible */}
            <div className="text-sm">
              {suggestion.response.split('\n').slice(0, 2).map((line, i) => (
                <p key={i} className="mb-1 last:mb-0">{line}</p>
              ))}
            </div>

            {/* Expandable content */}
            {expanded && (
              <div className="space-y-3 border-t pt-3">
                {/* Full response */}
                <div className="text-sm text-gray-700">
                  {suggestion.response.split('\n').slice(2).map((line, i) => (
                    <p key={i} className="mb-1 last:mb-0">{line}</p>
                  ))}
                </div>

                {/* Suggestions */}
                {suggestion.suggestions && suggestion.suggestions.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-600 mb-2">具体建议：</h4>
                    <div className="flex flex-wrap gap-1">
                      {suggestion.suggestions.map((item, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs"
                    onClick={handleDetailedDiscussion}
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    详细讨论
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs"
                    onClick={handleApplySuggestion}
                  >
                    应用建议
                  </Button>
                </div>

                {/* Confidence indicator */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>置信度:</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={cn(
                        'h-full rounded-full',
                        `bg-${config.color}-400`
                      )}
                      style={{ width: `${suggestion.confidence * 100}%` }}
                    />
                  </div>
                  <span>{Math.round(suggestion.confidence * 100)}%</span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};