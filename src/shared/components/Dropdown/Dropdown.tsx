import { useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, type HostInstance } from 'react-native';

import Animated from 'react-native-reanimated';

import { Box, motion, sizes, Text } from '@/core/theme';
import { dropdownPanelEntering } from '@/shared/animations';
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
  /** Recuo do texto no Figma: `m` (Agenda) ou `sm` (Boletim). */
  contentPadding?: 'm' | 'sm';
  /** Prefixo lido por leitores de tela, ex.: "Dia selecionado". */
  accessibilityLabel: string;
  testID?: string;
};

/**
 * Dropdown do Figma: gatilho de 45 pt em `surface` e painel sobreposto 7 pt
 * abaixo. O painel abre num Modal transparente: fica acima de todo o
 * conteúdo, fecha ao tocar fora e com o voltar do Android.
 */
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
  const selected = options.find(option => option.value === selectedValue);

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
        visible={isOpen}
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
        <Animated.View
          entering={anchor ? dropdownPanelEntering : undefined}
          // Até a medição do gatilho chegar, o painel fica invisível.
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
                {/* 8 + texto (20) + 8 = 36 pt entre opções, como no Figma. */}
                <Box paddingVertical="xs" paddingHorizontal={contentPadding}>
                  <Text variant="body">{option.label}</Text>
                </Box>
              </Pressable>
            ))}
          </Box>
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
  },
  unmeasured: {
    opacity: 0,
  },
  pressed: {
    opacity: motion.pressedOpacity,
  },
});
