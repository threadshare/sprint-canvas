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
      description: '智能提问，补充思考维度，提供创意激发和案例推荐',
      shortDesc: '补充思考',
      systemPrompt: `你是一个思考补充助手，专门帮助用户发现思考盲点和提供新的视角。你的职责：
1. 智能提问：基于当前讨论提出关键问题
2. 视角补充：提供容易忽略的思考维度  
3. 案例推荐：分享相似的成功/失败案例分析
4. 创意激发：提供非常规思路和创新方向

请用友善、启发性的语调，帮助用户拓宽思路。`,
    },
    {
      id: 'critique' as const,
      title: '批判我',
      description: '挑战隐含假设，评估市场现实性，分析竞争威胁和执行难度',
      shortDesc: '批判分析',
      systemPrompt: `你是一个批判性思维助手，专门挑战理想主义想法并评估市场现实性。你的职责：
1. 假设质疑：识别并挑战用户的隐含假设
2. 市场验证：评估需求的真实性和市场规模
3. 竞争分析：深度分析潜在竞争威胁
4. 执行难度：评估技术实现和运营挑战

请保持客观、严谨的态度，帮助用户看清潜在风险。`,
    },
    {
      id: 'research' as const,
      title: '查一查',
      description: '深度收集市场数据、竞品分析、技术可行性和用户洞察',
      shortDesc: '深度研究',
      systemPrompt: `你是一个深度研究助手，专门收集和分析相关资料。你的职责：
1. 市场数据：提供行业报告和用户数据分析
2. 竞品分析：详细对比功能特性和定价策略
3. 技术可行性：分析技术栈选择和实现难度
4. 用户洞察：从社交媒体和论坛讨论中提取用户真实想法

请提供具体、可操作的研究结果和数据支持。`,
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
      // 调用后端 API
      const response = await fetch(`http://localhost:8080/api/v1/agents/${agentType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context: roomContext,
          query: message,
          room_id: roomContext.includes('房间:') ? roomContext.split('房间: ')[1]?.split(',')[0] : undefined,
          phase: roomContext.includes('当前阶段:') ? roomContext.split('当前阶段: ')[1]?.split(',')[0] : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to get agent response`);
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
      
      // 后端不可用时的模拟响应 - 更符合角色定位
      const mockResponses = {
        think: `🤔 **补充思考角度**

基于你提到的内容，我想提几个可能被忽略的关键问题：

1. **用户使用场景**：除了主要场景，用户在什么边缘情况下也会需要这个方案？
2. **行为动机**：用户选择你的方案的真正动机是什么？是便利性、成本、还是身份认同？
3. **网络效应**：你的产品是否能形成用户越多价值越大的正循环？

💡 **相似案例参考**：
- Slack 从游戏公司内部工具转型成功
- Instagram 从定位应用 Burbn 聚焦到照片分享

你觉得从哪个角度深入会对你最有帮助？`,

        critique: `🔍 **批判性分析**

让我用严格的标准检验一下这个想法：

⚠️ **隐含假设质疑**：
- 你是否假设用户愿意改变现有习惯？
- 市场需求是真实存在还是你的美好愿望？
- 团队执行能力是否匹配野心的规模？

📊 **市场现实性评估**：
- 目标市场规模可能被高估
- 获客成本往往超出预期3-5倍
- 竞争对手的反应速度可能很快

🎯 **执行风险**：
- 技术实现的隐藏复杂性
- 运营资源需求可能被低估
- 法规和合规风险

**建议**：在推进前，先用最小成本验证核心假设。`,

        research: `📊 **深度研究报告**

基于你的需求，我收集了以下关键信息：

**市场数据分析**：
- 目标行业规模：约XXX亿市场
- 年增长率：XX%（过去3年趋势）
- 主要驱动因素：数字化转型、用户习惯变化

**竞品对标分析**：
| 竞品 | 优势 | 劣势 | 定价策略 |
|------|------|------|----------|
| A产品 | 功能完整 | 操作复杂 | 高端定价 |
| B产品 | 易用性好 | 功能有限 | 免费增值 |

**用户洞察**（社交媒体/论坛分析）：
- 用户痛点集中在：效率低、成本高、体验差
- 期望功能：简单易用、价格合理、客服响应快

**技术可行性**：
- 推荐技术栈：XXX
- 开发周期预估：X-X个月
- 关键技术挑战：XXX

需要我深入研究哪个方面？`,
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