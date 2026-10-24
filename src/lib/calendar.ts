// 월 달력 계산 (모두 UTC 기준의 순수 날짜 연산이라 시간대 영향을 받지 않는다)
export const isMonthString = (v: unknown): v is string =>
  typeof v === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(v);

const pad = (n: number) => String(n).padStart(2, "0");

export function shiftMonth(month: string, delta: number) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
}

export function monthRange(month: string) {
  const [y, m] = month.split("-").map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return { from: `${month}-01`, to: `${month}-${pad(last)}` };
}

// 일요일 시작, 앞뒤 빈 칸은 null
export function buildMonthGrid(month: string): (string | null)[][] {
  const [y, m] = month.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells: (string | null)[] = Array(first).fill(null);
  for (let d = 1; d <= days; d++) cells.push(`${month}-${pad(d)}`);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export const monthLabel = (month: string) => {
  const [y, m] = month.split("-").map(Number);
  return `${y}년 ${m}월`;
};
