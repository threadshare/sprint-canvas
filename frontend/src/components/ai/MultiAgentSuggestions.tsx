import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api/client';
import type { AgentRequest, AgentResponse } from '@/lib/api/types';
import {
  Lightbulb,
  Target,
  Search,
  MessageSquare,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MultiAgentSuggestionsProps {
  phase: string;
  roomId: string;
  data: any;
  context: string;
  className?: string;
  onOpenAIPanel?: (agentType: 'think' | 'critique' | 'research', initialMessage?: string) => void;
  onApplySuggestion?: (suggestion: any) => void;
}

interface AgentSuggestion {
  type: 'think' | 'critique' | 'research';
  response: AgentResponse | null;
  loading: boolean;
  error: string | null;
}

const agentConfig = {
  think: {
    icon: Lightbulb,
    title: '帮我想',
    shortTitle: '思考',
    color: 'blue',
    description: '发现思考盲点，提供新视角',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    tabColor: 'data-[state=active]:bg-blue-500 data-[state=active]:text-white',
  },
  critique: {
    icon: Target,
    title: '批判我',
    shortTitle: '批判',
    color: 'red',
    description: '挑战假设，评估风险',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    tabColor: 'data-[state=active]:bg-red-500 data-[state=active]:text-white',
  },
  research: {
    icon: Search,
    title: '查一查',
    shortTitle: '研究',
    color: 'green',
    description: '深度研究，数据支持',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
    tabColor: 'data-[state=active]:bg-green-500 data-[state=active]:text-white',
  },
};

export const MultiAgentSuggestions: React.FC<MultiAgentSuggestionsProps> = ({
  phase,
  roomId,
  data,
  context,
  className,
  onOpenAIPanel,
  onApplySuggestion,
}) => {
  const [suggestions, setSuggestions] = useState<Record<string, AgentSuggestion>>({
    think: { type: 'think', response: null, loading: true, error: null },
    critique: { type: 'critique', response: null, loading: true, error: null },
    research: { type: 'research', response: null, loading: true, error: null },
  });
  const [expandedAll, setExpandedAll] = useState(false);
  const [activeTab, setActiveTab] = useState<'think' | 'critique' | 'research'>('think');

  // 并行调用所有三个 Agent
  useEffect(() => {
    const fetchAllSuggestions = async () => {
      const request: AgentRequest = {
        context,
        query: getContextualQuery(phase),
        room_id: roomId,
        phase,
        data,
      };

      // 并行调用三个 Agent
      const promises = [
        fetchAgentSuggestion('think', request),
        fetchAgentSuggestion('critique', request),
        fetchAgentSuggestion('research', request),
      ];

      await Promise.all(promises);
    };

    fetchAllSuggestions();
  }, [context, phase, roomId, data]);

  const fetchAgentSuggestion = async (type: 'think' | 'critique' | 'research', request: AgentRequest) => {
    try {
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

      setSuggestions(prev => ({
        ...prev,
        [type]: { ...prev[type], response, loading: false },
      }));
    } catch (error) {
      console.error(`Failed to get ${type} agent suggestion:`, error);
      
      // 使用后备建议
      setSuggestions(prev => ({
        ...prev,
        [type]: { 
          ...prev[type], 
          response: getFallbackSuggestion(type), 
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load suggestion',
        },
      }));
    }
  };

  const getContextualQuery = (phase: string) => {
    const queries = {
      foundation: '基于当前的基础信息，提供全面的分析和建议',
      differentiation: '基于差异化分析，提供深入的见解和改进方向',
      approach: '基于执行方法，提供实施建议和风险评估',
    };
    return queries[phase as keyof typeof queries] || context;
  };

  const getFallbackSuggestion = (type: 'think' | 'critique' | 'research'): AgentResponse => {
    const fallbacks = {
      think: {
        response: '💡 **思考补充**\n\n1. 考虑用户的长期价值\n2. 思考生态系统的构建\n3. 评估网络效应的可能性',
        suggestions: ['用户留存策略', '社区建设', '价值链分析'],
        confidence: 0.7,
      },
      critique: {
        response: '⚠️ **风险评估**\n\n1. 市场教育成本可能很高\n2. 技术实现复杂度被低估\n3. 竞争对手反应速度快',
        suggestions: ['MVP验证', '成本预算', '竞争分析'],
        confidence: 0.8,
      },
      research: {
        response: '📊 **市场研究**\n\n1. 目标市场规模：XX亿\n2. 增长率：年均XX%\n3. 主要玩家：A、B、C',
        suggestions: ['用户访谈', '竞品分析', '行业报告'],
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

  const handleDetailedDiscussion = (type: 'think' | 'critique' | 'research') => {
    const suggestion = suggestions[type];
    if (onOpenAIPanel && suggestion.response) {
      onOpenAIPanel(type, suggestion.response.response);
    }
  };

  const handleApplySuggestion = (type: 'think' | 'critique' | 'research') => {
    const suggestion = suggestions[type];
    if (onApplySuggestion && suggestion.response) {
      onApplySuggestion({
        type,
        suggestion: suggestion.response.response,
        suggestions: suggestion.response.suggestions,
        phase,
      });
    }
  };

  const getSuggestionCount = (type: 'think' | 'critique' | 'research') => {
    const suggestion = suggestions[type];
    if (!suggestion.response || !suggestion.response.suggestions) return 0;
    return suggestion.response.suggestions.length;
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-lg">AI 全方位分析</CardTitle>
            <Badge variant="secondary" className="text-xs">
              并行分析中
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpandedAll(!expandedAll)}
          >
            {expandedAll ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                收起全部
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                展开全部
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            {(['think', 'critique', 'research'] as const).map((type) => {
              const config = agentConfig[type];
              const Icon = config.icon;
              const count = getSuggestionCount(type);
              const loading = suggestions[type].loading;
              
              return (
                <TabsTrigger
                  key={type}
                  value={type}
                  className={cn(
                    "flex items-center gap-2 relative",
                    config.tabColor
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{config.title}</span>
                  <span className="sm:hidden">{config.shortTitle}</span>
                  {loading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : count > 0 ? (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {count}
                    </Badge>
                  ) : null}
                </TabsTrigger>
              );
            })}
          </TabsList>
          
          {(['think', 'critique', 'research'] as const).map((type) => {
            const config = agentConfig[type];
            const suggestion = suggestions[type];
            
            return (
              <TabsContent key={type} value={type} className="space-y-4">
                <div className={cn(
                  'p-4 rounded-lg border-l-4',
                  config.bgColor,
                  config.borderColor
                )}>
                  {suggestion.loading ? (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      AI 正在分析...
                    </div>
                  ) : suggestion.error ? (
                    <div className="text-sm text-red-600">
                      加载失败：{suggestion.error}
                    </div>
                  ) : suggestion.response ? (
                    <div className="space-y-4">
                      {/* 主要建议内容 */}
                      <div className={cn('text-sm whitespace-pre-wrap', config.textColor)}>
                        {expandedAll 
                          ? suggestion.response.response 
                          : suggestion.response.response.split('\n').slice(0, 3).join('\n')}
                      </div>
                      
                      {/* 具体建议标签 */}
                      {suggestion.response.suggestions && suggestion.response.suggestions.length > 0 && (
                        <div>
                          <h4 className="text-xs font-medium text-gray-600 mb-2">具体建议：</h4>
                          <div className="flex flex-wrap gap-1">
                            {suggestion.response.suggestions.map((item, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* 操作按钮 */}
                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs"
                          onClick={() => handleDetailedDiscussion(type)}
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          详细讨论
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs"
                          onClick={() => handleApplySuggestion(type)}
                        >
                          应用建议
                        </Button>
                      </div>
                      
                      {/* 置信度指示器 */}
                      {suggestion.response.confidence !== undefined && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>置信度:</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5 max-w-[100px]">
                            <div 
                              className={cn(
                                'h-full rounded-full',
                                `bg-${config.color}-400`
                              )}
                              style={{ width: `${suggestion.response.confidence * 100}%` }}
                            />
                          </div>
                          <span>{Math.round(suggestion.response.confidence * 100)}%</span>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
};