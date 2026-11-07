import Link from "next/link";
import { criarClienteServidor } from "@/lib/supabase/server";
import { NOMES_GRUPO, NOMES_REGIAO, type Aluno } from "@/lib/alunos";
import { botaoPrimario, estiloCampo } from "@/components/ui";

type Props = { searchParams: Promise<{ q?: string; inativos?: string; excluido?: string }> };

export default async function ListaAlunos({ searchParams }: Props) {
  const { q = "", inativos, excluido } = await searchParams;
  const mostrarInativos = inativos === "1";

  const supabase = await criarClienteServidor();
  let consulta = supabase
    .from("alunos")
    .select("*")
    .eq("ativo", !mostrarInativos)
    .order("nome");
  if (q.trim()) consulta = consulta.ilike("nome", `%${q.trim()}%`);
  const { data, error } = await consulta;
  const alunos = (data ?? []) as Aluno[];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{mostrarInativos ? "Alunos inativos" : "Alunos"}</h1>
        <Link href="/painel/alunos/novo" className={botaoPrimario}>
          + Novo aluno
        </Link>
      </div>

      {excluido && (
        <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
          ✓ Aluno excluído, junto com todos os dados dele.
        </p>
      )}

      <form className="flex flex-wrap gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar pelo nome…"
          className={`${estiloCampo} mt-0 max-w-xs`}
        />
        {mostrarInativos && <input type="hidden" name="inativos" value="1" />}
        <button className="rounded-lg border border-stone-300 bg-white px-4 py-2 hover:bg-stone-100">
          Buscar
        </button>
        <Link
          href={mostrarInativos ? "/painel/alunos" : "/painel/alunos?inativos=1"}
          className="ml-auto self-center text-sm text-stone-600 underline hover:text-stone-900"
        >
          {mostrarInativos ? "Ver alunos ativos" : "Ver alunos inativos"}
        </Link>
      </form>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          Não foi possível carregar a lista de alunos. Recarregue a página.
        </p>
      )}

      {!error && alunos.length === 0 && (
        <p className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-stone-500">
          {q
            ? `Nenhum aluno encontrado com “${q}”.`
            : mostrarInativos
              ? "Nenhum aluno inativo."
              : "Nenhum aluno cadastrado ainda. Clique em “+ Novo aluno” para começar."}
        </p>
      )}

      {alunos.length > 0 && (
        <ul className="divide-y divide-stone-200 overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200">
          {alunos.map((a) => (
            <li key={a.id}>
              <Link
                href={`/painel/alunos/${a.id}`}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 hover:bg-stone-50"
              >
                <span className="font-medium">{a.nome}</span>
                <span className="text-sm text-stone-500">{NOMES_GRUPO[a.grupo]}</span>
                <span className="ml-auto rounded-full bg-stone-100 px-2.5 py-0.5 text-xs text-stone-700">
                  {NOMES_REGIAO[a.regiao_vocal]}
                  {a.classificacao_vocal ? ` · ${a.classificacao_vocal}` : ""}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
