"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { isUuid } from "@/lib/activities";
import { EMOTIONS } from "@/lib/emotions";
import { PHOTO_BUCKET, PHOTO_TYPES, validatePhoto } from "@/lib/photos";
import { createClient } from "@/lib/supabase/server";

export type ActivityFormState = {
  values?: {
    activity_date: string;
    category_id: string;
    hobby_id: string;
    title: string;
    content: string;
    emotion: string;
    satisfaction: string;
  };
  fieldErrors?: Partial<
    Record<
      | "activity_date"
      | "category_id"
      | "hobby_id"
      | "title"
      | "content"
      | "emotion"
      | "satisfaction"
      | "photo",
      string
    >
  >;
  error?: string;
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parse(formData: FormData) {
  const values = {
    activity_date: String(formData.get("activity_date") ?? ""),
    category_id: String(formData.get("category_id") ?? ""),
    hobby_id: String(formData.get("hobby_id") ?? ""),
    title: String(formData.get("title") ?? ""),
    content: String(formData.get("content") ?? ""),
    emotion: String(formData.get("emotion") ?? ""),
    satisfaction: String(formData.get("satisfaction") ?? ""),
  };
  const fieldErrors: NonNullable<ActivityFormState["fieldErrors"]> = {};
  const date = new Date(`${values.activity_date}T00:00:00Z`);
  if (!values.activity_date) fieldErrors.activity_date = "활동 날짜를 선택해 주세요.";
  else if (!DATE_PATTERN.test(values.activity_date) || Number.isNaN(date.getTime()))
    fieldErrors.activity_date = "올바른 날짜를 선택해 주세요.";
  if (!values.category_id) fieldErrors.category_id = "취미 분류를 선택해 주세요.";
  if (!values.hobby_id) fieldErrors.hobby_id = "세부 취미를 선택해 주세요.";
  else if (!/^\d+$/.test(values.hobby_id)) fieldErrors.hobby_id = "세부 취미를 다시 선택해 주세요.";
  if (!values.title.trim()) fieldErrors.title = "제목을 입력해 주세요.";
  else if (values.title.trim().length > 100) fieldErrors.title = "제목은 100자 이내로 입력해 주세요.";
  if (!values.content.trim()) fieldErrors.content = "활동 내용을 입력해 주세요.";
  if (values.emotion && !EMOTIONS.some((e) => e.key === values.emotion))
    fieldErrors.emotion = "감정을 다시 선택해 주세요.";
  if (values.satisfaction && !/^[1-5]$/.test(values.satisfaction))
    fieldErrors.satisfaction = "만족도는 1~5점 중에서 선택해 주세요.";

  const file = formData.get("photo");
  const photo = file instanceof File && file.size > 0 ? file : null;
  if (photo) {
    const message = validatePhoto(photo);
    if (message) fieldErrors.photo = message;
  }
  return { values, fieldErrors, photo, removePhoto: formData.get("remove_photo") === "1" };
}

const row = (v: NonNullable<ActivityFormState["values"]>) => ({
  activity_date: v.activity_date,
  hobby_id: Number(v.hobby_id),
  title: v.title.trim(),
  content: v.content.trim(),
  emotion: v.emotion || null,
  satisfaction: v.satisfaction ? Number(v.satisfaction) : null,
});

type Supabase = Awaited<ReturnType<typeof createClient>>;

async function uploadPhoto(supabase: Supabase, userId: string, photo: File) {
  const path = `${userId}/${crypto.randomUUID()}.${PHOTO_TYPES[photo.type]}`;
  const { error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, photo, { contentType: photo.type });
  return error ? null : path;
}

// 정리 실패는 사용자 흐름을 막지 않는다 (남은 파일은 본인 폴더의 고아 파일로 남을 뿐이다).
async function removePhotoFile(supabase: Supabase, path: string | null | undefined) {
  if (path) await supabase.storage.from(PHOTO_BUCKET).remove([path]);
}

export async function createActivity(
  _prev: ActivityFormState,
  formData: FormData,
): Promise<ActivityFormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/activities/new");

  const { values, fieldErrors, photo } = parse(formData);
  if (Object.keys(fieldErrors).length > 0) return { values, fieldErrors };

  const supabase = await createClient();
  let photoPath: string | null = null;
  if (photo) {
    photoPath = await uploadPhoto(supabase, user.id, photo);
    if (!photoPath) {
      return { values, fieldErrors: { photo: "사진을 올리지 못했어요. 다시 시도해 주세요." } };
    }
  }

  const { data, error } = await supabase
    .from("activities")
    .insert({ ...row(values), user_id: user.id, photo_path: photoPath })
    .select("id")
    .single();
  if (error || !data) {
    await removePhotoFile(supabase, photoPath);
    return { values, error: "기록을 저장하지 못했어요. 다시 시도해 주세요." };
  }

  redirect(`/activities/${data.id}`);
}

export async function updateActivity(
  _prev: ActivityFormState,
  formData: FormData,
): Promise<ActivityFormState> {
  const id = String(formData.get("id") ?? "");
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/activities/${id}/edit`);
  if (!isUuid(id)) return { error: "요청한 기록을 찾을 수 없어요." };

  const { values, fieldErrors, photo, removePhoto } = parse(formData);
  if (Object.keys(fieldErrors).length > 0) return { values, fieldErrors };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("activities")
    .select("photo_path")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return { values, error: "요청한 기록을 찾을 수 없어요." };

  const changes: ReturnType<typeof row> & { photo_path?: string | null } = row(values);
  let newPath: string | null = null;
  if (photo) {
    newPath = await uploadPhoto(supabase, user.id, photo);
    if (!newPath) {
      return { values, fieldErrors: { photo: "사진을 올리지 못했어요. 다시 시도해 주세요." } };
    }
    changes.photo_path = newPath;
  } else if (removePhoto) {
    changes.photo_path = null;
  }

  const { data, error } = await supabase.from("activities").update(changes).eq("id", id).select("id");
  if (error || !data || data.length === 0) {
    await removePhotoFile(supabase, newPath);
    return { values, error: "기록을 저장하지 못했어요. 다시 시도해 주세요." };
  }

  if (newPath || removePhoto) await removePhotoFile(supabase, existing.photo_path);
  redirect(`/activities/${id}`);
}

export async function deleteActivity(id: string) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/activities/${id}`);
  if (!isUuid(id)) redirect("/activities");

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("activities")
    .select("photo_path")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("activities").delete().eq("id", id);
  // 이미 삭제된 기록을 다시 지워도 같은 결과(멱등)로 처리한다.
  if (error) redirect(`/activities/${id}?error=delete`);

  await removePhotoFile(supabase, existing?.photo_path);
  redirect("/activities?deleted=1");
}
