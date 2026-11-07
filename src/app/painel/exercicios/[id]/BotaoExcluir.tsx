"use client";

import { useState, useTransition } from "react";
import { excluirExercicio } from "../actions";
import { botaoPerigo } from "@/components/ui";

export default function BotaoExcluir({ id, titulo }: { id: string; titulo: string }) {
  const [pendente, iniciar] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function excluir() {
    if (!window.confirm(`Excluir o exercício “${titulo}” e os áudios dele? Isso não pode ser desfeito.`)) return;
    setErro(null);
    iniciar(async () => {
      const r = await excluirExercicio(id);
      if (r?.erro) setErro(r.erro);
    });
  }

  return (
    <div className="space-y-2">
      <button onClick={excluir} disabled={pendente} className={botaoPerigo}>
        {pendente ? "Excluindo…" : "Excluir exercício"}
      </button>
      {erro && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {erro}
        </p>
      )}
    </div>
  );
}
