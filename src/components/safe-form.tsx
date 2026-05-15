"use client";

import { useFormState } from "react-dom";
import { useEffect, useRef, useState } from "react";
import type { ActionState } from "@/lib/action-utils";

type SafeFormProps = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  className?: string;
  children: React.ReactNode;
  resetOnSuccess?: boolean;
  successMessage?: string;
};

function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all animate-[slideUp_0.3s_ease-out] ${
        type === "success"
          ? "bg-emerald-600 text-white"
          : "bg-red-600 text-white"
      }`}
    >
      {message}
    </div>
  );
}

export function SafeForm({
  action,
  className,
  children,
  resetOnSuccess = true,
  successMessage,
}: SafeFormProps) {
  const [state, formAction] = useFormState(action, {});
  const formRef = useRef<HTMLFormElement>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error"; key: number } | null>(null);

  useEffect(() => {
    if (state.success) {
      if (resetOnSuccess && formRef.current) {
        formRef.current.reset();
      }
      if (successMessage) {
        setToast({ message: successMessage, type: "success", key: Date.now() });
      }
    }
    if (state.error) {
      setToast({ message: state.error, type: "error", key: Date.now() });
    }
  }, [state.success, state.error, resetOnSuccess, successMessage]);

  return (
    <>
      <form ref={formRef} action={formAction} className={className}>
        {state.error && (
          <div className="mb-3 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
            {state.error}
          </div>
        )}
        {children}
      </form>
      {toast && <Toast key={toast.key} message={toast.message} type={toast.type} />}
    </>
  );
}
