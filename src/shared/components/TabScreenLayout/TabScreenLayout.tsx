import {
  createContext,
  useContext,
  useRef,
  type PropsWithChildren,
} from 'react';
import {
  Platform,
  RefreshControl,
  StyleSheet,
  View,
  type HostInstance,
} from 'react-native';
import Animated, {
  cancelAnimation,
  scrollTo,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { Text, theme } from '@/core/theme';
import { openTiming, screenSectionEntering } from '@/shared/animations';
import { StudentGreeting } from '@/shared/components/StudentGreeting';
import { useRecordsReload } from '@/shared/hooks/useRecordsReload';

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
const FOCUS_RELEASE_DELAY = 100;
const IS_ANDROID = Platform.OS === 'android';

type TabScreenLayoutProps = PropsWithChildren<{
  title: string;
}>;

export function TabScreenLayout({ title, children }: TabScreenLayoutProps) {
  const { reload, isReloading } = useRecordsReload();
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollOffset(scrollRef);
  const contentRef = useRef<HostInstance>(null);
  const viewportHeight = useRef(0);
  const contentHeight = useRef(0);
  const focusY = useSharedValue(0);
  const isFocusing = useSharedValue(false);
  const reservedSpace = useSharedValue(0);

  const reservedSpaceStyle = useAnimatedStyle(() => ({
    height: reservedSpace.value,
  }));

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
    if (Math.abs(to - from) < 2) {
      return;
    }
    cancelAnimation(focusY);
    focusY.value = from;
    isFocusing.value = true;
    focusY.value = withTiming(to, openTiming, finished => {
      if (finished) {
        isFocusing.value = false;
      }
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
        if (IS_ANDROID) {
          reservedSpace.value = addedHeight;
          reservedSpace.value = withDelay(
            openTiming.duration + FOCUS_RELEASE_DELAY,
            withTiming(0, { duration: 0 }),
          );
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
        testID="tab-scroll"
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
        refreshControl={
          <RefreshControl
            refreshing={isReloading}
            onRefresh={reload}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
            progressBackgroundColor={theme.colors.surface}
          />
        }
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
        {IS_ANDROID ? <Animated.View style={reservedSpaceStyle} /> : null}
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
