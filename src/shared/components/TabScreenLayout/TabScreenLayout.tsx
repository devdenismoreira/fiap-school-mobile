import {
  createContext,
  useContext,
  useRef,
  type PropsWithChildren,
} from 'react';
import { StyleSheet, View, type HostInstance } from 'react-native';
import Animated, {
  cancelAnimation,
  scrollTo,
  useAnimatedReaction,
  useAnimatedRef,
  useScrollOffset,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Text, theme } from '@/core/theme';
import { openTiming, screenSectionEntering } from '@/shared/animations';
import { StudentGreeting } from '@/shared/components/StudentGreeting';

type ScrollFocus = {
  revealExpanding: (block: HostInstance | null, addedHeight: number) => void;
  followCollapsing: (removedHeight: number) => void;
};

const noop = () => {};
const ScrollFocusContext = createContext<ScrollFocus>({
  revealExpanding: noop,
  followCollapsing: noop,
});

export const useScrollFocus = () => useContext(ScrollFocusContext);

const FOCUS_MARGIN = theme.spacing.m;

type TabScreenLayoutProps = PropsWithChildren<{
  title: string;
}>;

export function TabScreenLayout({ title, children }: TabScreenLayoutProps) {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollOffset(scrollRef);
  const contentRef = useRef<HostInstance>(null);
  const viewportHeight = useRef(0);
  const contentHeight = useRef(0);
  const focusY = useSharedValue(0);
  const isFocusing = useSharedValue(false);

  useAnimatedReaction(
    () => focusY.value,
    y => {
      if (isFocusing.value) {
        scrollTo(scrollRef, 0, y, false);
      }
    },
  );

  const scrollAlong = (to: number) => {
    const from = scrollOffset.value;
    if (Math.abs(to - from) < 1) {
      return;
    }
    focusY.value = from;
    isFocusing.value = true;
    focusY.value = withTiming(to, openTiming, () => {
      isFocusing.value = false;
    });
  };

  const scrollFocus: ScrollFocus = {
    revealExpanding: (block, addedHeight) => {
      const content = contentRef.current;
      if (!block || !content) {
        return;
      }
      block.measureLayout(content, (_x, y, _width, height) => {
        const visibleBottom = scrollOffset.value + viewportHeight.current;
        const blockBottom = y + height + addedHeight + FOCUS_MARGIN;
        if (blockBottom <= visibleBottom) {
          return;
        }
        scrollAlong(
          Math.min(y - FOCUS_MARGIN, blockBottom - viewportHeight.current),
        );
      });
    },
    followCollapsing: removedHeight => {
      const maxOffsetAfter = Math.max(
        0,
        contentHeight.current - removedHeight - viewportHeight.current,
      );
      if (scrollOffset.value > maxOffsetAfter) {
        scrollAlong(maxOffsetAfter);
      }
    },
  };

  const stopFocusing = () => {
    isFocusing.value = false;
    cancelAnimation(focusY);
  };

  return (
    <ScrollFocusContext.Provider value={scrollFocus}>
      <Animated.ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onLayout={event => {
          viewportHeight.current = event.nativeEvent.layout.height;
        }}
        onContentSizeChange={(_width, height) => {
          contentHeight.current = height;
        }}
        onScrollBeginDrag={stopFocusing}
      >
        <View ref={contentRef} collapsable={false}>
          <Animated.View entering={screenSectionEntering(0)}>
            <StudentGreeting />
          </Animated.View>
          <Animated.View entering={screenSectionEntering(1)}>
            <Text
              variant="sectionTitle"
              textAlign="center"
              marginTop="huge"
              accessibilityRole="header"
            >
              {title}
            </Text>
          </Animated.View>
          <Animated.View entering={screenSectionEntering(2)}>
            {children}
          </Animated.View>
        </View>
      </Animated.ScrollView>
    </ScrollFocusContext.Provider>
  );
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: theme.colors.background,
  },
  content: {
    flexGrow: 1,
    paddingBottom: theme.spacing.xl,
  },
});
