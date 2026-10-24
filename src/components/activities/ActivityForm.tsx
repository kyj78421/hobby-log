"use client";

import Link from "next/link";
import { useActionState, useRef, useState, useTransition } from "react";
import type { ActivityFormState } from "@/app/activities/actions";
import type { Category } from "@/lib/activities";
import { FormError } from "@/components/auth/fields";
import { EMOTIONS } from "@/lib/emotions";
import { PHOTO_TYPES, validatePhoto } from "@/lib/photos";

type Initial = {
  id?: string;
  activity_date: string;
  hobby_id: string;
  title: string;
  content: string;
  emotion: string;
  satisfaction: string;
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
  existingPhotoUrl,
  submitLabel,
  pendingLabel,
  cancelHref,
}: {
  action: (prev: ActivityFormState, formData: FormData) => Promise<ActivityFormState>;
  categories: Category[];
  initial: Initial;
  existingPhotoUrl?: string | null;
  submitLabel: string;
  pendingLabel: string;
  cancelHref: string;
}) {
  const [state, formAction, isPending] = useActionState<ActivityFormState, FormData>(action, {});
  const [, startTransition] = useTransition();
  const initialCategory =
    categories.find((c) => c.hobbies.some((h) => String(h.id) === initial.hobby_id))?.id ?? "";

  // 저장에 실패해도 입력한 값이 사라지지 않도록 모든 입력을 상태로 관리한다.
  const [date, setDate] = useState(initial.activity_date);
  const [categoryId, setCategoryId] = useState(String(initialCategory));
  const [hobbyId, setHobbyId] = useState(initial.hobby_id);
  const [title, setTitle] = useState(initial.title);
  const [content, setContent] = useState(initial.content);
  const [emotion, setEmotion] = useState(initial.emotion);
  const [satisfaction, setSatisfaction] = useState(initial.satisfaction);
  // 사진: 새로 고른 파일의 미리보기, 기존 사진 제거 여부
  const fileInput = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeExisting, setRemoveExisting] = useState(false);
  const [photoError, setPhotoError] = useState<string>();

  function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPhotoError(undefined);
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const message = validatePhoto(file);
    if (message) {
      setPhotoError(message);
      setPreviewUrl(null);
      e.target.value = "";
      return;
    }
    setPreviewUrl(URL.createObjectURL(file));
  }

  function clearPhoto() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPhotoError(undefined);
    if (fileInput.current) fileInput.current.value = "";
  }

  // form action 대신 직접 제출해, 저장에 실패해도 입력과 사진 미리보기가 초기화되지 않게 한다.
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isPending) return;
    const data = new FormData(e.currentTarget);
    startTransition(() => formAction(data));
  }

  const errors = { ...state.fieldErrors, ...(photoError ? { photo: photoError } : {}) };
  const shownPhoto = previewUrl ?? (removeExisting ? null : (existingPhotoUrl ?? null));
  const hobbies = categories.find((c) => String(c.id) === categoryId)?.hobbies ?? [];
  const border = (key: keyof typeof errors) =>
    errors[key] ? "border-error" : "border-warmNeutral-200";

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
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

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-warmNeutral-900">
          활동 사진 <span className="text-warmNeutral-500">(선택, 1장 · JPG/PNG/WebP · 5MB 이하)</span>
        </legend>
        {removeExisting && <input type="hidden" name="remove_photo" value="1" />}
        {shownPhoto && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shownPhoto} alt="선택한 사진 미리보기" className="mb-3 max-h-64 rounded-[14px] object-cover" />
        )}
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileInput}
            id="photo"
            name="photo"
            type="file"
            accept={Object.keys(PHOTO_TYPES).join(",")}
            onChange={onPickPhoto}
            aria-invalid={!!errors.photo}
            aria-describedby={errors.photo ? "photo-error" : undefined}
            className="block w-full text-sm text-warmNeutral-700 file:mr-3 file:h-11 file:rounded-[14px] file:border file:border-primary-300 file:bg-warmNeutral-0 file:px-4 file:font-semibold file:text-primary-700"
          />
          {previewUrl && (
            <button type="button" onClick={clearPhoto} className="h-11 rounded-[14px] px-4 text-sm font-semibold text-primary-700 underline">
              선택 취소
            </button>
          )}
          {!previewUrl && existingPhotoUrl && !removeExisting && (
            <button type="button" onClick={() => setRemoveExisting(true)} className="h-11 rounded-[14px] px-4 text-sm font-semibold text-error underline">
              사진 삭제
            </button>
          )}
          {removeExisting && (
            <button type="button" onClick={() => setRemoveExisting(false)} className="h-11 rounded-[14px] px-4 text-sm font-semibold text-primary-700 underline">
              삭제 취소
            </button>
          )}
        </div>
        {errors.photo && (
          <p id="photo-error" role="alert" className="mt-2 text-sm text-error">
            {errors.photo}
          </p>
        )}
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-warmNeutral-900">
          오늘의 감정 <span className="text-warmNeutral-500">(선택)</span>
        </legend>
        <input type="hidden" name="emotion" value={emotion} />
        <div className="grid grid-cols-4 gap-2">
          {EMOTIONS.map((e) => {
            const selected = emotion === e.key;
            return (
              <button
                key={e.key}
                type="button"
                aria-pressed={selected}
                onClick={() => setEmotion(selected ? "" : e.key)}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-[12px] border px-1 py-2 text-xs font-medium ${
                  selected
                    ? "border-primary-500 bg-primary-200 text-primary-900 ring-2 ring-primary-300"
                    : "border-warmNeutral-200 bg-warmNeutral-0 text-warmNeutral-700 hover:bg-warmNeutral-100"
                }`}
              >
                <span className="text-2xl" aria-hidden>
                  {e.emoji}
                </span>
                {e.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-warmNeutral-900">
          만족도 <span className="text-warmNeutral-500">(선택)</span>
        </legend>
        <input type="hidden" name="satisfaction" value={satisfaction} />
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => {
            const filled = Number(satisfaction) >= n;
            return (
              <button
                key={n}
                type="button"
                aria-label={`5점 만점에 ${n}점`}
                aria-pressed={satisfaction === String(n)}
                onClick={() => setSatisfaction(satisfaction === String(n) ? "" : String(n))}
                className={`h-12 w-12 text-3xl ${filled ? "text-accent-star" : "text-warmNeutral-300"}`}
              >
                ★
              </button>
            );
          })}
          <span className="ml-2 text-sm text-warmNeutral-500">
            {satisfaction ? `${satisfaction}점` : "선택 안 함"}
          </span>
        </div>
      </fieldset>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href={cancelHref}
          className="flex h-12 items-center justify-center rounded-[14px] border border-primary-300 bg-warmNeutral-0 px-6 text-[15px] font-semibold text-primary-700 hover:bg-primary-50"
        >
          취소
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="h-12 rounded-[14px] bg-primary-700 px-6 text-[15px] font-semibold text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-40"
        >
          {isPending ? pendingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}
