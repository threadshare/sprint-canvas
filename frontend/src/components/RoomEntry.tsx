import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { apiClient } from '@/lib/api/client';
import type { Room } from '@/lib/api/types';
import { 
  Plus, 
  Users, 
  Clock,
  Lightbulb,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface RoomEntryProps {
  onRoomJoined: (room: Room, userId: string, userName: string) => void;
}

export const RoomEntry: React.FC<RoomEntryProps> = ({ onRoomJoined }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Create room form
  const [createForm, setCreateForm] = useState({
    roomName: '',
    userName: '',
  });
  
  // Join room form
  const [joinForm, setJoinForm] = useState({
    roomId: '',
    userName: '',
  });

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.roomName.trim() || !createForm.userName.trim()) {
      setError('请填写房间名称和您的姓名');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const room = await apiClient.createRoom({
        name: createForm.roomName.trim(),
        created_by: createForm.userName.trim(),
      });
      
      // Generate a user ID based on the username and timestamp
      const userId = `${createForm.userName.trim().replace(/\s+/g, '_')}_${Date.now()}`;
      
      onRoomJoined(room, userId, createForm.userName.trim());
    } catch (error) {
      setError(error instanceof Error ? error.message : '创建房间失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinForm.roomId.trim() || !joinForm.userName.trim()) {
      setError('请填写房间ID和您的姓名');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const room = await apiClient.getRoom(joinForm.roomId.trim());
      
      // Generate a user ID based on the username and timestamp
      const userId = `${joinForm.userName.trim().replace(/\s+/g, '_')}_${Date.now()}`;
      
      onRoomJoined(room, userId, joinForm.userName.trim());
    } catch (error) {
      setError(error instanceof Error ? error.message : '加入房间失败，请检查房间ID是否正确');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-foundation flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative inline-flex mb-4">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <Lightbulb className="h-10 w-10 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Foundation Sprint
          </h1>
          <p className="text-foundation/70 text-lg">
            科学思考，快速验证想法
          </p>
        </div>

        {/* Main Card */}
        <Card className="paper-card shadow-paper border-foundation/10">
          <CardHeader>
            <CardTitle className="text-center text-xl text-foundation">
              开始你的 Foundation Sprint
            </CardTitle>
            <CardDescription className="text-center">
              创建新的协作房间或加入现有的团队讨论
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'create' | 'join')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="create" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  创建房间
                </TabsTrigger>
                <TabsTrigger value="join" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  加入房间
                </TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="space-y-4">
                <form onSubmit={handleCreateRoom} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="roomName">房间名称</Label>
                    <Input
                      id="roomName"
                      placeholder="例如：产品创新讨论"
                      value={createForm.roomName}
                      onChange={(e) => setCreateForm({ ...createForm, roomName: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="createUserName">您的姓名</Label>
                    <Input
                      id="createUserName"
                      placeholder="请输入您的姓名"
                      value={createForm.userName}
                      onChange={(e) => setCreateForm({ ...createForm, userName: e.target.value })}
                      disabled={loading}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        创建中...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        创建房间
                      </>
                    )}
                  </Button>
                </form>

                <div className="text-center text-sm text-foundation/60 space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>预计用时：2-3小时</span>
                  </div>
                  <p>创建房间后，您可以邀请团队成员一起参与</p>
                </div>
              </TabsContent>

              <TabsContent value="join" className="space-y-4">
                <form onSubmit={handleJoinRoom} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="roomId">房间ID</Label>
                    <Input
                      id="roomId"
                      placeholder="粘贴房间ID"
                      value={joinForm.roomId}
                      onChange={(e) => setJoinForm({ ...joinForm, roomId: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="joinUserName">您的姓名</Label>
                    <Input
                      id="joinUserName"
                      placeholder="请输入您的姓名"
                      value={joinForm.userName}
                      onChange={(e) => setJoinForm({ ...joinForm, userName: e.target.value })}
                      disabled={loading}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        加入中...
                      </>
                    ) : (
                      <>
                        <Users className="mr-2 h-4 w-4" />
                        加入房间
                      </>
                    )}
                  </Button>
                </form>

                <div className="text-center text-sm text-foundation/60">
                  <p>输入房间创建者分享的ID即可加入讨论</p>
                </div>
              </TabsContent>
            </Tabs>

            <Separator className="my-6" />

            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                什么是 Foundation Sprint？
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 基于 Google Ventures 方法论的快速决策工具</li>
                <li>• 通过3个阶段帮助团队达成核心战略共识</li>
                <li>• 配备AI助手提供深度分析和建议</li>
                <li>• 支持多人实时协作和投票决策</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-foundation/50 text-sm">
          Powered by Foundation Sprint AI
        </div>
      </div>
    </div>
  );
};