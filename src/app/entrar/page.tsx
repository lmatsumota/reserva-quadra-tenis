import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";

export default function EntrarPage() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Conta do jogador</h1>
      <Suspense fallback={<p>Carregando…</p>}>
        <AuthForm />
      </Suspense>
    </>
  );
}
