"use client";

import { useEffect, useState } from "react";

// Figma 4.B/4.H: 성공 토스트는 aria-live polite, 4초 이내 표시
export function FlashMessage({ message }: { message: string }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(t);
  }, []);
  if (!visible) return <div role="status" aria-live="polite" />;
  return (
    <div role="status" aria-live="polite" className="rounded-[12px] bg-success-bg px-4 py-3 text-sm text-success">
      {message}
    </div>
  );
}
