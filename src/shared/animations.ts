import {
  Easing,
  FadeIn,
  FadeOut,
  Keyframe,
  LinearTransition,
  ReduceMotion,
} from 'react-native-reanimated';

import { motion } from '@/core/theme';

// Presets de movimento da spec 03 §8. Todos respeitam "Reduzir movimento" do
// sistema (ReduceMotion.System): com ele ativo, viram troca instantânea.

const easeOut = Easing.out(Easing.cubic);

/** Entrada com fade + deslocamento vertical (negativo = vem de cima). */
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

/** Itens abaixo de um acordeão deslizam quando ele abre/fecha. */
export const layoutTransition = LinearTransition.duration(motion.normal)
  .easing(easeOut)
  .reduceMotion(ReduceMotion.System);

/** Painel do dropdown: fade + 4 pt vindo de cima, ligado ao gatilho. */
export const dropdownPanelEntering = fadeInFrom(-4, motion.fast);

/** Itens de lista: fade + 8 pt vindo de baixo, escalonados (máx. 6 itens). */
export function listItemEntering(index: number) {
  const step = Math.min(index, motion.staggerMaxItems - 1);
  return fadeInFrom(8, motion.normal).delay(step * motion.stagger);
}
