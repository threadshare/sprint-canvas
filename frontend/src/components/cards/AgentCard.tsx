import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Search, AlertTriangle, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentMessage {
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

interface AgentCardProps {
  type: 'think' | 'critique' | 'research';
  title: string;
  description: string;
  messages?: AgentMessage[];
  onSendMessage?: (message: string) => Promise<void>;
  loading?: boolean;
  className?: string;
}

const agentConfig = {
  think: {
    icon: Brain,
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    placeholder: '描述您的想法，我会帮您补充思考角度...',
  },
  critique: {
    icon: AlertTriangle,
    color: 'red',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    placeholder: '告诉我您的计划，我会从批判的角度分析...',
  },
  research: {
    icon: Search,
    color: 'green',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    placeholder: '告诉我您想了解的内容，我会帮您深度研究...',
  },
};

export const AgentCard: React.FC<AgentCardProps> = ({
  type,
  title,
  description,
  messages = [],
  onSendMessage,
  loading = false,
  className,
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const config = agentConfig[type];
  const IconComponent = config.icon;

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const message = inputMessage.trim();
    setInputMessage('');

    try {
      await onSendMessage?.(message);
    } catch (error) {
      console.error('发送消息失败:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSendMessage();
    }
  };

  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-card-hover h-full flex flex-col',
      config.bgColor,
      config.borderColor,
      className
    )}>
      <CardHeader className="pb-4 flex-shrink-0">
        <CardTitle className={cn('flex items-center gap-2 text-lg', config.textColor)}>
          <IconComponent className="h-5 w-5" />
          {title}
        </CardTitle>
        <p className={cn('text-sm', config.textColor, 'opacity-80')}>
          {description}
        </p>
      </CardHeader>
      
      <CardContent className="flex flex-col flex-1 space-y-4">
        {/* 消息历史 */}
        <div className="flex-1 min-h-0">
          {messages.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'p-3 rounded-lg text-sm',
                    message.role === 'user'
                      ? 'bg-white border border-gray-200 ml-4'
                      : `bg-${config.color}-100 border border-${config.color}-200 mr-4`
                  )}
                >
                  <div className={cn(
                    'font-medium text-xs mb-1',
                    message.role === 'user' ? 'text-gray-600' : config.textColor
                  )}>
                    {message.role === 'user' ? '您' : title}
                  </div>
                  <div className="text-gray-800 whitespace-pre-wrap">
                    {message.content}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={cn(
              'flex flex-col items-center justify-center h-32 text-center',
              config.textColor,
              'opacity-60'
            )}>
              <IconComponent className="h-8 w-8 mb-2" />
              <p className="text-sm">还没有对话，开始向我提问吧！</p>
            </div>
          )}
        </div>

        {/* 输入区域 */}
        <div className="flex-shrink-0 space-y-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={config.placeholder}
            className={cn(
              'w-full p-3 text-sm border rounded-lg resize-none bg-white',
              'focus:outline-none focus:ring-2 focus:ring-opacity-50',
              config.borderColor,
              `focus:ring-${config.color}-300`,
              'placeholder:text-gray-400'
            )}
            rows={3}
            disabled={loading}
          />
          
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500">
              Ctrl + Enter 发送
            </div>
            
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || loading}
              size="sm"
              className={cn(
                'min-w-[80px]',
                config.color === 'blue' && 'bg-blue-600 hover:bg-blue-700',
                config.color === 'red' && 'bg-red-600 hover:bg-red-700',
                config.color === 'green' && 'bg-green-600 hover:bg-green-700'
              )}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-1" />
                  发送
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};