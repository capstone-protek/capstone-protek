import { useState, useCallback } from 'react';

export type Toast = {
  id: string;
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void } | null;
};

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const add = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Date.now().toString();
    setToasts((s) => [...s, { id, ...t }]);
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((s) => s.filter((t) => t.id !== id));
  }, []);

  return { toasts, add, remove } as const;
}

export const toast = {
  info: (t: Omit<Toast, 'id'>) => console.log('toast', t),
  success: (t: Omit<Toast, 'id'>) => console.log('toast success', t),
  error: (t: Omit<Toast, 'id'>) => console.log('toast error', t),
};
