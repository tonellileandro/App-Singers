"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { criarClienteNavegador } from "@/lib/supabase/client";
import { NOMES_REGIAO, type RegiaoVocal } from "@/lib/alunos";
import { EXTENSOES_AUDIO, TAMANHO_AVISO_MB, TAMANHO_MAXIMO_MB } from "@/lib/matriz";
import { registrarAudio, removerAudio } from "../actions";
import { botaoSecundario } from "@/components/ui";

type Props = {
  exercicioId: string;
  urls: Partial<Record<RegiaoVocal, string>>; // links temporários para ouvir no painel
};

const REGIOES: RegiaoVocal[] = ["grave", "medio", "agudo"];

function SlotAudio({ exercicioId, regiao, url }: { exercicioId: string; regiao: RegiaoVocal; url?: string }) {
  const router = useRouter();
  const entrada = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"livre" | "enviando" | "removendo">("livre");
  const [mensagem, setMensagem] = useState<{ tipo: "erro" | "aviso" | "ok"; texto: string } | null>(null);

  async function enviar(arquivo: File) {
    setMensagem(null);
    const extensao = arquivo.name.slice(arquivo.name.lastIndexOf(".")).toLowerCase();
    if (!EXTENSOES_AUDIO.includes(extensao)) {
      setMensagem({ tipo: "erro", texto: "Use um arquivo MP3 ou WAV." });
      return;
    }
    const mb = arquivo.size / (1024 * 1024);
    if (mb > TAMANHO_MAXIMO_MB) {
      setMensagem({
        tipo: "erro",
        texto: `Arquivo muito grande (${mb.toFixed(0)} MB). O máximo é ${TAMANHO_MAXIMO_MB} MB. Dica: exporte em MP3, que fica bem menor.`,
      });
      return;
    }

    setStatus("enviando");
    const caminho = `exercicios/${exercicioId}/${regiao}-${Date.now()}${extensao}`;
    const supabase = criarClienteNavegador();
    const { error } = await supabase.storage.from("audios").upload(caminho, arquivo, {
      contentType: extensao === ".mp3" ? "audio/mpeg" : "audio/wav",
    });
    if (error) {
      setStatus("livre");
      setMensagem({ tipo: "erro", texto: "Não foi possível enviar o arquivo. Verifique sua internet e tente de novo." });
      return;
    }
    const r = await registrarAudio(exercicioId, regiao, caminho);
    setStatus("livre");
    if (r.erro) {
      setMensagem({ tipo: "erro", texto: r.erro });
      return;
    }
    setMensagem(
      mb > TAMANHO_AVISO_MB
        ? {
            tipo: "aviso",
            texto: `Enviado! Mas o arquivo é grande (${mb.toFixed(0)} MB) e pode demorar para carregar no celular do aluno. Se puder, use MP3.`,
          }
        : { tipo: "ok", texto: "Áudio enviado." }
    );
    router.refresh();
  }

  async function remover() {
    if (!window.confirm(`Remover o áudio ${NOMES_REGIAO[regiao].toLowerCase()} deste exercício?`)) return;
    setStatus("removendo");
    const r = await removerAudio(exercicioId, regiao);
    setStatus("livre");
    setMensagem(r.erro ? { tipo: "erro", texto: r.erro } : null);
    router.refresh();
  }

  const ocupado = status !== "livre";

  return (
    <div className="space-y-2 rounded-xl border border-stone-200 p-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-lilas-800">{NOMES_REGIAO[regiao]}</p>
        {!url && <span className="text-xs text-amber-700">Sem áudio</span>}
      </div>

      {url && <audio controls preload="none" src={url} className="w-full" />}

      <input
        ref={entrada}
        type="file"
        accept=".mp3,.wav,audio/mpeg,audio/wav"
        className="hidden"
        onChange={(e) => {
          const arquivo = e.target.files?.[0];
          e.target.value = "";
          if (arquivo) enviar(arquivo);
        }}
      />
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={ocupado} onClick={() => entrada.current?.click()} className={botaoSecundario}>
          {status === "enviando" ? "Enviando… aguarde" : url ? "Trocar áudio" : "Enviar áudio"}
        </button>
        {url && (
          <button
            type="button"
            disabled={ocupado}
            onClick={remover}
            className="text-sm text-red-700 underline disabled:opacity-60"
          >
            {status === "removendo" ? "Removendo…" : "Remover"}
          </button>
        )}
      </div>

      {mensagem && (
        <p
          role={mensagem.tipo === "erro" ? "alert" : "status"}
          className={`rounded-lg px-3 py-2 text-sm ${
            mensagem.tipo === "erro"
              ? "bg-red-50 text-red-700"
              : mensagem.tipo === "aviso"
                ? "bg-amarelo-100 text-stone-800"
                : "bg-green-50 text-green-800"
          }`}
        >
          {mensagem.texto}
        </p>
      )}
    </div>
  );
}

export default function Audios({ exercicioId, urls }: Props) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {REGIOES.map((r) => (
        <SlotAudio key={r} exercicioId={exercicioId} regiao={r} url={urls[r]} />
      ))}
    </div>
  );
}
