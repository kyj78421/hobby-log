import { SignupForm } from "@/components/auth/SignupForm";

export const metadata = { title: "회원가입 · HOBBY LOG" };

export default function SignupPage() {
  return (
    <>
      <h1 className="mb-6 text-[30px] font-bold leading-tight text-primary-900 sm:text-4xl">
        회원가입
      </h1>
      <SignupForm />
    </>
  );
}
