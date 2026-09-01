'use client';

import { useEffect, useRef } from 'react';

interface UseModalBehaviorProps {
  isOpen: boolean;
  onClose: () => void;
  preventCloseOnOverlayClick?: boolean;
}

/**
 * Production-ready modal lifecycle hook:
 * - Listens for ESC key to dismiss modal.
 * - Prevents background page scroll (Body scroll lock).
 * - Manages focus restoration on close.
 */
export function useModalBehavior({
  isOpen,
  onClose,
  preventCloseOnOverlayClick = false,
}: UseModalBehaviorProps) {
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Save previous active element for focus restoration
    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      previousActiveElement.current = document.activeElement;
    }

    // 1. Lock Body Scroll
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    // 2. Handle ESC Key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      window.removeEventListener('keydown', handleKeyDown);

      // Restore focus on close
      if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (preventCloseOnOverlayClick) return;
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return {
    handleBackdropClick,
  };
}
