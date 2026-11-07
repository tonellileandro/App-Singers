import Link from "next/link";
import { criarClienteServidor } from "@/lib/supabase/server";
import { cartao } from "@/components/ui";

export default async function Painel() {
  const supabase = await criarClienteServidor();
  const { count } = await supabase
    .from("alunos")
    .select("id", { count: "exact", head: true })
    .eq("ativo", true);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Olá! 🎵</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/painel/alunos" className={`${cartao} block hover:ring-lilas-300`}>
          <p className="text-sm text-stone-500">Alunos ativos</p>
          <p className="mt-1 text-3xl font-semibold text-lilas-700">{count ?? 0}</p>
          <p className="mt-3 text-sm font-medium text-lilas-700">Ver alunos →</p>
        </Link>
        <Link href="/painel/exercicios" className={`${cartao} block hover:ring-lilas-300`}>
          <p className="text-sm text-stone-500">Biblioteca</p>
          <p className="mt-1 text-lg font-semibold text-lilas-700">Exercícios</p>
          <p className="mt-3 text-sm font-medium text-lilas-700">Abrir biblioteca →</p>
        </Link>
        <Link href="/painel/fichas/nova" className={`${cartao} block hover:ring-lilas-300`}>
          <p className="text-sm text-stone-500">Atalho</p>
          <p className="mt-1 text-lg font-semibold text-lilas-700">Montar nova ficha</p>
          <p className="mt-3 text-sm font-medium text-lilas-700">Começar →</p>
        </Link>
      </div>
    </div>
  );
}
