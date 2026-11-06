import Svg, { Circle, Path } from 'react-native-svg';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

type ToastIconProps = {
  variant: ToastVariant;
  color: string;
  size?: number;
};

const STROKE = {
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  fill: 'none',
} as const;

export function ToastIcon({ variant, color, size = 20 }: ToastIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color}>
      {variant === 'warning' ? (
        <>
          <Path d="M12 3.5 2.8 19.5h18.4L12 3.5Z" {...STROKE} />
          <Path d="M12 10v4.5M12 17.2v.1" {...STROKE} />
        </>
      ) : (
        <>
          <Circle cx={12} cy={12} r={9} {...STROKE} />
          {variant === 'success' ? (
            <Path d="m7.8 12.3 2.9 2.9 5.5-5.8" {...STROKE} />
          ) : null}
          {variant === 'error' ? (
            <Path d="M12 7.5v5.2M12 16.3v.1" {...STROKE} />
          ) : null}
          {variant === 'info' ? (
            <Path d="M12 11v5.2M12 7.7v.1" {...STROKE} />
          ) : null}
        </>
      )}
    </Svg>
  );
}

export function CloseIcon({
  color,
  size = 14,
}: {
  color: string;
  size?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color}>
      <Path d="M5 5l14 14M19 5 5 19" {...STROKE} />
    </Svg>
  );
}
