import type { Category, Hobby } from "@/lib/activities";

export type LinkRow = {
  sort_order: number;
  hobby: { id: number; name: string; owner_id: string | null; archived_at: string | null };
};

export type CategoryRow = { id: number; name: string; links: LinkRow[] };
export type OwnHobbyRow = {
  id: number;
  name: string;
  owner_id: string | null;
  archived_at: string | null;
  links: { category_id: number; sort_order: number }[];
};

// 공개 대분류에 내 취미 연결을 합치고, 보관된 취미를 빼고 정렬한다. (순수 함수)
export function composeCategories(defaults: CategoryRow[], own: OwnHobbyRow[]): Category[] {
  return defaults.map((c) => {
    const rows: { sortOrder: number; hobby: Hobby }[] = [];
    for (const l of c.links) {
      if (l.hobby.archived_at !== null) continue;
      rows.push({ sortOrder: l.sort_order, hobby: { id: l.hobby.id, name: l.hobby.name, own: l.hobby.owner_id !== null } });
    }
    for (const h of own) {
      if (h.archived_at !== null) continue;
      for (const l of h.links) {
        if (l.category_id === c.id) rows.push({ sortOrder: l.sort_order, hobby: { id: h.id, name: h.name, own: true } });
      }
    }
    rows.sort((a, b) => a.sortOrder - b.sortOrder || a.hobby.id - b.hobby.id);
    return { id: c.id, name: c.name, hobbies: rows.map((r) => r.hobby) };
  });
}

