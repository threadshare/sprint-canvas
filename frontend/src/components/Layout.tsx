import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AgentsPanel } from '@/components/AgentsPanel';
import { 
  Home, 
  Users, 
  Target, 
  Route, 
  Settings,
  Lightbulb,
  MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  currentStage?: 'foundation' | 'differentiation' | 'approach' | 'completed';
  roomName?: string;
  onStageChange?: (stage: string) => void;
  onOpenAIPanel?: (agentType: 'think' | 'critique' | 'research', initialMessage?: string) => void;
  className?: string;
}

const stages = [
  {
    id: 'foundation',
    name: '基础阶段',
    icon: Users,
    description: '定义客户、问题、竞争和优势',
    color: 'blue',
  },
  {
    id: 'differentiation', 
    name: '差异化阶段',
    icon: Target,
    description: '2x2矩阵找到独特定位',
    color: 'purple',
  },
  {
    id: 'approach',
    name: '方法阶段', 
    icon: Route,
    description: 'Magic Lenses多角度评估',
    color: 'green',
  },
];

export const Layout: React.FC<LayoutProps> = ({
  children,
  currentStage = 'foundation',
  roomName = 'Foundation Sprint 工作室',
  onStageChange,
  onOpenAIPanel,
  className,
}) => {
  const [isAgentsPanelOpen, setIsAgentsPanelOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<'think' | 'critique' | 'research' | null>(null);
  const [initialMessage, setInitialMessage] = useState<string>('');

  const handleOpenAIPanel = (agentType: 'think' | 'critique' | 'research', initialMsg?: string) => {
    setSelectedAgent(agentType);
    setInitialMessage(initialMsg || '');
    setIsAgentsPanelOpen(true);
    
    // 如果有外部处理函数，也调用它
    if (onOpenAIPanel) {
      onOpenAIPanel(agentType, initialMsg);
    }
  };
  return (
    <div className={cn('min-h-screen gradient-foundation', className)}>
      {/* 顶部导航 */}
      <header className="header-card border-b-0 rounded-none shadow-paper bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <Lightbulb className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foundation bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {roomName}
                </h1>
                <p className="text-sm text-foundation/70 font-medium">
                  Foundation Sprint 协作工具
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsAgentsPanelOpen(!isAgentsPanelOpen)}
                className={isAgentsPanelOpen ? 'bg-blue-100 text-blue-700' : ''}
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                AI 助手
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* 左侧导航 */}
          <aside className="w-64 flex-shrink-0">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">工作流程</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {stages.map((stage, index) => {
                  const IconComponent = stage.icon;
                  const isActive = currentStage === stage.id;
                  const isCompleted = stages.findIndex(s => s.id === currentStage) > index;
                  
                  return (
                    <button
                      key={stage.id}
                      onClick={() => onStageChange?.(stage.id)}
                      className={cn(
                        'w-full text-left p-3 rounded-lg transition-all',
                        'flex items-start gap-3 group',
                        isActive 
                          ? `bg-${stage.color}-100 border-${stage.color}-200 border`
                          : isCompleted
                          ? 'bg-green-50 border-green-200 border'
                          : 'hover:bg-gray-50 border border-transparent'
                      )}
                    >
                      <div className={cn(
                        'p-1.5 rounded',
                        isActive 
                          ? `bg-${stage.color}-200` 
                          : isCompleted 
                          ? 'bg-green-200'
                          : 'bg-gray-100 group-hover:bg-gray-200'
                      )}>
                        <IconComponent className={cn(
                          'h-4 w-4',
                          isActive 
                            ? `text-${stage.color}-700`
                            : isCompleted
                            ? 'text-green-700' 
                            : 'text-gray-600'
                        )} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className={cn(
                          'font-medium text-sm',
                          isActive 
                            ? `text-${stage.color}-800`
                            : isCompleted
                            ? 'text-green-800'
                            : 'text-gray-700'
                        )}>
                          {stage.name}
                        </div>
                        <div className={cn(
                          'text-xs mt-0.5 leading-tight',
                          isActive 
                            ? `text-${stage.color}-600`
                            : isCompleted
                            ? 'text-green-600' 
                            : 'text-gray-500'
                        )}>
                          {stage.description}
                        </div>
                      </div>
                      
                      {isCompleted && (
                        <div className="text-green-600">
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </aside>

          {/* 主要内容区域 */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
      
      {/* AI Agents Panel */}
      <AgentsPanel
        isOpen={isAgentsPanelOpen}
        onClose={() => setIsAgentsPanelOpen(false)}
        roomContext={`当前阶段: ${currentStage}, 房间: ${roomName}`}
        selectedAgent={selectedAgent}
        initialMessage={initialMessage}
      />
    </div>
  );
};