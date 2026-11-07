import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { openTiming } from '@/shared/animations';

type CollapsibleProps = PropsWithChildren<{
  expanded: boolean;
  onContentHeight?: (height: number) => void;
  testID?: string;
}>;

export function Collapsible({
  expanded,
  onContentHeight,
  testID,
  children,
}: CollapsibleProps) {
  const [isRendered, setRendered] = useState(expanded);
  const progress = useSharedValue(expanded ? 1 : 0);
  const contentHeight = useSharedValue(0);
  const isMeasured = useRef(expanded);
  const isOpenPending = useRef(false);

  const handleClosed = useCallback(() => {
    isMeasured.current = false;
    setRendered(false);
  }, []);

  useEffect(() => {
    if (expanded) {
      setRendered(true);
      if (isMeasured.current) {
        progress.value = withTiming(1, openTiming);
      } else {
        isOpenPending.current = true;
      }
      return;
    }
    isOpenPending.current = false;
    progress.value = withTiming(0, openTiming, finished => {
      if (finished) {
        contentHeight.value = 0;
        scheduleOnRN(handleClosed);
      }
    });
  }, [expanded, progress, contentHeight, handleClosed]);

  const clipStyle = useAnimatedStyle(() => ({
    height: contentHeight.value * progress.value,
    opacity: progress.value,
  }));

  const handleContentLayout = (event: LayoutChangeEvent) => {
    const height = event.nativeEvent.layout.height;
    contentHeight.value =
      contentHeight.value === 0 ? height : withTiming(height, openTiming);
    isMeasured.current = true;
    if (isOpenPending.current) {
      isOpenPending.current = false;
      progress.value = withTiming(1, openTiming);
    }
    onContentHeight?.(height);
  };

  if (!isRendered) {
    return null;
  }

  return (
    <Animated.View
      testID={testID}
      style={[styles.clip, clipStyle]}
      accessibilityElementsHidden={!expanded}
      importantForAccessibility={expanded ? 'auto' : 'no-hide-descendants'}
    >
      <View
        testID={testID ? `${testID}-content` : undefined}
        style={styles.content}
        onLayout={handleContentLayout}
      >
        {children}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
  },
  content: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});
