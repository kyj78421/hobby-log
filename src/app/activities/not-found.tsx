import Link from "next/link";

export default function ActivityNotFound() {
  return (
    <main className="mx-auto w-full max-w-[760px] flex-1 px-5 py-16 text-center">
      <h1 className="text-2xl font-bold text-primary-900">요청한 기록을 찾을 수 없어요.</h1>
      <p className="mt-3 text-warmNeutral-700">삭제됐거나 주소가 올바르지 않을 수 있어요.</p>
      <Link
        href="/activities"
        className="mt-8 inline-block rounded-[14px] bg-primary-700 px-6 py-3.5 text-[15px] font-semibold text-white hover:bg-primary-600"
      >
        아카이브로 이동
      </Link>
    </main>
  );
}
