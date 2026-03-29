'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DropdownMenuProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

function DropdownMenu({ trigger, children, align = 'right', className }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div
          className={cn(
            'absolute z-50 mt-2 min-w-[180px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg',
            align === 'right' ? 'right-0' : 'left-0',
            className
          )}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  destructive?: boolean;
}

function DropdownItem({ children, onClick, className, destructive }: DropdownItemProps) {
  return (
    <button
      className={cn(
        'flex w-full items-center px-4 py-2 text-sm hover:bg-gray-50',
        destructive ? 'text-red-600 hover:bg-red-50' : 'text-gray-700',
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function DropdownSeparator() {
  return <div className="my-1 border-t border-gray-100" />;
}

export { DropdownMenu, DropdownItem, DropdownSeparator };
