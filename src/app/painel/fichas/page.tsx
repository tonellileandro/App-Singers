import Link from "next/link";
import { criarClienteServidor } from "@/lib/supabase/server";
import { formatarDataCurta } from "@/lib/fichas";
import { botaoPrimario } from "@/components/ui";

type Props = { searchParams: Promise<{ excluida?: string }> };

export default async function ListaFichas({ searchParams }: Props) {
  const { excluida } = await searchParams;
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("fichas")
    .select("id, titulo, data, alunos(nome), ficha_itens(count)")
    .order("data", { ascending: false })
    .order("criado_em", { ascending: false })
    .limit(200);

  type Linha = {
    id: string;
    titulo: string;
    data: string;
    alunos: { nome: string } | null;
    ficha_itens: { count: number }[];
  };
  const fichas = (data ?? []) as unknown as Linha[];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Fichas de treino</h1>
        <Link href="/painel/fichas/nova" className={botaoPrimario}>
          + Nova ficha
        </Link>
      </div>

      {excluida && (
        <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
          ✓ Ficha excluída.
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          Não foi possível carregar as fichas. Recarregue a página.
        </p>
      )}
      {!error && fichas.length === 0 && (
        <p className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-stone-500">
          Nenhuma ficha ainda. Clique em “+ Nova ficha” para montar a primeira.
        </p>
      )}
      {fichas.length > 0 && (
        <ul className="divide-y divide-stone-200 overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200">
          {fichas.map((f) => (
            <li key={f.id}>
              <Link
                href={`/painel/fichas/${f.id}`}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 hover:bg-lilas-50"
              >
                <span className="font-medium">{f.alunos?.nome ?? "—"}</span>
                <span className="text-sm text-stone-600">{f.titulo}</span>
                <span className="ml-auto text-sm text-stone-500">
                  {formatarDataCurta(f.data)} · {f.ficha_itens?.[0]?.count ?? 0} exercício(s)
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
