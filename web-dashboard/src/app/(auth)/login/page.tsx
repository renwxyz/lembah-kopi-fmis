import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream-50" />}>
      <LoginForm />
    </Suspense>
  );
}