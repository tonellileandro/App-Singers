"use client";

import { useActionState, useState } from "react";
import {
  PILARES,
  TAGS_INICIANTES,
  PILAR_DA_TAG,
  interseccaoDe,
  NOME_INTERSECCAO,
  type Exercicio,
  type PilarId,
} from "@/lib/matriz";
import type { EstadoFormulario } from "./actions";
import { botaoPrimario, estiloCampo, estiloRotulo } from "@/components/ui";

type Props = {
  acao: (estado: EstadoFormulario, form: FormData) => Promise<EstadoFormulario>;
  exercicio?: Exercicio;
  textoBotao: string;
};

const estiloOpcao =
  "flex cursor-pointer items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm has-[:checked]:border-lilas-500 has-[:checked]:bg-lilas-100";

export default function FormExercicio({ acao, exercicio, textoBotao }: Props) {
  const [estado, enviar, enviando] = useActionState(acao, undefined);
  const [tags, setTags] = useState<Set<string>>(new Set(exercicio?.tags ?? []));
  const [pilares, setPilares] = useState<Set<PilarId>>(
    new Set((exercicio?.pilares ?? []) as PilarId[])
  );

  function alternarTag(id: string, marcado: boolean) {
    const novas = new Set(tags);
    if (marcado) novas.add(id);
    else novas.delete(id);
    setTags(novas);
    const pilar = PILAR_DA_TAG[id];
    if (marcado && pilar) setPilares(new Set(pilares).add(pilar));
  }

  function alternarPilar(id: PilarId, marcado: boolean) {
    const novos = new Set(pilares);
    if (marcado) novos.add(id);
    else {
      novos.delete(id);
      // Desmarcar o pilar desmarca as tags dele.
      setTags(new Set([...tags].filter((t) => PILAR_DA_TAG[t] !== id)));
    }
    setPilares(novos);
  }

  const interseccao = interseccaoDe([...pilares]);

  return (
    <form action={enviar} className="space-y-6">
      <label className="block">
        <span className={estiloRotulo}>Título *</span>
        <input
          name="titulo"
          required
          defaultValue={exercicio?.titulo}
          placeholder="Ex.: Sopro em “Sss” cronometrado"
          className={estiloCampo}
        />
      </label>

      <label className="block">
        <span className={estiloRotulo}>Instruções para o aluno</span>
        <span className="block text-xs text-stone-500">Aparecem na ficha e na página do aluno.</span>
        <textarea
          name="instrucoes"
          rows={5}
          defaultValue={exercicio?.instrucoes ?? ""}
          className={estiloCampo}
        />
      </label>

      <fieldset>
        <legend className={estiloRotulo}>Para quais alunos?</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {[
            ["", "Todos"],
            ["1", "Grupo 1 — Iniciantes"],
            ["2", "Grupo 2 — Técnica vocal"],
          ].map(([valor, rotulo]) => (
            <label key={valor} className={estiloOpcao}>
              <input
                type="radio"
                name="grupo_alvo"
                value={valor}
                defaultChecked={String(exercicio?.grupo_alvo ?? "") === valor}
              />
              {rotulo}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="rounded-xl border border-stone-200 p-4">
        <legend className="px-1 text-sm font-semibold">Iniciantes (Grupo 1)</legend>
        <div className="flex flex-wrap gap-2">
          {TAGS_INICIANTES.map((t) => (
            <label key={t.id} className={estiloOpcao}>
              <input
                type="checkbox"
                name="tags"
                value={t.id}
                checked={tags.has(t.id)}
                onChange={(e) => alternarTag(t.id, e.target.checked)}
              />
              {t.nome}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="space-y-4">
        <p className={estiloRotulo}>Pilares e tags (Grupo 2)</p>
        {PILARES.map((p) => (
          <fieldset key={p.id} className="rounded-xl border border-stone-200 p-4">
            <legend className="px-1">
              <label className="flex cursor-pointer items-center gap-2 font-semibold text-lilas-800">
                <input
                  type="checkbox"
                  name="pilares"
                  value={p.id}
                  checked={pilares.has(p.id)}
                  onChange={(e) => alternarPilar(p.id, e.target.checked)}
                />
                {p.nome}
                <span className="text-xs font-normal text-stone-500">— {p.descricao}</span>
              </label>
            </legend>
            <div className="space-y-3">
              {p.grupos.map((g, i) => (
                <div key={i}>
                  {g.nome && <p className="mb-1 text-xs font-medium text-stone-600">{g.nome}</p>}
                  <div className="flex flex-wrap gap-2">
                    {g.tags.map((t) => (
                      <label key={t.id} className={estiloOpcao}>
                        <input
                          type="checkbox"
                          name="tags"
                          value={t.id}
                          checked={tags.has(t.id)}
                          onChange={(e) => alternarTag(t.id, e.target.checked)}
                        />
                        {t.nome}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </fieldset>
        ))}
        <p className="rounded-lg bg-amarelo-100 px-3 py-2 text-sm text-stone-800">
          {interseccao ? (
            <>
              Interseção no Venn: <strong>{NOME_INTERSECCAO[interseccao]}</strong>
            </>
          ) : (
            "Marque dois ou três pilares para o exercício entrar numa interseção do Venn."
          )}
        </p>
      </div>

      {estado?.erro && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {estado.erro}
        </p>
      )}
      {estado?.sucesso && (
        <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
          ✓ {estado.sucesso}
        </p>
      )}

      <button type="submit" disabled={enviando} className={botaoPrimario}>
        {enviando ? "Salvando…" : textoBotao}
      </button>
    </form>
  );
}
