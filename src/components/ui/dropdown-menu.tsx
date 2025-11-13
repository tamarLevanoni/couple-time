'use client';

import { ReactNode, useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface DropdownMenuProps {
  children: ReactNode;
}

interface DropdownMenuTriggerProps {
  children: ReactNode;
  asChild?: boolean;
}

interface DropdownMenuContentProps {
  children: ReactNode;
  align?: 'start' | 'center' | 'end';
}

interface DropdownMenuItemProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative inline-block">
      {Array.isArray(children) ? (
        <>
          {children.map((child, index) =>
            child.type === DropdownMenuTrigger
              ? <div key={index} onClick={() => setIsOpen(!isOpen)}>{child}</div>
              : child.type === DropdownMenuContent && isOpen
              ? <div key={index}>{child}</div>
              : null
          )}
        </>
      ) : (
        children
      )}
    </div>
  );
}

export function DropdownMenuTrigger({ children, asChild }: DropdownMenuTriggerProps) {
  return <>{children}</>;
}

export function DropdownMenuContent({ children, align = 'end' }: DropdownMenuContentProps) {
  const alignmentClasses = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0',
  };

  return (
    <div
      className={cn(
        'absolute top-full mt-2 min-w-[160px] rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50',
        alignmentClasses[align]
      )}
    >
      <div className="py-1">{children}</div>
    </div>
  );
}

export function DropdownMenuItem({ children, onClick, disabled = false }: DropdownMenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full text-right px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {children}
    </button>
  );
}
