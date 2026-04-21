import React from 'react';
import {
  View,
  Modal,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import {
  CopyIcon,
  RotateCwIcon,
  EditIcon,
  TrashIcon,
  FlagIcon,
  XIcon,
} from 'lucide-react-native';

interface MenuOption {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  onPress: () => void;
  dangerous?: boolean;
}

interface MessageContextMenuProps {
  visible: boolean;
  onClose: () => void;
  options: MenuOption[];
}

/**
 * Context menu modal for message actions
 * Displays a clean, native-feeling action sheet with custom options
 */
export const MessageContextMenu: React.FC<MessageContextMenuProps> = ({
  visible,
  onClose,
  options,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: '#fff',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            paddingTop: 12,
            paddingBottom: 20,
            maxHeight: '80%',
          }}
        >
          {/* Handle Bar */}
          <View
            style={{
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <View
              style={{
                width: 40,
                height: 4,
                backgroundColor: '#e5e5e5',
                borderRadius: 2,
              }}
            />
          </View>

          {/* Close Button */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              paddingHorizontal: 16,
              marginBottom: 12,
            }}
          >
            <Pressable onPress={onClose}>
              <Icon as={XIcon} className="size-6 text-gray-400" />
            </Pressable>
          </View>

          {/* Menu Items */}
          <ScrollView>
            {options.map((option) => (
              <Pressable
                key={option.id}
                onPress={() => {
                  option.onPress();
                  onClose();
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: '#f0f0f0',
                }}
              >
                <Icon
                  as={option.icon}
                  className={`size-5 mr-3 ${
                    option.dangerous ? 'text-red-500' : 'text-gray-600'
                  }`}
                />
                <Text
                  style={{
                    fontSize: 16,
                    color: option.dangerous ? '#ef4444' : '#111',
                    fontWeight: '500',
                  }}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
