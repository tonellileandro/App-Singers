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
        <Link href="/painel/alunos" className={`${cartao} block hover:ring-rose-300`}>
          <p className="text-sm text-stone-500">Alunos ativos</p>
          <p className="mt-1 text-3xl font-semibold">{count ?? 0}</p>
          <p className="mt-3 text-sm font-medium text-rose-700">Ver alunos →</p>
        </Link>
        <div className={`${cartao} text-stone-500`}>
          <p className="font-medium text-stone-700">Em breve</p>
          <p className="mt-1 text-sm">Avaliações, biblioteca de exercícios e montagem de fichas.</p>
        </div>
      </div>
    </div>
  );
}
