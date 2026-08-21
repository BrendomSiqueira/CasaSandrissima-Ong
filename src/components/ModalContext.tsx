import React, { createContext, useContext, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, AlertTriangle, CheckCircle2, HelpCircle, Info } from 'lucide-react';

export type ModalSeverity = 'info' | 'success' | 'warn' | 'error';

interface ModalState {
  isOpen: boolean;
  type: 'alert' | 'confirm';
  severity: ModalSeverity;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  resolve?: (value: any) => void;
}

interface ModalContextType {
  alert: (message: string, title?: string, severity?: ModalSeverity) => Promise<void>;
  confirm: (message: string, title?: string, severity?: ModalSeverity) => Promise<boolean>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal deve ser usado dentro de um ModalProvider');
  }
  return context;
}

interface ModalProviderProps {
  children: ReactNode;
}

export function ModalProvider({ children }: ModalProviderProps) {
  const [state, setState] = useState<ModalState>({
    isOpen: false,
    type: 'alert',
    severity: 'info',
    title: '',
    message: '',
    confirmText: 'Ok',
    cancelText: 'Cancelar',
  });

  const alert = (message: string, title = 'Aviso', severity: ModalSeverity = 'info'): Promise<void> => {
    return new Promise<void>((resolve) => {
      setState({
        isOpen: true,
        type: 'alert',
        severity,
        title,
        message,
        confirmText: 'Entendido',
        cancelText: '',
        resolve: () => {
          resolve();
        },
      });
    });
  };

  const confirm = (message: string, title = 'Confirmar', severity: ModalSeverity = 'warn'): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setState({
        isOpen: true,
        type: 'confirm',
        severity,
        title,
        message,
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
        resolve: (value: boolean) => {
          resolve(value);
        },
      });
    });
  };

  const handleConfirm = () => {
    if (state.resolve) {
      if (state.type === 'confirm') {
        state.resolve(true);
      } else {
        state.resolve(undefined);
      }
    }
    setState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleCancel = () => {
    if (state.resolve && state.type === 'confirm') {
      state.resolve(false);
    }
    setState((prev) => ({ ...prev, isOpen: false }));
  };

  const getIcon = () => {
    switch (state.severity) {
      case 'success':
        return <CheckCircle2 className="h-6 w-6 text-emerald-600" />;
      case 'error':
        return <AlertCircle className="h-6 w-6 text-rose-600" />;
      case 'warn':
        return state.type === 'confirm' ? (
          <HelpCircle className="h-6 w-6 text-amber-600" />
        ) : (
          <AlertTriangle className="h-6 w-6 text-amber-600" />
        );
      case 'info':
      default:
        return <Info className="h-6 w-6 text-blue-600" />;
    }
  };

  const getColorClasses = () => {
    switch (state.severity) {
      case 'success':
        return {
          iconBg: 'bg-emerald-50 border-emerald-100',
          confirmBtn: 'bg-emerald-600 hover:bg-emerald-700 ring-emerald-500/20 text-white',
        };
      case 'error':
        return {
          iconBg: 'bg-rose-50 border-rose-100',
          confirmBtn: 'bg-rose-600 hover:bg-rose-700 ring-rose-500/20 text-white',
        };
      case 'warn':
        return {
          iconBg: 'bg-amber-50 border-amber-100',
          confirmBtn: 'bg-amber-600 hover:bg-amber-700 ring-amber-500/20 text-white',
        };
      case 'info':
      default:
        return {
          iconBg: 'bg-blue-50 border-blue-100',
          confirmBtn: 'bg-stone-900 hover:bg-stone-800 ring-stone-900/10 text-white',
        };
    }
  };

  const themeColors = getColorClasses();

  return (
    <ModalContext.Provider value={{ alert, confirm }}>
      {children}

      <AnimatePresence>
        {state.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={state.type === 'alert' ? handleConfirm : handleCancel}
              className="absolute inset-0 bg-stone-950/60 backdrop-blur-sm"
              id="modal-backdrop"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative w-full max-w-md overflow-hidden bg-white rounded-3xl border border-stone-200 shadow-2xl p-6 md:p-8 text-left z-10"
              id="modal-container"
            >
              <div className="flex items-start gap-4">
                {/* Icon Container */}
                <div className={`p-3 rounded-2xl border ${themeColors.iconBg} shrink-0 mt-0.5`}>
                  {getIcon()}
                </div>

                {/* Content */}
                <div className="space-y-2 flex-grow">
                  <h3 className="font-sans font-extrabold text-stone-900 text-lg leading-tight">
                    {state.title}
                  </h3>
                  <div className="text-sm text-stone-500 font-sans leading-relaxed whitespace-pre-line">
                    {state.message}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex gap-3 justify-end">
                {state.type === 'confirm' && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="h-11 px-5 border border-stone-200 hover:bg-stone-50 text-stone-600 font-extrabold rounded-xl text-xs uppercase cursor-pointer transition-all active:scale-98"
                    id="modal-cancel-btn"
                  >
                    {state.cancelText}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleConfirm}
                  className={`h-11 px-6 font-extrabold rounded-xl text-xs uppercase cursor-pointer transition-all active:scale-98 focus:outline-none focus:ring-4 shadow-sm ${themeColors.confirmBtn}`}
                  id="modal-confirm-btn"
                >
                  {state.confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ModalContext.Provider>
  );
}
