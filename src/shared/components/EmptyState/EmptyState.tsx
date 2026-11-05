import { ActivityIndicator, Image, Pressable, StyleSheet } from 'react-native';

import noClassroom from '@/assets/images/no-classroom.png';
import { Box, motion, sizes, Text, theme } from '@/core/theme';

const { width, height, imageHeight } = sizes.noClassroom;

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionLoading?: boolean;
  testID?: string;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  actionLoading = false,
  testID,
}: EmptyStateProps) {
  return (
    <Box testID={testID} alignItems="center" marginTop="ml">
      <Box
        width={width}
        height={height}
        overflow="hidden"
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
      >
        <Image source={noClassroom} style={styles.image} />
      </Box>
      <Text variant="emptyState" textAlign="center" marginTop="ml">
        {title}
      </Text>
      {description ? (
        <Text variant="body" textAlign="center" marginTop="xs">
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Pressable
          testID={testID ? `${testID}-action` : undefined}
          onPress={onAction}
          disabled={actionLoading}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          accessibilityState={{ disabled: actionLoading, busy: actionLoading }}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
        >
          {actionLoading ? (
            <ActivityIndicator color={theme.colors.onPrimary} />
          ) : (
            <Text variant="bodyBold" color="onPrimary">
              {actionLabel}
            </Text>
          )}
        </Pressable>
      ) : null}
    </Box>
  );
}

const styles = StyleSheet.create({
  image: {
    width,
    height: imageHeight,
  },
  action: {
    marginTop: theme.spacing.l,
    minWidth: 220,
    height: sizes.dropdownHeight,
    paddingHorizontal: theme.spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadii.m,
    backgroundColor: theme.colors.primary,
  },
  pressed: {
    opacity: motion.pressedOpacity,
  },
});
