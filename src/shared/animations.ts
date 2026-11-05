import {
  Easing,
  FadeIn,
  FadeOut,
  Keyframe,
  LinearTransition,
  ReduceMotion,
} from 'react-native-reanimated';

import { motion } from '@/core/theme';

const easeOut = Easing.out(Easing.cubic);

export const smoothEasing = Easing.bezierFn(0.4, 0, 0.2, 1);

export const emphasizedAccelerate = Easing.bezierFn(0.3, 0, 0.8, 0.15);

export const openTiming = {
  duration: motion.open,
  easing: smoothEasing,
  reduceMotion: ReduceMotion.System,
};

function fadeInFrom(offsetY: number, duration: number) {
  return new Keyframe({
    0: { opacity: 0, transform: [{ translateY: offsetY }] },
    100: {
      opacity: 1,
      transform: [{ translateY: 0 }],
      easing: smoothEasing,
    },
  })
    .duration(duration)
    .reduceMotion(ReduceMotion.System);
}

export const fadeInFast = FadeIn.duration(motion.fast)
  .easing(easeOut)
  .reduceMotion(ReduceMotion.System);

export const fadeInSmooth = FadeIn.duration(motion.open)
  .easing(smoothEasing)
  .reduceMotion(ReduceMotion.System);

export const fadeOutFast = FadeOut.duration(motion.fast)
  .easing(easeOut)
  .reduceMotion(ReduceMotion.System);

export const layoutTransition = LinearTransition.duration(motion.open)
  .easing(smoothEasing)
  .reduceMotion(ReduceMotion.System);

export function listItemEntering(index: number) {
  const step = Math.min(index, motion.staggerMaxItems - 1);
  return fadeInFrom(8, motion.slow).delay(step * motion.stagger);
}

export function screenSectionEntering(index: number) {
  return fadeInFrom(12, motion.open).delay(index * motion.sectionStagger);
}

export const TOAST_OFFSET = 24;

export const toastEntering = fadeInFrom(TOAST_OFFSET, motion.open);

export const toastExiting = new Keyframe({
  0: { opacity: 1, transform: [{ translateY: 0 }] },
  100: {
    opacity: 0,
    transform: [{ translateY: TOAST_OFFSET }],
    easing: emphasizedAccelerate,
  },
})
  .duration(motion.normal)
  .reduceMotion(ReduceMotion.System);
