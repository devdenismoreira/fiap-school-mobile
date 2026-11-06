import { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
  type HostInstance,
} from 'react-native';
import Animated, {
  interpolate,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { Box, motion, sizes, Text } from '@/core/theme';
import { emphasizedAccelerate, quickTiming } from '@/shared/animations';
import { ExpandArrow } from '@/shared/components/ExpandArrow';

export type DropdownOption = {
  value: string;
  label: string;
};

type Anchor = { x: number; y: number; width: number; height: number };

type DropdownProps = {
  options: DropdownOption[];
  selectedValue: string | null;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSelect: (value: string) => void;
  contentPadding?: 'm' | 'sm';
  accessibilityLabel: string;
  testID?: string;
};

const PANEL_OFFSET = 8;
const PANEL_START_SCALE = 0.96;

export function Dropdown({
  options,
  selectedValue,
  isOpen,
  onToggle,
  onClose,
  onSelect,
  contentPadding = 'm',
  accessibilityLabel,
  testID,
}: DropdownProps) {
  const triggerRef = useRef<HostInstance>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [isModalVisible, setModalVisible] = useState(isOpen);
  const progress = useSharedValue(isOpen ? 1 : 0);
  const selected = options.find(option => option.value === selectedValue);

  useEffect(() => {
    if (isOpen) {
      setModalVisible(true);
      progress.value = withTiming(1, quickTiming);
      return;
    }
    progress.value = withTiming(
      0,
      {
        duration: motion.normal,
        easing: emphasizedAccelerate,
        reduceMotion: ReduceMotion.System,
      },
      finished => {
        if (finished) {
          scheduleOnRN(setModalVisible, false);
        }
      },
    );
  }, [isOpen, progress]);

  const panelStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [-PANEL_OFFSET, 0]) },
      { scaleY: interpolate(progress.value, [0, 1], [PANEL_START_SCALE, 1]) },
    ],
  }));

  const handleTriggerPress = () => {
    if (isOpen) {
      onClose();
      return;
    }
    triggerRef.current?.measureInWindow((x, y, width, height) =>
      setAnchor({ x, y, width, height }),
    );
    onToggle();
  };

  return (
    <>
      <Pressable
        ref={triggerRef}
        testID={testID}
        onPress={handleTriggerPress}
        accessibilityRole="button"
        accessibilityLabel={`${accessibilityLabel}: ${selected?.label ?? ''}`}
        accessibilityState={{ expanded: isOpen }}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <Box
          testID={testID ? `${testID}-trigger` : undefined}
          height={sizes.dropdownHeight}
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          backgroundColor="surface"
          borderRadius="m"
          paddingHorizontal={contentPadding}
        >
          <Text variant="body">{selected?.label ?? ''}</Text>
          <ExpandArrow expanded={isOpen} />
        </Box>
      </Pressable>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="none"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={onClose}
      >
        <Pressable
          testID={testID ? `${testID}-backdrop` : undefined}
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Fechar lista"
        />
        <View
          pointerEvents={isOpen ? 'auto' : 'none'}
          style={[
            styles.panel,
            anchor
              ? {
                  top: anchor.y + anchor.height + sizes.dropdown.panelGap,
                  left: anchor.x,
                  width: anchor.width,
                }
              : styles.unmeasured,
          ]}
        >
          <Animated.View style={[styles.panelOrigin, panelStyle]}>
            <Box
              backgroundColor="surface"
              borderRadius="m"
              paddingVertical="xs"
              accessibilityRole="menu"
            >
              {options.map(option => (
                <Pressable
                  key={option.value}
                  onPress={() => onSelect(option.value)}
                  accessibilityRole="menuitem"
                  accessibilityState={{
                    selected: option.value === selectedValue,
                  }}
                  style={({ pressed }) => pressed && styles.pressed}
                >
                  <Box paddingVertical="xs" paddingHorizontal={contentPadding}>
                    <Text variant="body">{option.label}</Text>
                  </Box>
                </Pressable>
              ))}
            </Box>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
  },
  panelOrigin: {
    transformOrigin: 'top',
  },
  unmeasured: {
    opacity: 0,
  },
  pressed: {
    opacity: motion.pressedOpacity,
  },
});
