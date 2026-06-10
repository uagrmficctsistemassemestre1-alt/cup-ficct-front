import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

interface FieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  children: ReactNode;
}

// Etiqueta + control + error de validación (pintado bajo el input).
export function Field({ label, htmlFor, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-slate-600">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

// Base común de los controles (estética minimalista, foco sutil).
const controlBase =
  "w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 disabled:bg-slate-50 disabled:text-slate-400";

function borderClass(invalid: boolean): string {
  return invalid ? "border-red-300 focus:ring-red-500/10" : "border-slate-200";
}

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export function TextInput({ invalid = false, className = "", ...props }: TextInputProps) {
  return (
    <input {...props} className={`${controlBase} ${borderClass(invalid)} ${className}`} />
  );
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function TextArea({ invalid = false, className = "", ...props }: TextAreaProps) {
  return (
    <textarea {...props} className={`${controlBase} ${borderClass(invalid)} ${className}`} />
  );
}

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export function SelectInput({
  invalid = false,
  className = "",
  children,
  ...props
}: SelectInputProps) {
  return (
    <select {...props} className={`${controlBase} ${borderClass(invalid)} ${className}`}>
      {children}
    </select>
  );
}
