"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

const inputClass =
  "h-12 w-full rounded-[12px] border bg-warmNeutral-0 px-4 text-base text-warmNeutral-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 aria-[invalid=true]:border-error";

export function TextField({
  name,
  label,
  type = "text",
  defaultValue,
  error,
  autoComplete,
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string;
  error?: string;
  autoComplete?: string;
}) {
  const errorId = `${name}-error`;
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm font-medium text-warmNeutral-900">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={`${inputClass} ${error ? "border-error" : "border-warmNeutral-200"}`}
      />
      {error && (
        <p id={errorId} role="alert" className="mt-2 text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}

export function PasswordField({
  name,
  label,
  hint,
  error,
  autoComplete,
}: {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);
  const errorId = `${name}-error`;
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm font-medium text-warmNeutral-900">
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`${inputClass} pr-16 ${error ? "border-error" : "border-warmNeutral-200"}`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 px-4 text-sm font-medium text-primary-700"
        >
          {visible ? "숨기기" : "표시"}
        </button>
      </div>
      {hint && !error && <p className="mt-2 text-sm text-warmNeutral-500">{hint}</p>}
      {error && (
        <p id={errorId} role="alert" className="mt-2 text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}

export function SubmitButton({
  children,
  pendingLabel,
}: {
  children: React.ReactNode;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-12 w-full rounded-[14px] bg-primary-700 text-[15px] font-semibold text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-[12px] bg-error-bg px-4 py-3 text-sm text-error">
      {message}
    </p>
  );
}
