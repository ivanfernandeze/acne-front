'use client';

import { X } from 'lucide-react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { Alert, type AlertTone } from '@/components/ui/feedback';

/**
 * Avisos flotantes que se cierran solos.
 *
 * Para lo que conviene notar en el momento pero no debe detener a nadie: que el análisis terminó
 * con una incongruencia, por ejemplo. Lo que hay que poder releer —una contraseña generada, el
 * motivo de un rechazo— va en un `Alert` persistente, nunca aquí: un aviso que desaparece a los
 * pocos segundos no puede ser el único lugar donde está la información.
 */

export interface ToastInput {
  tone?: AlertTone;
  title: string;
  message?: ReactNode;
  /** Milisegundos antes de cerrarse solo. 0 = hasta que lo cierren. */
  durationMs?: number;
}

interface ToastItem extends Required<Omit<ToastInput, 'message'>> {
  id: number;
  message?: ReactNode;
}

interface ToastContextValue {
  notify: (toast: ToastInput) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION_MS = 9000;

export function ToastProvider({ children }: { children: ReactNode }): JSX.Element {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback((input: ToastInput) => {
    const id = nextId.current++;
    setToasts((current) => [
      ...current,
      {
        id,
        tone: input.tone ?? 'info',
        title: input.title,
        message: input.message,
        durationMs: input.durationMs ?? DEFAULT_DURATION_MS,
      },
    ]);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2 sm:left-auto sm:w-96"
      >
        {toasts.map((toast) => (
          <ToastView key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastView({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: number) => void;
}): JSX.Element {
  useEffect(() => {
    if (toast.durationMs <= 0) return undefined;
    const timer = setTimeout(() => onDismiss(toast.id), toast.durationMs);
    return () => clearTimeout(timer);
  }, [toast.id, toast.durationMs, onDismiss]);

  return (
    <div className="pointer-events-auto relative w-full shadow-lg">
      <Alert tone={toast.tone} title={toast.title} className="bg-white pr-10">
        {toast.message}
      </Alert>
      <button
        type="button"
        aria-label="Cerrar aviso"
        onClick={() => onDismiss(toast.id)}
        className="absolute right-2 top-2 rounded p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

/**
 * `notify` del proveedor más cercano. Fuera de un `ToastProvider` no falla: no muestra nada, para
 * que un componente reutilizado en una pantalla sin avisos no rompa la página.
 */
export function useToast(): ToastContextValue {
  return useContext(ToastContext) ?? NO_TOASTS;
}

const NO_TOASTS: ToastContextValue = { notify: () => undefined };
