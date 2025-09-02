import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Users, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Vote {
  userId: string;
  userName: string;
  weight: number;
  comment?: string;
  votedAt: string;
}

interface VoteOption {
  id: string;
  text: string;
  description?: string;
  votes: Vote[];
}

interface VoteCardProps {
  id: string;
  title: string;
  description?: string;
  options: VoteOption[];
  currentUserId?: string;
  currentUserName?: string;
  onVote?: (optionId: string, comment?: string) => void;
  readOnly?: boolean;
  showResults?: boolean;
  className?: string;
}

export const VoteCard: React.FC<VoteCardProps> = ({
  id,
  title,
  description,
  options,
  currentUserId,
  currentUserName,
  onVote,
  readOnly = false,
  showResults = false,
  className,
}) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [comment, setComment] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);

  // 计算每个选项的总分和用户投票状态
  const optionsWithStats = options.map(option => {
    const totalScore = option.votes.reduce((sum, vote) => sum + vote.weight, 0);
    const userVoted = currentUserId ? option.votes.some(vote => vote.userId === currentUserId) : false;
    const voteCount = option.votes.length;
    
    return {
      ...option,
      totalScore,
      userVoted,
      voteCount,
    };
  });

  const totalVotes = optionsWithStats.reduce((sum, option) => sum + option.totalScore, 0);
  const maxScore = Math.max(...optionsWithStats.map(option => option.totalScore));

  const handleVote = (optionId: string) => {
    if (readOnly) return;
    
    setSelectedOption(optionId);
    if (showCommentInput) {
      onVote?.(optionId, comment);
      setComment('');
      setShowCommentInput(false);
    } else {
      onVote?.(optionId);
    }
  };

  const handleVoteWithComment = (optionId: string) => {
    if (readOnly) return;
    
    setSelectedOption(optionId);
    setShowCommentInput(true);
  };

  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-card-hover',
      'border-violet-200 bg-violet-50',
      className
    )}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-violet-800">{title}</CardTitle>
        {description && (
          <p className="text-sm text-violet-600 mt-1">{description}</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3">
        {optionsWithStats.map((option) => (
          <div key={option.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className={cn(
                  'p-3 rounded-lg border-2 transition-all cursor-pointer',
                  option.userVoted
                    ? 'border-violet-300 bg-violet-100'
                    : 'border-gray-200 bg-white hover:border-violet-200 hover:bg-violet-50',
                  readOnly && 'cursor-default'
                )}
                onClick={() => !readOnly && handleVote(option.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800">
                      {option.text}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      {showResults && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Heart className="h-3 w-3" />
                          <span>{option.totalScore}</span>
                        </div>
                      )}
                      
                      {option.voteCount > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Users className="h-3 w-3" />
                          <span>{option.voteCount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {option.description && (
                    <p className="text-xs text-gray-600 mt-1">
                      {option.description}
                    </p>
                  )}
                  
                  {/* 投票进度条 */}
                  {showResults && totalVotes > 0 && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-violet-400 h-1.5 rounded-full transition-all duration-300"
                          style={{
                            width: `${(option.totalScore / maxScore) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {!readOnly && currentUserId && !option.userVoted && (
                <div className="ml-2 flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleVoteWithComment(option.id)}
                    title="投票并留言"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            
            {/* 显示投票用户的评论 */}
            {option.votes.length > 0 && (
              <div className="ml-4 space-y-1">
                {option.votes.map((vote, index) => (
                  <div key={index} className="text-xs text-gray-600">
                    <span className="font-medium">{vote.userName}</span>
                    {vote.comment && (
                      <span className="ml-1">: {vote.comment}</span>
                    )}
                    <span className="ml-1 text-gray-400">
                      (权重: {vote.weight})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {/* 评论输入框 */}
        {showCommentInput && selectedOption && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="添加您的评论..."
              className="w-full p-2 text-sm border border-gray-300 rounded resize-none"
              rows={2}
            />
            <div className="flex gap-2 mt-2 justify-end">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowCommentInput(false);
                  setSelectedOption('');
                  setComment('');
                }}
              >
                取消
              </Button>
              <Button
                size="sm"
                onClick={() => handleVote(selectedOption)}
              >
                投票
              </Button>
            </div>
          </div>
        )}
        
        {/* 投票统计 */}
        {showResults && totalVotes > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-600 text-center">
              总投票数: {totalVotes} | 参与人数: {
                new Set(options.flatMap(opt => opt.votes.map(v => v.userId))).size
              }
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};