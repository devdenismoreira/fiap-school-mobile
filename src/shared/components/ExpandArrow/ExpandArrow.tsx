import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { openTiming } from '@/shared/animations';
import { Icon } from '@/shared/components/Icon';

type ExpandArrowProps = {
  expanded: boolean;
  testID?: string;
};

export function ExpandArrow({ expanded, testID }: ExpandArrowProps) {
  const rotation = useSharedValue(expanded ? 180 : 0);

  useEffect(() => {
    rotation.value = withTiming(expanded ? 180 : 0, openTiming);
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
