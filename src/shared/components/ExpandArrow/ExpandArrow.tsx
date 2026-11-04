import { useEffect } from 'react';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { motion } from '@/core/theme';
import { Icon } from '@/shared/components/Icon';

type ExpandArrowProps = {
  expanded: boolean;
  testID?: string;
};

/**
 * Seta dos dropdowns e acordeões. No Figma a seta "aberta" é a mesma imagem
 * espelhada; aqui ela gira 180° (resultado visual idêntico, chevron simétrico).
 */
export function ExpandArrow({ expanded, testID }: ExpandArrowProps) {
  const rotation = useSharedValue(expanded ? 180 : 0);

  useEffect(() => {
    rotation.value = withTiming(expanded ? 180 : 0, {
      duration: motion.fast,
      easing: Easing.out(Easing.cubic),
      reduceMotion: ReduceMotion.System,
    });
  }, [expanded, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View testID={testID} style={animatedStyle}>
      <Icon name="arrowDown" />
    </Animated.View>
  );
}
