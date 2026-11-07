"use client";

import { useActionState } from "react";
import type { Aluno } from "@/lib/alunos";
import { NOMES_GRUPO, NOMES_REGIAO, SUGESTOES_CLASSIFICACAO } from "@/lib/alunos";
import type { EstadoFormulario } from "./actions";
import { botaoPrimario, estiloCampo, estiloRotulo } from "@/components/ui";

type Props = {
  acao: (estado: EstadoFormulario, form: FormData) => Promise<EstadoFormulario>;
  aluno?: Aluno;
  textoBotao: string;
};

export default function FormAluno({ acao, aluno, textoBotao }: Props) {
  const [estado, enviar, enviando] = useActionState(acao, undefined);

  return (
    <form action={enviar} className="space-y-5">
      <label className="block">
        <span className={estiloRotulo}>Nome completo *</span>
        <input name="nome" required defaultValue={aluno?.nome} className={estiloCampo} />
      </label>

      <label className="block">
        <span className={estiloRotulo}>Contato</span>
        <input
          name="contato"
          placeholder="Telefone, WhatsApp ou e-mail"
          defaultValue={aluno?.contato ?? ""}
          className={estiloCampo}
        />
      </label>

      <fieldset>
        <legend className={estiloRotulo}>Grupo *</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {[1, 2].map((g) => (
            <label
              key={g}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2 has-[:checked]:border-lilas-500 has-[:checked]:bg-lilas-50"
            >
              <input type="radio" name="grupo" value={g} required defaultChecked={aluno?.grupo === g} />
              {NOMES_GRUPO[g]}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className={estiloRotulo}>Região vocal * </legend>
        <p className="text-xs text-stone-500">
          Define qual gravação de piano o aluno vai ouvir em cada exercício.
        </p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {(Object.keys(NOMES_REGIAO) as (keyof typeof NOMES_REGIAO)[]).map((r) => (
            <label
              key={r}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2 has-[:checked]:border-lilas-500 has-[:checked]:bg-lilas-50"
            >
              <input
                type="radio"
                name="regiao_vocal"
                value={r}
                required
                defaultChecked={aluno?.regiao_vocal === r}
              />
              {NOMES_REGIAO[r]}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block">
        <span className={estiloRotulo}>Classificação vocal</span>
        <input
          name="classificacao_vocal"
          list="sugestoes-classificacao"
          placeholder="Ex.: Mezzo-soprano"
          defaultValue={aluno?.classificacao_vocal ?? ""}
          className={estiloCampo}
        />
        <datalist id="sugestoes-classificacao">
          {SUGESTOES_CLASSIFICACAO.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </label>

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
