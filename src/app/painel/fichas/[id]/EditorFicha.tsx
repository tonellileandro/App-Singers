"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  INTERSECCOES,
  PILARES,
  interseccaoDe,
  type InterseccaoId,
} from "@/lib/matriz";
import { NOMES_REGIAO, type RegiaoVocal } from "@/lib/alunos";
import { escolherRegiao, type ItemFicha } from "@/lib/fichas";
import Etiquetas from "../../exercicios/Etiquetas";
import { excluirFicha, salvarFicha } from "../actions";
import { botaoPerigo, botaoPrimario, botaoSecundario, cartao, estiloCampo, estiloRotulo } from "@/components/ui";

export type ExercicioResumo = {
  id: string;
  titulo: string;
  pilares: string[];
  tags: string[];
  grupo_alvo: 1 | 2 | null;
  regioes: string[];
};

type Props = {
  ficha: { id: string; titulo: string; data: string; observacoes: string };
  aluno: { id: string; nome: string; grupo: 1 | 2; regiao_vocal: RegiaoVocal; token_publico: string };
  itensIniciais: ItemFicha[];
  exercicios: ExercicioResumo[];
};

export default function EditorFicha({ ficha, aluno, itensIniciais, exercicios }: Props) {
  const [titulo, setTitulo] = useState(ficha.titulo);
  const [data, setData] = useState(ficha.data);
  const [observacoes, setObservacoes] = useState(ficha.observacoes);
  const [itens, setItens] = useState<ItemFicha[]>(itensIniciais);
  const [alterado, setAlterado] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: "erro" | "ok"; texto: string } | null>(null);
  const [salvando, iniciarSalvar] = useTransition();
  const [excluindo, iniciarExcluir] = useTransition();
  const [copiado, setCopiado] = useState(false);

  const [busca, setBusca] = useState("");
  const [regiaoVenn, setRegiaoVenn] = useState("");
  const [soDoGrupo, setSoDoGrupo] = useState(true);

  const porId = useMemo(() => new Map(exercicios.map((e) => [e.id, e])), [exercicios]);
  const naFicha = new Set(itens.map((i) => i.exercicio_id));

  // Avisa se tentar sair da página sem salvar.
  useEffect(() => {
    if (!alterado) return;
    const aviso = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", aviso);
    return () => window.removeEventListener("beforeunload", aviso);
  }, [alterado]);

  function mudar<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setAlterado(true);
      setMensagem(null);
    };
  }
  const mudarItens = mudar(setItens);

  function mover(i: number, delta: number) {
    const j = i + delta;
    if (j < 0 || j >= itens.length) return;
    const novos = [...itens];
    [novos[i], novos[j]] = [novos[j], novos[i]];
    mudarItens(novos);
  }

  function salvar() {
    iniciarSalvar(async () => {
      const r = await salvarFicha(ficha.id, { titulo, data, observacoes, itens });
      if (r.erro) setMensagem({ tipo: "erro", texto: r.erro });
      else {
        setAlterado(false);
        setMensagem({ tipo: "ok", texto: "Ficha salva! O aluno já vê esta versão no link dele." });
      }
    });
  }

  function excluir() {
    if (!window.confirm("Excluir esta ficha? Os exercícios continuam na biblioteca.")) return;
    iniciarExcluir(async () => {
      const r = await excluirFicha(ficha.id);
      if (r?.erro) setMensagem({ tipo: "erro", texto: r.erro });
    });
  }

  async function copiarLink() {
    const link = `${window.location.origin}/ficha/${aluno.token_publico}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      window.prompt("Copie o link:", link);
    }
  }

  const disponiveis = exercicios.filter((e) => {
    if (naFicha.has(e.id)) return false;
    if (busca && !e.titulo.toLowerCase().includes(busca.toLowerCase())) return false;
    if (soDoGrupo && e.grupo_alvo !== null && e.grupo_alvo !== aluno.grupo) return false;
    if (regiaoVenn.startsWith("p:") && !e.pilares.includes(regiaoVenn.slice(2))) return false;
    if (regiaoVenn.startsWith("i:") && interseccaoDe(e.pilares) !== (regiaoVenn.slice(2) as InterseccaoId))
      return false;
    return true;
  });

  function avisoAudio(e: ExercicioResumo) {
    const r = escolherRegiao(aluno.regiao_vocal, e.regioes);
    if (!r) return { cor: "text-red-700", texto: "⚠ Sem áudio — o aluno verá só as instruções" };
    if (r !== aluno.regiao_vocal)
      return {
        cor: "text-amber-700",
        texto: `⚠ Sem áudio ${NOMES_REGIAO[aluno.regiao_vocal].toLowerCase()}: o aluno ouvirá o ${NOMES_REGIAO[r].toLowerCase()}`,
      };
    return null;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold">Ficha de {aluno.nome}</h1>
        <span className="rounded-full bg-lilas-100 px-2.5 py-0.5 text-xs text-lilas-800">
          Grupo {aluno.grupo} · região {NOMES_REGIAO[aluno.regiao_vocal].toLowerCase()}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <a href={`/ficha/${aluno.token_publico}`} target="_blank" rel="noreferrer" className={botaoSecundario}>
          👁 Ver como o aluno vê
        </a>
        <button type="button" onClick={copiarLink} className={botaoSecundario}>
          {copiado ? "✓ Link copiado!" : "🔗 Copiar link do aluno"}
        </button>
      </div>
      <p className="text-xs text-stone-500">
        O link do aluno é sempre o mesmo e mostra a ficha mais recente dele. Pode mandar por WhatsApp.
      </p>

      <section className={`${cartao} grid gap-4 sm:grid-cols-[1fr_auto]`}>
        <label className="block">
          <span className={estiloRotulo}>Título</span>
          <input value={titulo} onChange={(e) => mudar(setTitulo)(e.target.value)} className={estiloCampo} />
        </label>
        <label className="block">
          <span className={estiloRotulo}>Data</span>
          <input type="date" value={data} onChange={(e) => mudar(setData)(e.target.value)} className={estiloCampo} />
        </label>
        <label className="block sm:col-span-2">
          <span className={estiloRotulo}>Recado para o aluno</span>
          <textarea
            rows={2}
            value={observacoes}
            onChange={(e) => mudar(setObservacoes)(e.target.value)}
            className={estiloCampo}
          />
        </label>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className={`${cartao} space-y-3`}>
          <h2 className="text-lg font-semibold">Exercícios da ficha ({itens.length})</h2>
          {itens.length === 0 && (
            <p className="rounded-xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">
              Adicione exercícios da biblioteca ao lado (ou abaixo, no celular).
            </p>
          )}
          <ol className="space-y-3">
            {itens.map((it, i) => {
              const e = porId.get(it.exercicio_id);
              const aviso = e ? avisoAudio(e) : null;
              return (
                <li key={it.exercicio_id} className="rounded-xl border border-stone-200 p-3">
                  <div className="flex items-start gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amarelo-300 text-sm font-bold text-lilas-900">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{e?.titulo ?? "Exercício removido da biblioteca"}</p>
                      {aviso && <p className={`text-xs ${aviso.cor}`}>{aviso.texto}</p>}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => mover(i, -1)}
                        disabled={i === 0}
                        aria-label="Subir"
                        className="rounded-md border border-stone-300 px-2 py-1 text-sm disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => mover(i, 1)}
                        disabled={i === itens.length - 1}
                        aria-label="Descer"
                        className="rounded-md border border-stone-300 px-2 py-1 text-sm disabled:opacity-30"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => mudarItens(itens.filter((_, k) => k !== i))}
                        aria-label="Tirar da ficha"
                        className="rounded-md border border-red-200 px-2 py-1 text-sm text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <input
                    value={it.observacao}
                    onChange={(ev) =>
                      mudarItens(itens.map((x, k) => (k === i ? { ...x, observacao: ev.target.value } : x)))
                    }
                    placeholder="Observação para este aluno (ex.: 3 vezes ao dia)"
                    className={`${estiloCampo} text-sm`}
                  />
                </li>
              );
            })}
          </ol>
        </section>

        <section className={`${cartao} space-y-3`}>
          <h2 className="text-lg font-semibold">Biblioteca</h2>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar pelo título…"
            className={`${estiloCampo} mt-0`}
          />
          <select value={regiaoVenn} onChange={(e) => setRegiaoVenn(e.target.value)} className={`${estiloCampo} mt-0`}>
            <option value="">Todos os pilares</option>
            <optgroup label="Pilar">
              {PILARES.map((p) => (
                <option key={p.id} value={`p:${p.id}`}>
                  {p.nome}
                </option>
              ))}
            </optgroup>
            <optgroup label="Interseção do Venn">
              {INTERSECCOES.map((x) => (
                <option key={x.id} value={`i:${x.id}`}>
                  {x.nome}
                </option>
              ))}
            </optgroup>
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={soDoGrupo} onChange={(e) => setSoDoGrupo(e.target.checked)} />
            Mostrar só exercícios do Grupo {aluno.grupo}
          </label>
          {exercicios.length === 0 ? (
            <p className="text-sm text-stone-500">
              A biblioteca está vazia.{" "}
              <Link href="/painel/exercicios/novo" className="text-lilas-700 underline">
                Cadastrar exercício
              </Link>
            </p>
          ) : disponiveis.length === 0 ? (
            <p className="text-sm text-stone-500">Nenhum exercício com esses filtros.</p>
          ) : (
            <ul className="max-h-[32rem] space-y-2 overflow-y-auto pr-1">
              {disponiveis.map((e) => (
                <li key={e.id} className="flex items-start gap-2 rounded-xl border border-stone-200 p-3">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <p className="font-medium">{e.titulo}</p>
                    <Etiquetas pilares={e.pilares} tags={e.tags} />
                  </div>
                  <button
                    type="button"
                    onClick={() => mudarItens([...itens, { exercicio_id: e.id, observacao: "" }])}
                    className="shrink-0 rounded-lg bg-lilas-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-lilas-700"
                  >
                    + Adicionar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-lilas-200 bg-lilas-50/95 px-4 py-3 backdrop-blur">
        <button type="button" onClick={salvar} disabled={salvando} className={botaoPrimario}>
          {salvando ? "Salvando…" : "Salvar ficha"}
        </button>
        {alterado && !mensagem && <span className="text-sm text-amber-700">Há alterações não salvas.</span>}
        {mensagem && (
          <span
            role={mensagem.tipo === "erro" ? "alert" : "status"}
            className={`text-sm ${mensagem.tipo === "erro" ? "text-red-700" : "text-green-800"}`}
          >
            {mensagem.tipo === "ok" ? "✓ " : ""}
            {mensagem.texto}
          </span>
        )}
        <button type="button" onClick={excluir} disabled={excluindo} className={`${botaoPerigo} ml-auto`}>
          {excluindo ? "Excluindo…" : "Excluir ficha"}
        </button>
      </div>
    </div>
  );
}
