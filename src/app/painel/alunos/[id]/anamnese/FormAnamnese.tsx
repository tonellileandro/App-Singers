"use client";

import { useActionState } from "react";
import { PERGUNTAS_ANAMNESE } from "@/lib/anamnese";
import type { EstadoFormulario } from "../../actions";
import { botaoPrimario, estiloCampo, estiloRotulo } from "@/components/ui";

type Props = {
  acao: (estado: EstadoFormulario, form: FormData) => Promise<EstadoFormulario>;
  respostas: Record<string, string>;
  textoConsentimento: string;
  jaConsentiu: boolean;
};

export default function FormAnamnese({ acao, respostas, textoConsentimento, jaConsentiu }: Props) {
  const [estado, enviar, enviando] = useActionState(acao, undefined);

  return (
    <form action={enviar} className="space-y-5">
      {PERGUNTAS_ANAMNESE.map((p) => (
        <label key={p.chave} className="block">
          <span className={estiloRotulo}>{p.texto}</span>
          {p.ajuda && <span className="block text-xs text-stone-500">{p.ajuda}</span>}
          {p.tipo === "longa" ? (
            <textarea
              name={`r_${p.chave}`}
              rows={2}
              defaultValue={respostas[p.chave] ?? ""}
              className={estiloCampo}
            />
          ) : (
            <input name={`r_${p.chave}`} defaultValue={respostas[p.chave] ?? ""} className={estiloCampo} />
          )}
        </label>
      ))}

      <fieldset className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <legend className="px-1 text-sm font-semibold text-amber-900">Termo de consentimento (LGPD)</legend>
        <label className="block">
          <span className="text-xs text-amber-900">
            Texto que o aluno leu e aceitou (pode ajustar se quiser):
          </span>
          <textarea
            name="consentimento_texto"
            rows={5}
            defaultValue={textoConsentimento}
            className={estiloCampo}
          />
        </label>
        <label className="flex items-start gap-2 text-sm text-amber-950">
          <input type="checkbox" name="consentiu" defaultChecked={jaConsentiu} className="mt-1" />
          O aluno leu e concordou com o termo acima.
        </label>
      </fieldset>

      {estado?.erro && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {estado.erro}
        </p>
      )}

      <button type="submit" disabled={enviando} className={botaoPrimario}>
        {enviando ? "Salvando…" : "Salvar anamnese"}
      </button>
    </form>
  );
}
