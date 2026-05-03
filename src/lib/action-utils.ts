export type ActionState = {
  error?: string;
  success?: boolean;
};

function isRedirectError(e: unknown): boolean {
  return (
    e instanceof Error &&
    "digest" in e &&
    typeof (e as { digest?: string }).digest === "string" &&
    (e as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

export function createSafeAction(
  action: (formData: FormData) => Promise<void>,
): (prev: ActionState, formData: FormData) => Promise<ActionState> {
  return async (_prev: ActionState, formData: FormData) => {
    try {
      await action(formData);
      return { success: true };
    } catch (e) {
      if (isRedirectError(e)) throw e;
      if (e instanceof Error) {
        return { error: e.message };
      }
      return { error: "Ocurrió un error inesperado" };
    }
  };
}
