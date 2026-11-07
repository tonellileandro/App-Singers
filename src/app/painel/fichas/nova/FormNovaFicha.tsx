"use client";

import { useActionState } from "react";
import { criarFicha } from "../actions";
import { botaoPrimario, estiloCampo, estiloRotulo } from "@/components/ui";

type Props = {
  alunos: { id: string; nome: string }[];
  alunoInicial?: string;
  hoje: string;
  tituloPadrao: string;
};

export default function FormNovaFicha({ alunos, alunoInicial, hoje, tituloPadrao }: Props) {
  const [estado, enviar, enviando] = useActionState(criarFicha, undefined);
  return (
    <form action={enviar} className="space-y-5">
      <label className="block">
        <span className={estiloRotulo}>Aluno *</span>
        <select name="aluno_id" required defaultValue={alunoInicial ?? ""} className={estiloCampo}>
          <option value="" disabled>
            Escolha…
          </option>
          {alunos.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nome}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className={estiloRotulo}>Título *</span>
        <input name="titulo" required defaultValue={tituloPadrao} className={estiloCampo} />
      </label>
      <label className="block">
        <span className={estiloRotulo}>Data *</span>
        <input type="date" name="data" required defaultValue={hoje} className={estiloCampo} />
      </label>
      <label className="block">
        <span className={estiloRotulo}>Recado para o aluno</span>
        <span className="block text-xs text-stone-500">Aparece no topo da ficha. Opcional.</span>
        <textarea name="observacoes" rows={3} className={estiloCampo} />
      </label>
      {estado?.erro && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {estado.erro}
        </p>
      )}
      <button type="submit" disabled={enviando} className={botaoPrimario}>
        {enviando ? "Criando…" : "Criar e escolher exercícios →"}
      </button>
    </form>
  );
}
