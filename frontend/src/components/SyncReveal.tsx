import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Users, Clock, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  isReady: boolean;
}

interface SyncRevealProps {
  isActive: boolean;
  users: User[];
  currentUserId?: string;
  onToggleReady?: () => void;
  onRevealAll?: () => void;
  onCancel?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export const SyncReveal: React.FC<SyncRevealProps> = ({
  isActive,
  users,
  currentUserId,
  onToggleReady,
  onRevealAll,
  onCancel,
  children,
  className,
}) => {
  const [countdown, setCountdown] = useState(0);
  const [isRevealing, setIsRevealing] = useState(false);

  const readyUsers = users.filter(user => user.isReady);
  const totalUsers = users.length;
  const allReady = readyUsers.length === totalUsers && totalUsers > 0;
  const currentUser = users.find(user => user.id === currentUserId);
  const isCurrentUserReady = currentUser?.isReady || false;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(time => {
          if (time <= 1) {
            setIsRevealing(true);
            onRevealAll?.();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [countdown, onRevealAll]);

  const handleRevealWhenReady = () => {
    if (allReady) {
      setCountdown(3); // 3秒倒计时
    }
  };

  const handleForceReveal = () => {
    setIsRevealing(true);
    onRevealAll?.();
  };

  if (!isActive) {
    return <>{children}</>;
  }

  return (
    <Card className={cn('border-purple-200 bg-purple-50', className)}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold text-purple-800">同步展示</h3>
            <div className="text-xs text-purple-600 ml-auto">
              Note and Vote 模式
            </div>
          </div>

          {/* Status and Users */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-purple-700">
                等待所有成员完成独立思考
              </div>
              <div className={cn(
                'text-sm font-medium px-2 py-1 rounded',
                allReady ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
              )}>
                {readyUsers.length}/{totalUsers} 已完成
              </div>
            </div>

            {/* User Status Grid */}
            <div className="grid grid-cols-2 gap-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={cn(
                    'flex items-center gap-2 p-2 rounded text-sm',
                    user.isReady 
                      ? 'bg-green-100 text-green-800' 
                      : user.id === currentUserId
                      ? 'bg-purple-100 text-purple-800 border border-purple-300'
                      : 'bg-gray-100 text-gray-600'
                  )}
                >
                  {user.isReady ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <Clock className="h-3 w-3" />
                  )}
                  <span className="truncate">{user.name}</span>
                  {user.id === currentUserId && (
                    <span className="text-xs ml-auto">(你)</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            {!isCurrentUserReady && (
              <Button
                onClick={onToggleReady}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Check className="h-4 w-4 mr-1" />
                我已完成思考
              </Button>
            )}

            {isCurrentUserReady && !allReady && (
              <div className="text-center p-3 bg-purple-100 rounded text-sm text-purple-700">
                <Clock className="h-4 w-4 mx-auto mb-1" />
                等待其他成员完成...
              </div>
            )}

            {allReady && countdown === 0 && (
              <Button
                onClick={handleRevealWhenReady}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Eye className="h-4 w-4 mr-1" />
                同步展示所有答案
              </Button>
            )}

            {/* Countdown */}
            <AnimatePresence>
              {countdown > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center p-4 bg-green-100 rounded"
                >
                  <div className="text-2xl font-bold text-green-800 mb-1">
                    {countdown}
                  </div>
                  <div className="text-sm text-green-600">
                    所有答案即将同时展示...
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Emergency Actions */}
            <div className="flex gap-2 pt-2 border-t border-purple-200">
              <Button
                onClick={handleForceReveal}
                variant="outline"
                size="sm"
                className="flex-1 border-orange-300 text-orange-600 hover:bg-orange-50"
              >
                <EyeOff className="h-3 w-3 mr-1" />
                强制展示
              </Button>
              <Button
                onClick={onCancel}
                variant="outline"
                size="sm"
                className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                取消同步
              </Button>
            </div>
          </div>

          {/* Hidden Content */}
          <AnimatePresence>
            {!isRevealing && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-4 p-4 bg-white/50 backdrop-blur-sm rounded border-2 border-dashed border-purple-300"
              >
                <div className="text-center text-purple-600">
                  <EyeOff className="h-8 w-8 mx-auto mb-2" />
                  <div className="font-medium mb-1">内容已隐藏</div>
                  <div className="text-xs text-purple-500">
                    等待所有成员完成后同时展示
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Revealed Content */}
          <AnimatePresence>
            {isRevealing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};