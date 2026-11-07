"use client";

import { useState, useTransition } from "react";
import { alternarAtivo, excluirAluno } from "../actions";
import { botaoPerigo, botaoSecundario } from "@/components/ui";

export default function AcoesAluno({ id, nome, ativo }: { id: string; nome: string; ativo: boolean }) {
  const [pendente, iniciar] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function trocarAtivo() {
    setErro(null);
    iniciar(async () => {
      try {
        await alternarAtivo(id, !ativo);
      } catch {
        setErro("Não foi possível alterar agora. Tente de novo.");
      }
    });
  }

  function excluir() {
    const ok = window.confirm(
      `Excluir ${nome} DEFINITIVAMENTE?\n\nIsso apaga também a anamnese, as avaliações e as fichas deste aluno, e não pode ser desfeito.\n\nSe ele só parou as aulas, prefira “Desativar”.`
    );
    if (!ok) return;
    setErro(null);
    iniciar(async () => {
      try {
        await excluirAluno(id);
      } catch (e) {
        // O redirecionamento após excluir também chega aqui: deixamos o Next.js cuidar dele.
        if (e instanceof Error && e.message.includes("NEXT_REDIRECT")) throw e;
        setErro("Não foi possível excluir agora. Tente de novo.");
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button onClick={trocarAtivo} disabled={pendente} className={botaoSecundario}>
          {ativo ? "Desativar aluno" : "Reativar aluno"}
        </button>
        <button onClick={excluir} disabled={pendente} className={botaoPerigo}>
          Excluir definitivamente
        </button>
      </div>
      <p className="text-xs text-stone-500">
        Desativar esconde o aluno da lista, mas guarda tudo. Excluir apaga todos os dados dele
        (use se o aluno pedir a remoção dos dados, conforme a LGPD).
      </p>
      {erro && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {erro}
        </p>
      )}
    </div>
  );
}
