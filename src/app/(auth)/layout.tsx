export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-[440px] flex-1 px-5 py-12">
      <div className="rounded-[20px] border border-warmNeutral-200 bg-warmNeutral-0 p-6 sm:p-8">
        {children}
      </div>
    </main>
  );
}
