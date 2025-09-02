import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EditableCard } from '@/components/cards/EditableCard';
import { VoteCard } from '@/components/cards/VoteCard';
import { Plus, Users, AlertCircle, Target, TrendingUp, Vote } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FoundationData {
  customers: string[];
  problems: string[];
  competition: string[];
  advantages: string[];
}

interface FoundationStageProps {
  data: FoundationData;
  roomId?: string;
  currentUserId?: string;
  currentUserName?: string;
  readOnly?: boolean;
  onDataChange?: (data: FoundationData) => void;
  onNextStage?: () => void;
  className?: string;
}

interface FoundationSection {
  key: keyof FoundationData;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  variant: 'customer' | 'problem' | 'competition' | 'advantage';
  placeholder: string;
}

const sections: FoundationSection[] = [
  {
    key: 'customers',
    title: '客户是谁？',
    icon: Users,
    description: '定义您的目标客户群体',
    variant: 'customer',
    placeholder: '描述一个客户类型...',
  },
  {
    key: 'problems',
    title: '解决什么问题？',
    icon: AlertCircle,
    description: '明确要解决的核心问题',
    variant: 'problem',
    placeholder: '描述一个具体问题...',
  },
  {
    key: 'competition',
    title: '竞争格局如何？',
    icon: Target,
    description: '分析直接竞争对手、替代品和土办法',
    variant: 'competition',
    placeholder: '描述一个竞争对手或替代方案...',
  },
  {
    key: 'advantages',
    title: '我们的优势？',
    icon: TrendingUp,
    description: '团队的独特能力、洞察或动机',
    variant: 'advantage',
    placeholder: '描述一个独特优势...',
  },
];

export const FoundationStage: React.FC<FoundationStageProps> = ({
  data,
  roomId,
  currentUserId,
  currentUserName,
  readOnly = false,
  onDataChange,
  onNextStage,
  className,
}) => {
  const [activeVote, setActiveVote] = useState<keyof FoundationData | null>(null);
  const [votes, setVotes] = useState<Record<string, any>>({});

  const addItem = (section: keyof FoundationData, text: string) => {
    if (!text.trim()) return;
    
    const newData = {
      ...data,
      [section]: [...data[section], text.trim()],
    };
    onDataChange?.(newData);
  };

  const updateItem = (section: keyof FoundationData, index: number, text: string) => {
    const newData = {
      ...data,
      [section]: data[section].map((item, i) => i === index ? text : item),
    };
    onDataChange?.(newData);
  };

  const deleteItem = (section: keyof FoundationData, index: number) => {
    const newData = {
      ...data,
      [section]: data[section].filter((_, i) => i !== index),
    };
    onDataChange?.(newData);
  };

  const startVoting = (section: keyof FoundationData) => {
    if (data[section].length === 0) return;
    
    setActiveVote(section);
  };

  const handleVote = (optionId: string, comment?: string) => {
    // TODO: 实现投票逻辑
    console.log('投票:', optionId, comment);
  };

  const isStageComplete = () => {
    return Object.values(data).every(items => items.length > 0);
  };

  return (
    <div className={cn('space-y-8', className)}>
      {/* 阶段说明 */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">第一阶段：奠定基础</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-700 text-sm leading-relaxed">
            在这个阶段，我们将回答一些看似简单却至关重要的问题。每个人先独立思考并写下答案，
            然后通过投票达成团队共识。这个过程将帮助我们建立统一的"基础信息表"。
          </p>
        </CardContent>
      </Card>

      {/* Foundation 四个部分 */}
      {sections.map((section) => {
        const IconComponent = section.icon;
        const items = data[section.key];
        const isVoting = activeVote === section.key;

        return (
          <div key={section.key} className="space-y-4">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <IconComponent className="h-6 w-6" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{section.title}</h3>
                    <p className="text-sm text-gray-600 font-normal mt-1">
                      {section.description}
                    </p>
                  </div>
                  {!readOnly && items.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startVoting(section.key)}
                      disabled={isVoting}
                    >
                      <Vote className="h-4 w-4 mr-1" />
                      {isVoting ? '投票中...' : '开始投票'}
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                {isVoting ? (
                  <VoteCard
                    id={`foundation-vote-${section.key}`}
                    title={`${section.title} - 团队投票`}
                    description="请为最重要的选项投票"
                    options={items.map((item, index) => ({
                      id: `${section.key}-${index}`,
                      text: item,
                      description: '',
                      votes: [],
                    }))}
                    currentUserId={currentUserId}
                    currentUserName={currentUserName}
                    onVote={handleVote}
                    showResults={true}
                  />
                ) : (
                  <div className="space-y-4">
                    {/* 已有条目 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {items.map((item, index) => (
                        <EditableCard
                          key={index}
                          id={`${section.key}-${index}`}
                          initialText={item}
                          placeholder={section.placeholder}
                          variant={section.variant}
                          readOnly={readOnly}
                          onSave={(text) => updateItem(section.key, index, text)}
                          onDelete={() => deleteItem(section.key, index)}
                        />
                      ))}
                      
                      {/* 添加新条目 */}
                      {!readOnly && (
                        <EditableCard
                          key="new"
                          placeholder={section.placeholder}
                          variant={section.variant}
                          onSave={(text) => addItem(section.key, text)}
                        />
                      )}
                    </div>

                    {items.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <IconComponent className="h-12 w-12 mx-auto mb-4 opacity-30" />
                        <p className="text-sm">
                          {!readOnly ? `点击上方卡片添加${section.title.replace('？', '')}` : '暂无数据'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      })}

      {/* 进度和下一步 */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-green-800">
                <h4 className="font-semibold">基础阶段进度</h4>
                <p className="text-sm text-green-600">
                  已完成 {Object.values(data).filter(items => items.length > 0).length}/4 个部分
                </p>
              </div>
              
              {/* 进度条 */}
              <div className="w-32 bg-green-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(Object.values(data).filter(items => items.length > 0).length / 4) * 100}%`
                  }}
                />
              </div>
            </div>
            
            {!readOnly && (
              <Button
                onClick={onNextStage}
                disabled={!isStageComplete()}
                className="bg-green-600 hover:bg-green-700"
              >
                下一阶段：差异化分析
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};