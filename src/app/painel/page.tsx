import { redirect } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/server";

export default async function Painel() {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="mx-auto max-w-3xl p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Painel</h1>
        <form action="/auth/sair" method="post">
          <button className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-100">
            Sair
          </button>
        </form>
      </header>
      <p className="mt-6 text-stone-600">
        Olá! Você entrou como <strong>{user.email}</strong>.
      </p>
      <p className="mt-2 text-sm text-stone-500">
        Em breve aqui: Alunos, Avaliações, Biblioteca de exercícios e Montar ficha.
      </p>
    </main>
  );
}
