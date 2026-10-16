'use client';

import * as React from 'react';
import {
  Terminal,
  Plot,
  Padlock,
  Riffle,
  Cabinet,
} from '@lucasmarkes/hairline/react';
import { cn } from '@/lib/utils';

export type HairlineFigureType =
  | 'terminal'
  | 'plot'
  | 'padlock'
  | 'riffle'
  | 'cabinet';

export type HairlineSize = 'compact' | 'medium' | 'banner' | 'large';

interface HairlineAccentProps {
  figure: HairlineFigureType;
  size?: HairlineSize;
  intensity?: number;
  play?: boolean;
  plateColor?: string;
  className?: string;
  label?: string;
}

const SIZE_CLASSES: Record<HairlineSize, string> = {
  compact: 'w-[56px] h-[45px] min-w-[56px] min-h-[45px]',
  medium: 'w-[80px] h-[64px] min-w-[80px] min-h-[64px]',
  banner: 'w-[110px] h-[88px] min-w-[110px] min-h-[88px]',
  large: 'w-[160px] h-[128px] min-w-[160px] min-h-[128px]',
};

export function HairlineAccent({
  figure,
  size = 'compact',
  intensity = 0.4,
  play = true,
  plateColor,
  className,
  label,
}: HairlineAccentProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.compact;

  const style = plateColor
    ? ({ '--hairline-plate': plateColor } as React.CSSProperties)
    : undefined;

  const renderFigure = () => {
    const commonProps = {
      intensity,
      play,
      label: label || `${figure} 3D isometric figure`,
      className: 'w-full h-full cursor-pointer select-none',
    };

    switch (figure) {
      case 'terminal':
        return <Terminal {...commonProps} />;
      case 'plot':
        return <Plot {...commonProps} />;
      case 'padlock':
        return <Padlock {...commonProps} />;
      case 'riffle':
        return <Riffle {...commonProps} />;
      case 'cabinet':
        return <Cabinet {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div
      style={style}
      className={cn(
        'relative inline-flex items-center justify-center shrink-0 overflow-hidden rounded-lg transition-transform hover:scale-105 active:scale-95 duration-200',
        sizeClass,
        className
      )}
    >
      {mounted ? (
        renderFigure()
      ) : (
        <div className="w-full h-full bg-muted/20 animate-pulse rounded-lg" />
      )}
    </div>
  );
}
