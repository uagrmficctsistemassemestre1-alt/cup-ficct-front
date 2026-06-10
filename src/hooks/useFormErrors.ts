"use client";

import { useCallback, useState } from "react";
import { getErrorMessage, getValidationErrors } from "@/lib/api";

// Maneja errores de formulario: 422 por campo + mensaje general.
export function useFormErrors() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState<string | null>(null);

  const handle = useCallback((error: unknown) => {
    const validation = getValidationErrors(error);
    if (validation) {
      setFieldErrors(validation);
      setMessage(null);
    } else {
      setFieldErrors({});
      setMessage(getErrorMessage(error));
    }
  }, []);

  const reset = useCallback(() => {
    setFieldErrors({});
    setMessage(null);
  }, []);

  const fieldError = useCallback(
    (name: string): string | undefined => fieldErrors[name]?.[0],
    [fieldErrors],
  );

  return { fieldErrors, message, setMessage, handle, reset, fieldError };
}
