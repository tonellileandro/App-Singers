import Link from "next/link";
import { criarClienteServidor } from "@/lib/supabase/server";
import { hojeISO } from "@/lib/fichas";
import FormNovaFicha from "./FormNovaFicha";
import { cartao } from "@/components/ui";

type Props = { searchParams: Promise<{ aluno?: string }> };

export default async function NovaFicha({ searchParams }: Props) {
  const { aluno } = await searchParams;
  const supabase = await criarClienteServidor();
  const { data: alunos } = await supabase
    .from("alunos")
    .select("id, nome")
    .eq("ativo", true)
    .order("nome");

  const hoje = hojeISO();
  const [a, m, d] = hoje.split("-");

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href="/painel/fichas" className="text-sm text-stone-500 hover:text-stone-800">
        ← Voltar para fichas
      </Link>
      <h1 className="text-2xl font-semibold">Nova ficha</h1>
      {!alunos?.length ? (
        <p className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-stone-500">
          Cadastre um aluno primeiro em{" "}
          <Link href="/painel/alunos/novo" className="text-lilas-700 underline">
            Alunos
          </Link>
          .
        </p>
      ) : (
        <div className={cartao}>
          <FormNovaFicha
            alunos={alunos}
            alunoInicial={alunos.some((x) => x.id === aluno) ? aluno : undefined}
            hoje={hoje}
            tituloPadrao={`Ficha de treino — ${d}/${m}/${a}`}
          />
        </div>
      )}
    </div>
  );
}
