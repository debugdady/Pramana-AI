import React, { useState } from 'react';
import { Pressable, View, Animated } from 'react-native';

interface MessagePressableProps {
  children: React.ReactNode;
  onLongPress: () => void;
  onPress?: () => void;
  style?: any;
}

/**
 * Wrapper component for messages that handles long-press interactions
 * Shows action buttons on long-press or hover-like state
 */
export const MessagePressable: React.FC<MessagePressableProps> = ({
  children,
  onLongPress,
  onPress,
  style,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [opacity] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.timing(opacity, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[{ opacity }, style]}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        delayLongPress={500}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
};
