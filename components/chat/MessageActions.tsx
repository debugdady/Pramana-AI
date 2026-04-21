import React from 'react';
import { View } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { CopyIcon, RotateCwIcon, ShareIcon, MoreVerticalIcon } from 'lucide-react-native';

interface MessageActionsProps {
  isAssistant: boolean;
  onCopy: () => void;
  onRegenerate?: () => void;
  onShare: () => void;
  onMore: () => void;
  isVisible?: boolean;
}

/**
 * Action bar component for message interactions
 * Shows Copy, Regenerate (assistant only), Share, and More buttons
 */
export const MessageActions: React.FC<MessageActionsProps> = ({
  isAssistant,
  onCopy,
  onRegenerate,
  onShare,
  onMore,
  isVisible = true,
}) => {
  if (!isVisible) return null;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 6,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        marginTop: 8,
      }}
    >
      {/* Copy Button */}
      <Button
        onPress={onCopy}
        style={{
          width: 32,
          height: 32,
          borderRadius: 6,
          backgroundColor: '#fff',
          borderWidth: 1,
          borderColor: '#e5e5e5',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon as={CopyIcon} className="size-4 text-gray-600" />
      </Button>

      {/* Regenerate Button (Assistant only) */}
      {isAssistant && onRegenerate && (
        <Button
          onPress={onRegenerate}
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            backgroundColor: '#fff',
            borderWidth: 1,
            borderColor: '#e5e5e5',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon as={RotateCwIcon} className="size-4 text-gray-600" />
        </Button>
      )}

      {/* Share Button */}
      <Button
        onPress={onShare}
        style={{
          width: 32,
          height: 32,
          borderRadius: 6,
          backgroundColor: '#fff',
          borderWidth: 1,
          borderColor: '#e5e5e5',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon as={ShareIcon} className="size-4 text-gray-600" />
      </Button>

      {/* More Button */}
      <Button
        onPress={onMore}
        style={{
          width: 32,
          height: 32,
          borderRadius: 6,
          backgroundColor: '#fff',
          borderWidth: 1,
          borderColor: '#e5e5e5',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon as={MoreVerticalIcon} className="size-4 text-gray-600" />
      </Button>
    </View>
  );
};
