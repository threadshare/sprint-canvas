import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AgentCard } from '@/components/cards/AgentCard';
import { X, MessageCircle, Minimize2, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentMessage {
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

interface AgentsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  roomContext?: string;
  className?: string;
}

export const AgentsPanel: React.FC<AgentsPanelProps> = ({
  isOpen,
  onClose,
  roomContext = '',
  className,
}) => {
  const [activeAgent, setActiveAgent] = useState<'think' | 'critique' | 'research' | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [agentMessages, setAgentMessages] = useState<{
    think: AgentMessage[];
    critique: AgentMessage[];
    research: AgentMessage[];
  }>({
    think: [],
    critique: [],
    research: [],
  });
  const [loadingAgent, setLoadingAgent] = useState<string | null>(null);

  const agents = [
    {
      id: 'think' as const,
      title: '帮我想',
      description: '补充思考角度，发现盲点',
      shortDesc: '补充思考',
    },
    {
      id: 'critique' as const,
      title: '批判我',
      description: '挑战理想主义，评估市场现实性',
      shortDesc: '批判分析',
    },
    {
      id: 'research' as const,
      title: '查一查',
      description: '深度研究，收集相关资料',
      shortDesc: '深度研究',
    },
  ];

  const handleSendMessage = async (agentType: 'think' | 'critique' | 'research', message: string) => {
    // 添加用户消息
    const userMessage: AgentMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setAgentMessages(prev => ({
      ...prev,
      [agentType]: [...prev[agentType], userMessage],
    }));

    setLoadingAgent(agentType);

    try {
      // TODO: 实际调用后端 API
      const response = await fetch('/api/v1/agents/' + agentType, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context: roomContext,
          query: message,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get agent response');
      }

      const data = await response.json();
      
      // 添加 Agent 回复
      const agentMessage: AgentMessage = {
        role: 'agent',
        content: data.response || '抱歉，我暂时无法回答这个问题。',
        timestamp: new Date(),
      };

      setAgentMessages(prev => ({
        ...prev,
        [agentType]: [...prev[agentType], agentMessage],
      }));
    } catch (error) {
      console.error('Agent API error:', error);
      
      // 模拟响应
      const mockResponses = {
        think: '从我的角度来看，这个想法有几个值得深入思考的方面...',
        critique: '让我从批判的角度分析一下这个计划的可行性...',
        research: '我为您找到了一些相关的市场数据和竞品信息...',
      };

      const agentMessage: AgentMessage = {
        role: 'agent',
        content: mockResponses[agentType],
        timestamp: new Date(),
      };

      setAgentMessages(prev => ({
        ...prev,
        [agentType]: [...prev[agentType], agentMessage],
      }));
    } finally {
      setLoadingAgent(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={cn(
      'fixed inset-y-0 right-0 z-50 flex flex-col bg-white border-l border-gray-200 shadow-lg transition-all duration-300',
      isMinimized ? 'w-16' : 'w-96',
      className
    )}>
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        {!isMinimized && (
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-800">AI 助手团队</h3>
          </div>
        )}
        
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Agent 选择器 */}
          <div className="p-4 border-b border-gray-200">
            <div className="grid grid-cols-1 gap-2">
              {agents.map((agent) => {
                const isActive = activeAgent === agent.id;
                const hasMessages = agentMessages[agent.id].length > 0;
                
                return (
                  <button
                    key={agent.id}
                    onClick={() => setActiveAgent(isActive ? null : agent.id)}
                    className={cn(
                      'p-3 text-left rounded-lg border transition-all',
                      isActive 
                        ? 'border-blue-300 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={cn(
                          'font-medium text-sm',
                          isActive ? 'text-blue-800' : 'text-gray-800'
                        )}>
                          {agent.title}
                        </div>
                        <div className={cn(
                          'text-xs mt-1',
                          isActive ? 'text-blue-600' : 'text-gray-600'
                        )}>
                          {agent.shortDesc}
                        </div>
                      </div>
                      
                      {hasMessages && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Agent 对话区域 */}
          <div className="flex-1 overflow-hidden">
            {activeAgent ? (
              <div className="h-full">
                <AgentCard
                  type={activeAgent}
                  title={agents.find(a => a.id === activeAgent)?.title || ''}
                  description={agents.find(a => a.id === activeAgent)?.description || ''}
                  messages={agentMessages[activeAgent]}
                  onSendMessage={(message) => handleSendMessage(activeAgent, message)}
                  loading={loadingAgent === activeAgent}
                  className="h-full border-0 rounded-none shadow-none"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center p-6">
                <div>
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h4 className="font-medium text-gray-800 mb-2">选择一个AI助手</h4>
                  <p className="text-sm text-gray-600">
                    从上方选择一个助手开始对话
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* 最小化状态 */}
      {isMinimized && (
        <div className="flex flex-col items-center gap-4 p-2 mt-4">
          {agents.map((agent) => {
            const hasMessages = agentMessages[agent.id].length > 0;
            
            return (
              <button
                key={agent.id}
                onClick={() => {
                  setIsMinimized(false);
                  setActiveAgent(agent.id);
                }}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title={agent.title}
              >
                <MessageCircle className="h-6 w-6 text-gray-600" />
                {hasMessages && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};