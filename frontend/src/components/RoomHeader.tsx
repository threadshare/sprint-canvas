import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ExportButton } from '@/components/export/ExportButton';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import {
  Lightbulb,
  Users,
  Share2,
  Copy,
  Settings,
  Wifi,
  WifiOff,
  Clock,
  CheckCircle,
} from 'lucide-react';
import type { Room } from '@/lib/api/types';

interface RoomHeaderProps {
  room: Room;
  currentUserId: string;
  currentUserName: string;
  isConnected: boolean;
  participants?: Array<{ id: string; name: string; online: boolean }>;
  onLeaveRoom: () => void;
}

export const RoomHeader: React.FC<RoomHeaderProps> = ({
  room,
  currentUserId,
  currentUserName,
  isConnected,
  participants = [],
  onLeaveRoom,
}) => {
  const { t } = useLanguage();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const getStageDisplayName = (stage: string) => {
    switch (stage) {
      case 'foundation': return t('stages.foundation');
      case 'differentiation': return t('stages.differentiation');
      case 'approach': return t('stages.approach');
      case 'completed': return t('stages.completed');
      default: return stage;
    }
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'foundation': return Users;
      case 'differentiation': return Lightbulb;
      case 'approach': return CheckCircle;
      case 'completed': return CheckCircle;
      default: return Clock;
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'foundation': return 'bg-blue-100 text-blue-800';
      case 'differentiation': return 'bg-purple-100 text-purple-800';
      case 'approach': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(room.id);
      toast({
        title: t('room.copySuccess'),
        description: t('room.copyDesc'),
      });
    } catch (error) {
      toast({
        title: t('room.copyFailed'),
        description: t('room.copyManual'),
        variant: 'destructive',
      });
    }
  };

  const copyInviteLink = async () => {
    const inviteLink = `${window.location.origin}?roomId=${room.id}`;
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast({
        title: t('room.copySuccess'),
        description: t('room.copyDesc'),
      });
    } catch (error) {
      toast({
        title: t('room.copyFailed'),
        description: t('room.copyManual'),
        variant: 'destructive',
      });
    }
  };

  const StageIcon = getStageIcon(room.status);

  return (
    <header className="paper-card border-b-0 rounded-none shadow-paper bg-white/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Room Info */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <Lightbulb className="h-7 w-7 text-white" />
              </div>
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
              }`}></div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foundation">
                  {room.name}
                </h1>
                <Badge className={getStageColor(room.status)}>
                  <StageIcon className="w-3 h-3 mr-1" />
                  {getStageDisplayName(room.status)}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-foundation/70">
                <span>{t('room.roomIdPrefix')}: {room.id.slice(0, 8)}...</span>
                <div className="flex items-center gap-1">
                  {isConnected ? (
                    <Wifi className="h-4 w-4 text-green-600" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-red-600" />
                  )}
                  <span>{isConnected ? t('room.connected') : t('room.disconnected')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Actions and Participants */}
          <div className="flex items-center gap-3">
            {/* Participants */}
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {participants.slice(0, 3).map((participant) => (
                  <Avatar key={participant.id} className="w-8 h-8 border-2 border-white">
                    <AvatarFallback className="text-xs">
                      {participant.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {participants.length > 3 && (
                  <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-600">
                    +{participants.length - 3}
                  </div>
                )}
              </div>
              <span className="text-sm text-foundation/70">
                {participants.length} {t('room.peopleOnline')}
              </span>
            </div>

            {/* Export Button */}
            <ExportButton
              room={room}
              participants={participants}
              variant="outline"
              size="sm"
            />

            {/* Share Button */}
            <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-1" />
                  {t('room.share')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{t('room.inviteMembers')}</DialogTitle>
                  <DialogDescription>
                    {t('room.shareRoomDesc')}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t('room.roomCode')}</Label>
                    <div className="flex gap-2">
                      <Input value={room.id} readOnly />
                      <Button variant="outline" size="sm" onClick={copyRoomId}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('room.inviteLink')}</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={`${window.location.origin}?roomId=${room.id}`}
                        readOnly 
                      />
                      <Button variant="outline" size="sm" onClick={copyInviteLink}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Settings */}
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>

            {/* Leave Room */}
            <Button variant="outline" size="sm" onClick={onLeaveRoom}>
              {t('room.leaveRoom')}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};