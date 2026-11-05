import { useEffect } from 'react';
import { AccessibilityInfo, Pressable } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { Box, Text } from '@/core/theme';
import {
  openTiming,
  TOAST_OFFSET,
  toastEntering,
  toastExiting,
} from '@/shared/animations';

export const TOAST_DISMISS_DISTANCE = 24;

type ToastProps = {
  message: string;
  onDismiss: () => void;
  testID?: string;
};

export function Toast({ message, onDismiss, testID = 'toast' }: ToastProps) {
  const dragY = useSharedValue(0);

  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(message.replace('\n', ' '));
  }, [message]);

  const swipeDown = Gesture.Pan()
    .withTestId(`${testID}-pan`)
    .activeOffsetY(8)
    .onUpdate(event => {
      dragY.value = Math.max(0, event.translationY);
    })
    .onEnd(event => {
      if (event.translationY > TOAST_DISMISS_DISTANCE) {
        dragY.value = withTiming(TOAST_OFFSET * 2, openTiming);
        scheduleOnRN(onDismiss);
        return;
      }
      dragY.value = withTiming(0, openTiming);
    });

  const dragStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: dragY.value }],
  }));

  return (
    <GestureDetector gesture={swipeDown}>
      <Animated.View entering={toastEntering} exiting={toastExiting}>
        <Animated.View style={dragStyle}>
          <Pressable
            testID={testID}
            onPress={onDismiss}
            accessibilityRole="button"
            accessibilityLabel={message.replace('\n', ' ')}
            accessibilityHint="Toque para fechar"
            accessibilityLiveRegion="polite"
          >
            <Box
              backgroundColor="surfaceRaised"
              borderRadius="m"
              paddingVertical="sm"
              paddingHorizontal="m"
              shadowColor="background"
              shadowOpacity={0.3}
              shadowRadius={8}
              shadowOffset={{ width: 0, height: 2 }}
              elevation={6}
            >
              <Text variant="bodyMedium" numberOfLines={2}>
                {message}
              </Text>
            </Box>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}
