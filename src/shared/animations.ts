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

function fadeInFrom(offsetY: number, duration: number) {
  return new Keyframe({
    0: { opacity: 0, transform: [{ translateY: offsetY }] },
    100: { opacity: 1, transform: [{ translateY: 0 }], easing: easeOut },
  })
    .duration(duration)
    .reduceMotion(ReduceMotion.System);
}

export const fadeInFast = FadeIn.duration(motion.fast)
  .easing(easeOut)
  .reduceMotion(ReduceMotion.System);

export const fadeInNormal = FadeIn.duration(motion.normal)
  .easing(easeOut)
  .reduceMotion(ReduceMotion.System);

export const fadeOutFast = FadeOut.duration(motion.fast)
  .easing(easeOut)
  .reduceMotion(ReduceMotion.System);

export const layoutTransition = LinearTransition.duration(motion.normal)
  .easing(easeOut)
  .reduceMotion(ReduceMotion.System);

export const dropdownPanelEntering = fadeInFrom(-4, motion.fast);

export function listItemEntering(index: number) {
  const step = Math.min(index, motion.staggerMaxItems - 1);
  return fadeInFrom(8, motion.normal).delay(step * motion.stagger);
}
