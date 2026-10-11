import React, { useEffect, useRef } from 'react';

export const RemoteKeys = {
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  ENTER: 13,
  BACK: 461, // webOS Back Key Code
  ESCAPE: 27,
  RED: 403,
  GREEN: 404,
  YELLOW: 405,
  BLUE: 406,
  PLAY: 415,
  PAUSE: 19,
  STOP: 413,
};

export interface FocusableProps extends React.HTMLAttributes<HTMLDivElement> {
  focusKey: string;
  isFocused?: boolean;
  onSelect?: () => void;
  className?: string;
  children: React.ReactNode;
}

export const FocusableItem: React.FC<FocusableProps> = ({
  focusKey,
  isFocused = false,
  onSelect,
  className = '',
  children,
  ...props
}) => {
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isFocused && itemRef.current) {
      itemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      });
    }
  }, [isFocused]);

  return (
    <div
      ref={itemRef}
      data-focus-key={focusKey}
      tabIndex={0}
      onClick={onSelect}
      className={`transition-all duration-200 outline-none cursor-pointer ${
        isFocused ? 'ring-4 ring-cyan-400 scale-105 shadow-lg shadow-cyan-500/50' : 'opacity-90'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
