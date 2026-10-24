"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { ActivityFormState } from "@/app/activities/actions";
import type { Category } from "@/lib/activities";
import { FormError, SubmitButton } from "@/components/auth/fields";

type Initial = {
  id?: string;
  activity_date: string;
  hobby_id: string;
  title: string;
  content: string;
};

const controlClass =
  "h-12 w-full rounded-[12px] border bg-warmNeutral-0 px-4 text-base text-warmNeutral-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 aria-[invalid=true]:border-error";

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-warmNeutral-900">
        {label} <span className="text-error" aria-label="필수">*</span>
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-2 text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}

export function ActivityForm({
  action,
  categories,
  initial,
  submitLabel,
  pendingLabel,
  cancelHref,
}: {
  action: (prev: ActivityFormState, formData: FormData) => Promise<ActivityFormState>;
  categories: Category[];
  initial: Initial;
  submitLabel: string;
  pendingLabel: string;
  cancelHref: string;
}) {
  const [state, formAction] = useActionState<ActivityFormState, FormData>(action, {});
  const initialCategory =
    categories.find((c) => c.hobbies.some((h) => String(h.id) === initial.hobby_id))?.id ?? "";

  // 저장에 실패해도 입력한 값이 사라지지 않도록 모든 입력을 상태로 관리한다.
  const [date, setDate] = useState(initial.activity_date);
  const [categoryId, setCategoryId] = useState(String(initialCategory));
  const [hobbyId, setHobbyId] = useState(initial.hobby_id);
  const [title, setTitle] = useState(initial.title);
  const [content, setContent] = useState(initial.content);

  const errors = state.fieldErrors ?? {};
  const hobbies = categories.find((c) => String(c.id) === categoryId)?.hobbies ?? [];
  const border = (key: keyof typeof errors) =>
    errors[key] ? "border-error" : "border-warmNeutral-200";

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      <FormError message={state.error} />

      <Field id="activity_date" label="활동 날짜" error={errors.activity_date}>
        <input
          id="activity_date"
          name="activity_date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-invalid={!!errors.activity_date}
          aria-describedby={errors.activity_date ? "activity_date-error" : undefined}
          className={`${controlClass} ${border("activity_date")}`}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="category_id" label="취미 분류" error={errors.category_id}>
          <select
            id="category_id"
            name="category_id"
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setHobbyId("");
            }}
            aria-invalid={!!errors.category_id}
            aria-describedby={errors.category_id ? "category_id-error" : undefined}
            className={`${controlClass} ${border("category_id")}`}
          >
            <option value="">분류를 선택해 주세요</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field id="hobby_id" label="세부 취미" error={errors.hobby_id}>
          <select
            id="hobby_id"
            name="hobby_id"
            value={hobbyId}
            onChange={(e) => setHobbyId(e.target.value)}
            disabled={!categoryId}
            aria-invalid={!!errors.hobby_id}
            aria-describedby={errors.hobby_id ? "hobby_id-error" : undefined}
            className={`${controlClass} ${border("hobby_id")} disabled:bg-warmNeutral-100`}
          >
            <option value="">{categoryId ? "세부 취미를 선택해 주세요" : "분류를 먼저 선택해 주세요"}</option>
            {hobbies.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field id="title" label="제목" error={errors.title}>
        <input
          id="title"
          name="title"
          type="text"
          maxLength={100}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? "title-error" : undefined}
          className={`${controlClass} ${border("title")}`}
        />
      </Field>

      <Field id="content" label="활동 내용" error={errors.content}>
        <textarea
          id="content"
          name="content"
          rows={8}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          aria-invalid={!!errors.content}
          aria-describedby={errors.content ? "content-error" : undefined}
          className={`w-full rounded-[12px] border bg-warmNeutral-0 px-4 py-3 text-base leading-relaxed text-warmNeutral-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 aria-[invalid=true]:border-error ${border("content")}`}
        />
      </Field>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href={cancelHref}
          className="flex h-12 items-center justify-center rounded-[14px] border border-primary-300 bg-warmNeutral-0 px-6 text-[15px] font-semibold text-primary-700 hover:bg-primary-50"
        >
          취소
        </Link>
        <div className="sm:w-40">
          <SubmitButton pendingLabel={pendingLabel}>{submitLabel}</SubmitButton>
        </div>
      </div>
    </form>
  );
}
