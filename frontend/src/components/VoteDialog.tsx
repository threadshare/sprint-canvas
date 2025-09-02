import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { VoteCard } from '@/components/cards/VoteCard';
import { apiClient } from '@/lib/api/client';
import { webSocketService } from '@/lib/websocket';
import { useToast } from '@/components/ui/use-toast';
import { Vote, Plus, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  currentUserId: string;
  currentUserName: string;
  voteSubject: 'customers' | 'problems' | 'competition' | 'advantages';
  options: string[];
  participants: Array<{ id: string; name: string; online: boolean }>;
}

export const VoteDialog: React.FC<VoteDialogProps> = ({
  isOpen,
  onClose,
  roomId,
  currentUserId,
  currentUserName,
  voteSubject,
  options,
  participants,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [votes, setVotes] = useState<any[]>([]);
  const [votingMode, setVotingMode] = useState<'create' | 'view'>('view');
  
  // New vote form
  const [voteForm, setVoteForm] = useState({
    title: '',
    description: '',
    options: ['', ''],
  });

  useEffect(() => {
    if (isOpen) {
      fetchVotes();
    }
  }, [isOpen, roomId]);

  const fetchVotes = async () => {
    try {
      const response = await fetch(`/api/v1/collaboration/rooms/${roomId}/votes`);
      if (response.ok) {
        const data = await response.json();
        setVotes(data || []);
      }
    } catch (error) {
      console.error('Failed to fetch votes:', error);
    }
  };

  const createVote = async () => {
    if (!voteForm.title.trim()) {
      toast({
        title: '请输入投票标题',
        variant: 'destructive',
      });
      return;
    }

    const validOptions = voteForm.options.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      toast({
        title: '至少需要两个选项',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/v1/collaboration/rooms/${roomId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: voteForm.title,
          description: voteForm.description,
          type: voteSubject,
          options: validOptions,
          created_by: currentUserName,
        }),
      });

      if (response.ok) {
        const newVote = await response.json();
        setVotes([...votes, newVote]);
        setVotingMode('view');
        setVoteForm({ title: '', description: '', options: ['', ''] });
        
        // Broadcast vote creation
        webSocketService.send('vote_created', {
          voteId: newVote.id,
          roomId,
          userId: currentUserId,
        });

        toast({
          title: '投票创建成功',
        });
      }
    } catch (error) {
      toast({
        title: '创建投票失败',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (voteId: string, optionId: string, comment?: string) => {
    try {
      const response = await fetch(`/api/v1/collaboration/votes/${voteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          option_id: optionId,
          user_id: currentUserId,
          user_name: currentUserName,
          weight: 1,
          comment: comment || '',
        }),
      });

      if (response.ok) {
        const updatedVote = await response.json();
        setVotes(votes.map(v => v.id === voteId ? updatedVote : v));
        
        // Broadcast vote update
        webSocketService.send('vote_updated', {
          voteId,
          roomId,
          userId: currentUserId,
        });

        toast({
          title: '投票成功',
        });
      }
    } catch (error) {
      toast({
        title: '投票失败',
        variant: 'destructive',
      });
    }
  };

  const addOption = () => {
    setVoteForm({
      ...voteForm,
      options: [...voteForm.options, ''],
    });
  };

  const removeOption = (index: number) => {
    if (voteForm.options.length > 2) {
      setVoteForm({
        ...voteForm,
        options: voteForm.options.filter((_, i) => i !== index),
      });
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...voteForm.options];
    newOptions[index] = value;
    setVoteForm({ ...voteForm, options: newOptions });
  };

  const getSubjectTitle = () => {
    const titles = {
      customers: '目标客户',
      problems: '核心问题',
      competition: '竞争对手',
      advantages: '团队优势',
    };
    return titles[voteSubject];
  };

  // Check if there are enough participants for voting
  const canVote = participants.filter(p => p.online).length > 1;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Vote className="h-5 w-5" />
            {getSubjectTitle()} - 投票决策
          </DialogTitle>
          <DialogDescription>
            {canVote 
              ? `当前有 ${participants.filter(p => p.online).length} 人在线，可以进行投票决策`
              : '需要至少 2 人在线才能进行投票'}
          </DialogDescription>
        </DialogHeader>

        {!canVote ? (
          <div className="py-8 text-center text-gray-500">
            <Vote className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>等待更多成员加入...</p>
            <p className="text-sm mt-2">投票功能需要至少 2 人在线</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Vote Mode Toggle */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                已有 {votes.length} 个投票
              </div>
              <Button
                variant={votingMode === 'create' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setVotingMode(votingMode === 'create' ? 'view' : 'create')}
              >
                {votingMode === 'create' ? (
                  <>
                    <X className="h-4 w-4 mr-1" />
                    取消创建
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" />
                    创建投票
                  </>
                )}
              </Button>
            </div>

            {/* Create Vote Form */}
            {votingMode === 'create' && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="title">投票标题</Label>
                  <Input
                    id="title"
                    placeholder="例如：选择最重要的客户群体"
                    value={voteForm.title}
                    onChange={(e) => setVoteForm({ ...voteForm, title: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="description">描述（可选）</Label>
                  <Textarea
                    id="description"
                    placeholder="说明投票的目的和背景"
                    value={voteForm.description}
                    onChange={(e) => setVoteForm({ ...voteForm, description: e.target.value })}
                    rows={2}
                  />
                </div>

                <div>
                  <Label>投票选项</Label>
                  <div className="space-y-2 mt-2">
                    {voteForm.options.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder={`选项 ${index + 1}`}
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                        />
                        {voteForm.options.length > 2 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOption(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={addOption}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    添加选项
                  </Button>
                </div>

                <Button
                  onClick={createVote}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      创建中...
                    </>
                  ) : (
                    '创建投票'
                  )}
                </Button>
              </div>
            )}

            {/* Vote List */}
            {votingMode === 'view' && (
              <div className="space-y-4">
                {votes.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <p>还没有投票</p>
                    <p className="text-sm mt-1">点击上方按钮创建第一个投票</p>
                  </div>
                ) : (
                  votes.map((vote) => (
                    <VoteCard
                      key={vote.id}
                      id={vote.id}
                      title={vote.title}
                      description={vote.description}
                      options={vote.options.map((opt: any) => ({
                        id: opt.id,
                        text: opt.text,
                        description: opt.description,
                        votes: opt.votes || [],
                      }))}
                      currentUserId={currentUserId}
                      currentUserName={currentUserName}
                      onVote={(optionId, comment) => handleVote(vote.id, optionId, comment)}
                      showResults={true}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};