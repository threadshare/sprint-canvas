import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
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
  initialRoomId?: string | null;
}

export const RoomEntry: React.FC<RoomEntryProps> = ({ onRoomJoined, initialRoomId }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'create' | 'join'>(initialRoomId ? 'join' : 'create');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Create room form
  const [createForm, setCreateForm] = useState({
    roomName: '',
    userName: '',
  });
  
  // Join room form (pre-fill with URL room ID if available)
  const [joinForm, setJoinForm] = useState({
    roomId: initialRoomId || '',
    userName: '',
  });
  
  // Auto-switch to join tab if we have a room ID from URL
  useEffect(() => {
    if (initialRoomId) {
      setActiveTab('join');
      setJoinForm(prev => ({ ...prev, roomId: initialRoomId }));
    }
  }, [initialRoomId]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.roomName.trim() || !createForm.userName.trim()) {
      setError(t('room.fillRequiredFields'));
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
      setError(error instanceof Error ? error.message : t('room.createRoomError'));
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinForm.roomId.trim() || !joinForm.userName.trim()) {
      setError(t('room.fillRequiredFields'));
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
      setError(error instanceof Error ? error.message : t('room.joinRoomError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-foundation flex items-center justify-center p-4">
      {/* Language Switcher - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>
      
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
            {t('room.title')}
          </h1>
          <p className="text-foundation/70 text-lg">
            {t('room.subtitle')}
          </p>
        </div>

        {/* Main Card */}
        <Card className="paper-card shadow-paper border-foundation/10">
          <CardHeader>
            <CardTitle className="text-center text-xl text-foundation">
              {t('room.title')}
            </CardTitle>
            <CardDescription className="text-center">
              {t('room.subtitle')}
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
                  {t('room.createRoom')}
                </TabsTrigger>
                <TabsTrigger value="join" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {t('room.joinRoom')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="space-y-4">
                <form onSubmit={handleCreateRoom} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="roomName">{t('room.roomName')}</Label>
                    <Input
                      id="roomName"
                      placeholder={t('room.roomName')}
                      value={createForm.roomName}
                      onChange={(e) => setCreateForm({ ...createForm, roomName: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="createUserName">{t('room.userName')}</Label>
                    <Input
                      id="createUserName"
                      placeholder={t('room.userName')}
                      value={createForm.userName}
                      onChange={(e) => setCreateForm({ ...createForm, userName: e.target.value })}
                      disabled={loading}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('room.creating')}
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        {t('room.createRoom')}
                      </>
                    )}
                  </Button>
                </form>

                <div className="text-center text-sm text-foundation/60 space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{t('room.estimatedTime')}</span>
                  </div>
                  <p>{t('room.inviteTeam')}</p>
                </div>
              </TabsContent>

              <TabsContent value="join" className="space-y-4">
                <form onSubmit={handleJoinRoom} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="roomId">{t('room.roomCode')}</Label>
                    <Input
                      id="roomId"
                      placeholder={t('room.roomCode')}
                      value={joinForm.roomId}
                      onChange={(e) => setJoinForm({ ...joinForm, roomId: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="joinUserName">{t('room.userName')}</Label>
                    <Input
                      id="joinUserName"
                      placeholder={t('room.userName')}
                      value={joinForm.userName}
                      onChange={(e) => setJoinForm({ ...joinForm, userName: e.target.value })}
                      disabled={loading}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('room.joining')}
                      </>
                    ) : (
                      <>
                        <Users className="mr-2 h-4 w-4" />
                        {t('room.joinRoom')}
                      </>
                    )}
                  </Button>
                </form>

                <div className="text-center text-sm text-foundation/60">
                  <p>{t('room.pasteRoomId')}</p>
                </div>
              </TabsContent>
            </Tabs>

            <Separator className="my-6" />

            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                {t('room.whatIsFS')}
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• {t('room.fsDesc1')}</li>
                <li>• {t('room.fsDesc2')}</li>
                <li>• {t('room.fsDesc3')}</li>
                <li>• {t('room.fsDesc4')}</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-foundation/50 text-sm">
          {t('room.poweredBy')}
        </div>
      </div>
    </div>
  );
};