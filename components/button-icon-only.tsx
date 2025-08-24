 'use client';

import type { ReactNode, MouseEventHandler } from 'react';

export interface ButtonIconOnlyProps {
  ariaLabel: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children?: ReactNode;
  className?: string; // optional override / extension
  type?: 'button' | 'submit' | 'reset';
}

const baseClasses =
  'inline-flex items-center p-2 rounded-md border hover:bg-gray-300 dark:hover:bg-gray-700';

export function ButtonIconOnly({
  ariaLabel,
  onClick,
  children,
  className,
  type = 'button',
}: ButtonIconOnlyProps) {
  return (
    <button
      type={type}
      aria-label={ariaLabel}
      onClick={onClick}
      className={className ? `${baseClasses} ${className}` : baseClasses}
    >
      {children}
    </button>
  );
}

export default ButtonIconOnly;
