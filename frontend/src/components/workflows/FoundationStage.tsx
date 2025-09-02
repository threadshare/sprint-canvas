import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { EditableCard } from '@/components/cards/EditableCard';
import { ProblemCard } from '@/components/cards/ProblemCard';
import { CompetitionCard } from '@/components/cards/CompetitionCard';
import { AdvantageCard } from '@/components/cards/AdvantageCard';
import { AIWorkflowHelper } from '@/components/ai/AIWorkflowHelper';
import { VoteDialog } from '@/components/VoteDialog';
import { Users, AlertCircle, Target, TrendingUp, Vote } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProblemItem {
  id: string;
  description: string;
  severity: number;
  impact: 'few' | 'some' | 'many' | 'most';
}

interface CompetitionItem {
  id: string;
  name: string;
  type: 'direct' | 'alternative' | 'workaround';
  description: string;
}

interface AdvantageItem {
  id: string;
  description: string;
  category: 'technical' | 'insight' | 'resource' | 'motivation';
}

interface FoundationData {
  customers: string[];
  problems: ProblemItem[];
  competition: CompetitionItem[];
  advantages: AdvantageItem[];
}

interface FoundationStageProps {
  data: FoundationData;
  roomId?: string;
  currentUserId?: string;
  currentUserName?: string;
  readOnly?: boolean;
  onDataChange?: (data: FoundationData) => void;
  onNextStage?: () => void;
  onOpenAIPanel?: (agentType: 'think' | 'critique' | 'research', initialMessage?: string) => void;
  className?: string;
  participants?: Array<{ id: string; name: string; online: boolean }>;
}


