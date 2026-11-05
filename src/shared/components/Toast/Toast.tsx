import { useEffect } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { Box, motion, Text, theme } from '@/core/theme';
import {
  quickTiming,
  TOAST_OFFSET,
  toastEntering,
  toastExiting,
} from '@/shared/animations';
import { CloseIcon, ToastIcon, type ToastVariant } from './ToastIcon';

export const TOAST_DISMISS_DISTANCE = 24;

const VARIANT_COLORS = {
  success: theme.colors.feedbackSuccess,
  error: theme.colors.feedbackError,
  info: theme.colors.feedbackInfo,
  warning: theme.colors.feedbackWarning,
} as const;

type ToastProps = {
  message: string;
  title?: string;
  variant?: ToastVariant;
  duration?: number;
  run?: number;
  onDismiss: () => void;
  testID?: string;
};

export function Toast({
  message,
  title,
  variant = 'info',
  duration = motion.toastDuration,
  run = 0,
  onDismiss,
  testID = 'toast',
}: ToastProps) {
  const dragY = useSharedValue(0);
  const remaining = useSharedValue(1);
  const color = VARIANT_COLORS[variant];
  const spoken = [title, message].filter(Boolean).join('. ').replace('\n', ' ');

  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(spoken);
  }, [spoken]);

  useEffect(() => {
    remaining.value = 1;
    remaining.value = withTiming(0, {
      duration,
      easing: Easing.linear,
      reduceMotion: ReduceMotion.System,
    });
  }, [duration, run, remaining]);

  const progressStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: remaining.value }],
  }));

  const swipeDown = Gesture.Pan()
    .withTestId(`${testID}-pan`)
    .activeOffsetY(8)
    .onUpdate(event => {
      dragY.value = Math.max(0, event.translationY);
    })
    .onEnd(event => {
      if (event.translationY > TOAST_DISMISS_DISTANCE) {
        dragY.value = withTiming(TOAST_OFFSET * 2, quickTiming);
        scheduleOnRN(onDismiss);
        return;
      }
      dragY.value = withTiming(0, quickTiming);
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
            accessibilityLabel={spoken}
            accessibilityHint="Toque para fechar"
            accessibilityLiveRegion="polite"
          >
            <Box
              backgroundColor="surface"
              borderRadius="m"
              paddingTop="sm"
              paddingHorizontal="m"
              paddingBottom="xs"
              shadowColor="background"
              shadowOpacity={0.4}
              shadowRadius={10}
              shadowOffset={{ width: 0, height: 3 }}
              elevation={8}
            >
              <Box flexDirection="row" alignItems="center">
                <ToastIcon variant={variant} color={color} />
                <Box flex={1} marginHorizontal="sm">
                  {title ? (
                    <Text variant="bodySemiBold" numberOfLines={1}>
                      {title}
                    </Text>
                  ) : null}
                  <Text
                    variant={title ? 'caption' : 'bodyMedium'}
                    color={title ? 'inputLineFilled' : 'textPrimary'}
                    numberOfLines={2}
                  >
                    {message}
                  </Text>
                </Box>
                <CloseIcon color={theme.colors.textDisabled} />
              </Box>
              <Box marginTop="sm" height={2}>
                <Animated.View
                  testID={`${testID}-accent`}
                  style={[
                    styles.accent,
                    { backgroundColor: color },
                    progressStyle,
                  ]}
                />
              </Box>
            </Box>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  accent: {
    height: 2,
    borderRadius: theme.borderRadii.round,
    transformOrigin: 'left',
  },
});
