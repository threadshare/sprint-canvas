import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Trash2, Edit3, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface EditableCardProps {
  id?: string;
  initialText?: string;
  placeholder?: string;
  onSave?: (text: string) => void;
  onDelete?: () => void;
  readOnly?: boolean;
  variant?: 'default' | 'customer' | 'problem' | 'competition' | 'advantage';
  className?: string;
}

const variantStyles = {
  default: 'paper-card',
  customer: 'card-customer',
  problem: 'card-problem',
  competition: 'card-competition',
  advantage: 'card-advantage',
};

const variantTextColors = {
  default: 'text-foundation',
  customer: 'text-blue-900',
  problem: 'text-amber-900',
  competition: 'text-rose-900',
  advantage: 'text-emerald-900',
};

export const EditableCard: React.FC<EditableCardProps> = ({
  id,
  initialText = '',
  placeholder,
  onSave,
  onDelete,
  readOnly = false,
  variant = 'default',
  className,
}) => {
  const { t } = useLanguage();
  const defaultPlaceholder = placeholder || t('common.clickToEdit');
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(initialText);
  const [tempText, setTempText] = useState(initialText);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
  }, [isEditing]);

  const handleEdit = () => {
    if (readOnly) return;
    setTempText(text);
    setIsEditing(true);
  };

  const handleSave = () => {
    setText(tempText);
    setIsEditing(false);
    onSave?.(tempText);
  };

  const handleCancel = () => {
    setTempText(text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          'relative group cursor-pointer',
          variantStyles[variant],
          className
        )}
        onClick={!isEditing ? handleEdit : undefined}
    >
      <CardContent className="p-4 min-h-[120px] flex flex-col">
        {isEditing ? (
          <div className="flex flex-col h-full">
            <textarea
              ref={textareaRef}
              value={tempText}
              onChange={(e) => setTempText(e.target.value)}
              onKeyDown={handleKeyDown}
              className={cn(
                'flex-1 bg-transparent border-none outline-none resize-none text-sm',
                variantTextColors[variant],
                'placeholder:text-gray-400'
              )}
              placeholder={placeholder}
              rows={3}
            />
            <div className="flex gap-2 mt-2 justify-end">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancel();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="default"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave();
                }}
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className={cn(
              'flex-1 text-sm leading-relaxed',
              variantTextColors[variant],
              !text && 'text-gray-400 italic'
            )}>
              {text || defaultPlaceholder}
            </div>
            
            {!readOnly && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2 mt-2 justify-end">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit();
                  }}
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
                {onDelete && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
    </motion.div>
  );
};