import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const dismiss = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toast = useCallback((message, type = 'info') => {
        const id = ++toastId;
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => dismiss(id), 4000);
    }, [dismiss]);

    const success = useCallback((msg) => toast(msg, 'success'), [toast]);
    const error = useCallback((msg) => toast(msg, 'error'), [toast]);
    const info = useCallback((msg) => toast(msg, 'info'), [toast]);

    return (
        <ToastContext.Provider value={{ toast, success, error, info }}>
            {children}
            <div className="fixed bottom-4 right-4 z-100 flex flex-col gap-2 max-w-sm">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        role="alert"
                        className={`px-4 py-3 rounded-xl shadow-lg border text-sm font-medium animate-in fade-in ${
                            t.type === 'success'
                                ? 'bg-emerald-900/95 border-emerald-600 text-emerald-100'
                                : t.type === 'error'
                                  ? 'bg-red-900/95 border-red-600 text-red-100'
                                  : 'bg-slate-900/95 border-slate-600 text-slate-100'
                        }`}
                    >
                        {t.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}
