import Link from "next/link";
import { criarClienteServidor } from "@/lib/supabase/server";
import {
  INTERSECCOES,
  PILARES,
  TAGS_INICIANTES,
  interseccaoDe,
  type Exercicio,
  type InterseccaoId,
} from "@/lib/matriz";
import Etiquetas from "./Etiquetas";
import { botaoPrimario, estiloCampo } from "@/components/ui";

type Filtros = { q?: string; tag?: string; regiao?: string; grupo?: string; excluido?: string };
type Props = { searchParams: Promise<Filtros> };

export default async function Biblioteca({ searchParams }: Props) {
  const { q = "", tag = "", regiao = "", grupo = "", excluido } = await searchParams;
  const supabase = await criarClienteServidor();

  const { data, error } = await supabase
    .from("exercicios")
    .select("*, audios_exercicio(regiao)")
    .order("titulo");

  type Linha = Exercicio & { audios_exercicio: { regiao: string }[] };
  const todos = (data ?? []) as Linha[];

  // regiao = um pilar sozinho ("p:fonacao") ou uma interseção ("i:etvso")
  const filtrados = todos.filter((e) => {
    if (q && !e.titulo.toLowerCase().includes(q.toLowerCase())) return false;
    if (tag && !e.tags.includes(tag)) return false;
    if (grupo && e.grupo_alvo !== null && String(e.grupo_alvo) !== grupo) return false;
    if (regiao.startsWith("p:") && !e.pilares.includes(regiao.slice(2))) return false;
    if (regiao.startsWith("i:") && interseccaoDe(e.pilares) !== (regiao.slice(2) as InterseccaoId))
      return false;
    return true;
  });
  const temFiltro = !!(q || tag || regiao || grupo);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Biblioteca de exercícios</h1>
        <Link href="/painel/exercicios/novo" className={botaoPrimario}>
          + Novo exercício
        </Link>
      </div>

      {excluido && (
        <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
          ✓ Exercício excluído.
        </p>
      )}

      <form className="grid gap-2 rounded-2xl bg-white p-4 ring-1 ring-stone-200 sm:grid-cols-2 lg:grid-cols-4">
        <input name="q" defaultValue={q} placeholder="Buscar pelo título…" className={`${estiloCampo} mt-0`} />
        <select name="regiao" defaultValue={regiao} className={`${estiloCampo} mt-0`}>
          <option value="">Todos os pilares</option>
          <optgroup label="Pilar">
            {PILARES.map((p) => (
              <option key={p.id} value={`p:${p.id}`}>
                {p.nome}
              </option>
            ))}
          </optgroup>
          <optgroup label="Interseção do Venn">
            {INTERSECCOES.map((i) => (
              <option key={i.id} value={`i:${i.id}`}>
                {i.nome} ({i.explicacao})
              </option>
            ))}
          </optgroup>
        </select>
        <select name="tag" defaultValue={tag} className={`${estiloCampo} mt-0`}>
          <option value="">Todas as tags</option>
          <optgroup label="Iniciantes">
            {TAGS_INICIANTES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </optgroup>
          {PILARES.map((p) => (
            <optgroup key={p.id} label={p.nome}>
              {p.grupos.flatMap((g) =>
                g.tags.map((t) => (
                  <option key={t.id} value={t.id}>
                    {g.nome ? `${g.nome}: ${t.nome}` : t.nome}
                  </option>
                ))
              )}
            </optgroup>
          ))}
        </select>
        <select name="grupo" defaultValue={grupo} className={`${estiloCampo} mt-0`}>
          <option value="">Todos os grupos</option>
          <option value="1">Grupo 1 — Iniciantes</option>
          <option value="2">Grupo 2 — Técnica vocal</option>
        </select>
        <div className="flex gap-2 sm:col-span-2 lg:col-span-4">
          <button className="rounded-lg bg-lilas-600 px-4 py-2 font-medium text-white hover:bg-lilas-700">
            Filtrar
          </button>
          {temFiltro && (
            <Link href="/painel/exercicios" className="self-center text-sm text-stone-600 underline">
              Limpar filtros
            </Link>
          )}
          <span className="ml-auto self-center text-sm text-stone-500">
            {filtrados.length} de {todos.length} exercício(s)
          </span>
        </div>
      </form>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          Não foi possível carregar a biblioteca. Recarregue a página.
        </p>
      )}

      {!error && filtrados.length === 0 && (
        <p className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-stone-500">
          {temFiltro
            ? "Nenhum exercício com esses filtros."
            : "A biblioteca está vazia. Clique em “+ Novo exercício” para cadastrar o primeiro."}
        </p>
      )}

      {filtrados.length > 0 && (
        <ul className="divide-y divide-stone-200 overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200">
          {filtrados.map((e) => {
            const qtdAudios = e.audios_exercicio?.length ?? 0;
            return (
              <li key={e.id}>
                <Link href={`/painel/exercicios/${e.id}`} className="block space-y-2 px-4 py-3 hover:bg-lilas-50">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{e.titulo}</span>
                    <span
                      className={`ml-auto text-xs ${qtdAudios === 3 ? "text-green-700" : "text-amber-700"}`}
                      title="Áudios enviados (grave, médio, agudo)"
                    >
                      🎵 {qtdAudios}/3 áudios
                    </span>
                  </div>
                  <Etiquetas pilares={e.pilares} tags={e.tags} />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
