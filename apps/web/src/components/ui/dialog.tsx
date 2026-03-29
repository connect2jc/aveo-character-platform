'use client';

import { Fragment, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

function Dialog({ open, onClose, children, className }: DialogProps) {
  if (!open) return null;

  return (
    <Fragment>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={cn(
            'relative w-full max-w-lg rounded-xl bg-white p-6 shadow-xl',
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </Fragment>
  );
}

function DialogHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mb-4', className)}>{children}</div>;
}

function DialogTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cn('text-lg font-semibold text-gray-900', className)}>{children}</h2>;
}

function DialogDescription({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('text-sm text-gray-500 mt-1', className)}>{children}</p>;
}

function DialogFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mt-6 flex justify-end gap-3', className)}>
      {children}
    </div>
  );
}

export { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter };
