"use client";

import { useFormState } from "react-dom";
import { useEffect, useRef } from "react";
import type { ActionState } from "@/lib/action-utils";

type SafeFormProps = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  className?: string;
  children: React.ReactNode;
  resetOnSuccess?: boolean;
  successMessage?: string;
};

export function SafeForm({
  action,
  className,
  children,
  resetOnSuccess = true,
  successMessage,
}: SafeFormProps) {
  const [state, formAction] = useFormState(action, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success && resetOnSuccess && formRef.current) {
      formRef.current.reset();
    }
  }, [state.success, resetOnSuccess]);

  return (
    <form ref={formRef} action={formAction} className={className}>
      {state.error && (
        <div className="mb-3 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
          {state.error}
        </div>
      )}
      {state.success && successMessage && (
        <div className="mb-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-sm text-emerald-400">
          {successMessage}
        </div>
      )}
      {children}
    </form>
  );
}
