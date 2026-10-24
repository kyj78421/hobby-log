// Figma 4.F: 로딩은 실제 카드/숫자 구조와 같은 Skeleton (동작 줄이기 설정에서는 정지)
const pulse = "animate-pulse motion-reduce:animate-none rounded-[12px] bg-warmNeutral-200";

export function CardSkeleton() {
  return (
    <div className="rounded-[20px] border border-warmNeutral-200 bg-warmNeutral-0 p-5" aria-hidden>
      <div className={`${pulse} aspect-[4/3] w-full`} />
      <div className={`${pulse} mt-4 h-6 w-3/4`} />
      <div className={`${pulse} mt-3 h-4 w-1/2`} />
    </div>
  );
}

export function CardListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div role="status" aria-label="불러오는 중" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function BlockSkeleton({ className = "h-64" }: { className?: string }) {
  return <div role="status" aria-label="불러오는 중" className={`${pulse} ${className}`} />;
}