export const FoundationStage: React.FC<FoundationStageProps> = ({
  data,
  roomId,
  currentUserId,
  currentUserName,
  readOnly = false,
  onDataChange,
  onNextStage,
  onOpenAIPanel,
  className,
  participants = [],
}) => {
  const { t } = useLanguage();
  const [voteDialogOpen, setVoteDialogOpen] = useState(false);
  const [voteSubject, setVoteSubject] = useState<'customers' | 'problems' | 'competition' | 'advantages'>('customers');
  const [activeVote, setActiveVote] = useState<keyof FoundationData | null>(null);
  
  const canVote = participants.filter(p => p.online).length > 1;

  const addCustomer = (text: string) => {
    if (!text.trim()) return;
    const newData = {
      ...data,
      customers: [...data.customers, text.trim()],
    };
    onDataChange?.(newData);
  };

  const updateCustomer = (index: number, text: string) => {
    const newData = {
      ...data,
      customers: data.customers.map((item, i) => i === index ? text : item),
    };
    onDataChange?.(newData);
  };

  const deleteCustomer = (index: number) => {
    const newData = {
      ...data,
      customers: data.customers.filter((_, i) => i !== index),
    };
    onDataChange?.(newData);
  };

  const addProblem = (problem: ProblemItem) => {
    const newData = {
      ...data,
      problems: [...data.problems, problem],
    };
    onDataChange?.(newData);
  };

  const updateProblem = (index: number, problem: ProblemItem) => {
    const newData = {
      ...data,
      problems: data.problems.map((item, i) => i === index ? problem : item),
    };
    onDataChange?.(newData);
  };

  const deleteProblem = (index: number) => {
    const newData = {
      ...data,
      problems: data.problems.filter((_, i) => i !== index),
    };
    onDataChange?.(newData);
  };

  const addCompetition = (competition: CompetitionItem) => {
    const newData = {
      ...data,
      competition: [...data.competition, competition],
    };
    onDataChange?.(newData);
  };

  const updateCompetition = (index: number, competition: CompetitionItem) => {
    const newData = {
      ...data,
      competition: data.competition.map((item, i) => i === index ? competition : item),
    };
    onDataChange?.(newData);
  };

  const deleteCompetition = (index: number) => {
    const newData = {
      ...data,
      competition: data.competition.filter((_, i) => i !== index),
    };
    onDataChange?.(newData);
  };

  const addAdvantage = (advantage: AdvantageItem) => {
    const newData = {
      ...data,
      advantages: [...data.advantages, advantage],
    };
    onDataChange?.(newData);
  };

  const updateAdvantage = (index: number, advantage: AdvantageItem) => {
    const newData = {
      ...data,
      advantages: data.advantages.map((item, i) => i === index ? advantage : item),
    };
    onDataChange?.(newData);
  };

  const deleteAdvantage = (index: number) => {
    const newData = {
      ...data,
      advantages: data.advantages.filter((_, i) => i !== index),
    };
    onDataChange?.(newData);
  };

  // 预留投票入口（当前未启用）

  const isStageComplete = () => {
    return Object.values(data).every(items => items.length > 0);
  };

  return (
    <div className={cn('space-y-8', className)}>
      {/* 阶段说明 */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">{t('foundation.stageTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-700 text-sm leading-relaxed">
            {t('foundation.stageDesc')}
          </p>
        </CardContent>
      </Card>

      {/* AI 工作流助手 */}
      {roomId && (
        <AIWorkflowHelper
          phase="foundation"
          roomId={roomId}
          data={data}
          context={`当前阶段: foundation, 客户: ${data.customers.join(', ')}, 问题: ${data.problems.map(p => p.description).join(', ')}, 竞争: ${data.competition.map(c => c.name).join(', ')}, 优势: ${data.advantages.map(a => a.description).join(', ')}`}
          onOpenAIPanel={onOpenAIPanel}
          onDataChange={onDataChange}
        />
      )}

      {/* 客户是谁 */}
      <div className="space-y-4">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6" />
                <div>
                  <h3 className="text-lg font-semibold">{t('foundation.customers')}</h3>
                  <p className="text-sm text-gray-600 font-normal mt-1">
                    {t('foundation.customersDesc')}
                  </p>
                </div>
              </div>
              {canVote && !readOnly && data.customers.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setVoteSubject('customers');
                    setVoteDialogOpen(true);
                  }}
                >
                  <Vote className="h-4 w-4 mr-1" />
                  {t('common.vote')}
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.customers.map((customer, index) => (
                  <EditableCard
                    key={index}
                    id={`customer-${index}`}
                    initialText={customer}
                    placeholder={t('foundation.addCustomer')}
                    variant="customer"
                    readOnly={readOnly}
                    onSave={(text) => updateCustomer(index, text)}
                    onDelete={() => deleteCustomer(index)}
                  />
                ))}
                
                {!readOnly && (
                  <EditableCard
                    key="new"
                    placeholder={t('foundation.addCustomer')}
                    variant="customer"
                    onSave={(text) => addCustomer(text)}
                  />
                )}
              </div>

              {data.customers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="text-sm">{t('foundation.addCustomerHint')}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 解决什么问题 */}
      <div className="space-y-4">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{t('foundation.problems')}</h3>
                <p className="text-sm text-gray-600 font-normal mt-1">
                  {t('foundation.problemsDesc')}
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.problems.map((problem, index) => (
                  <ProblemCard
                    key={problem.id}
                    problem={problem}
                    readOnly={readOnly}
                    onSave={(updatedProblem) => updateProblem(index, updatedProblem)}
                    onDelete={() => deleteProblem(index)}
                  />
                ))}
                
                {!readOnly && (
                  <ProblemCard
                    key="new"
                    placeholder="描述一个具体问题..."
                    onSave={(problem) => addProblem(problem)}
                  />
                )}
              </div>

              {data.problems.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="text-sm">{t('foundation.addProblem')}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 竞争格局如何 */}
      <div className="space-y-4">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Target className="h-6 w-6" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{t('foundation.competition')}</h3>
                <p className="text-sm text-gray-600 font-normal mt-1">
                  {t('foundation.competitionDesc')}
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.competition.map((competition, index) => (
                  <CompetitionCard
                    key={competition.id}
                    competition={competition}
                    readOnly={readOnly}
                    onSave={(updatedCompetition) => updateCompetition(index, updatedCompetition)}
                    onDelete={() => deleteCompetition(index)}
                  />
                ))}
                
                {!readOnly && (
                  <CompetitionCard
                    key="new"
                    placeholder={t('foundation.addCompetitor')}
                    onSave={(competition) => addCompetition(competition)}
                  />
                )}
              </div>

              {data.competition.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="text-sm">{t('foundation.addCompetitorHint')}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 我们的优势 */}
      <div className="space-y-4">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{t('foundation.advantages')}</h3>
                <p className="text-sm text-gray-600 font-normal mt-1">
                  {t('foundation.advantagesDesc')}
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.advantages.map((advantage, index) => (
                  <AdvantageCard
                    key={advantage.id}
                    advantage={advantage}
                    readOnly={readOnly}
                    onSave={(updatedAdvantage) => updateAdvantage(index, updatedAdvantage)}
                    onDelete={() => deleteAdvantage(index)}
                  />
                ))}
                
                {!readOnly && (
                  <AdvantageCard
                    key="new"
                    placeholder={t('foundation.addAdvantage')}
                    onSave={(advantage) => addAdvantage(advantage)}
                  />
                )}
              </div>

              {data.advantages.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="text-sm">{t('foundation.addAdvantageHint')}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 进度和下一步 */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-green-800">
                <h4 className="font-semibold">{t('foundation.progress')}</h4>
                <p className="text-sm text-green-600">
                  {t('foundation.progressDesc')} {Object.values(data).filter(items => items.length > 0).length}/4 {t('foundation.ofParts')}
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
                {t('foundation.nextStageDifferentiation')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Vote Dialog */}
      {roomId && currentUserId && currentUserName && (
        <VoteDialog
          isOpen={voteDialogOpen}
          onClose={() => setVoteDialogOpen(false)}
          roomId={roomId}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          voteSubject={voteSubject}
          options={
            voteSubject === 'customers' ? data.customers :
            voteSubject === 'problems' ? data.problems.map(p => p.description) :
            voteSubject === 'competition' ? data.competition.map(c => c.name) :
            data.advantages.map(a => a.description)
          }
          participants={participants}
        />
      )}
    </div>
  );
};