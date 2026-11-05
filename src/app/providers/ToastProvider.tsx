import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { motion, theme } from '@/core/theme';
import { Toast, type ToastVariant } from '@/shared/components/Toast';
import { useKeyboardHeight } from '@/shared/hooks/useKeyboardHeight';

export type ToastOptions = {
  id?: string;
  title?: string;
  variant?: ToastVariant;
  duration?: number;
};

type ActiveToast = {
  key: string;
  message: string;
  title?: string;
  variant: ToastVariant;
  duration: number;
  run: number;
};

type BottomInset = {
  owner: object;
  height: number;
};

type ToastContextValue = {
  showToast(message: string, options?: ToastOptions): void;
  hideToast(): void;
  setBottomInset(owner: object, height: number | null): void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function useToastContext(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider');
  }
  return context;
}

export function useToast() {
  const { showToast, hideToast } = useToastContext();
  return { showToast, hideToast };
}

export function useToastBottomInset(height: number) {
  const { setBottomInset } = useToastContext();
  const [owner] = useState(() => ({}));

  useEffect(() => {
    setBottomInset(owner, height);
  }, [owner, height, setBottomInset]);

  useEffect(() => () => setBottomInset(owner, null), [owner, setBottomInset]);
}

export function ToastProvider({ children }: PropsWithChildren) {
  const [toast, setToast] = useState<ActiveToast | null>(null);
  const [insets, setInsets] = useState<BottomInset[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const sequence = useRef(0);

  const hideToast = useCallback(() => {
    clearTimeout(timer.current);
    setToast(null);
  }, []);

  const showToast = useCallback(
    (
      message: string,
      {
        id,
        title,
        variant = 'info',
        duration = motion.toastDuration,
      }: ToastOptions = {},
    ) => {
      clearTimeout(timer.current);
      sequence.current += 1;
      setToast({
        key: id ?? `toast-${sequence.current}`,
        message,
        title,
        variant,
        duration,
        run: sequence.current,
      });
      timer.current = setTimeout(() => setToast(null), duration);
    },
    [],
  );

  const setBottomInset = useCallback((owner: object, height: number | null) => {
    setInsets(current => {
      if (height === null) {
        return current.filter(entry => entry.owner !== owner);
      }
      return current.some(entry => entry.owner === owner)
        ? current.map(entry =>
            entry.owner === owner ? { owner, height } : entry,
          )
        : [...current, { owner, height }];
    });
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const value = useMemo(
    () => ({ showToast, hideToast, setBottomInset }),
    [showToast, hideToast, setBottomInset],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastHost
        toast={toast}
        barHeight={insets[insets.length - 1]?.height ?? 0}
        onDismiss={hideToast}
      />
    </ToastContext.Provider>
  );
}

type ToastHostProps = {
  toast: ActiveToast | null;
  barHeight: number;
  onDismiss: () => void;
};

function ToastHost({ toast, barHeight, onDismiss }: ToastHostProps) {
  const safeArea = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const bottom =
    (keyboardHeight > 0 ? keyboardHeight : safeArea.bottom) +
    barHeight +
    theme.spacing.xs;

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      {toast ? (
        <View
          testID="toast-host"
          pointerEvents="box-none"
          style={[styles.slot, { bottom }]}
        >
          <Toast
            key={toast.key}
            message={toast.message}
            title={toast.title}
            variant={toast.variant}
            duration={toast.duration}
            run={toast.run}
            onDismiss={onDismiss}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    position: 'absolute',
    left: theme.spacing.m,
    right: theme.spacing.m,
  },
});
