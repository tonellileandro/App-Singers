import Link from "next/link";
import { notFound } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/server";
import type { Exercicio } from "@/lib/matriz";
import type { RegiaoVocal } from "@/lib/alunos";
import FormExercicio from "../FormExercicio";
import Audios from "./Audios";
import BotaoExcluir from "./BotaoExcluir";
import { atualizarExercicio } from "../actions";
import { cartao } from "@/components/ui";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ criado?: string }>;
};

export default async function PaginaExercicio({ params, searchParams }: Props) {
  const { id } = await params;
  const { criado } = await searchParams;
  const supabase = await criarClienteServidor();

  const { data } = await supabase.from("exercicios").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const exercicio = data as Exercicio;

  const { data: audios } = await supabase
    .from("audios_exercicio")
    .select("regiao, caminho_storage")
    .eq("exercicio_id", id);

  // Links temporários (1 hora) só para ouvir aqui no painel.
  const urls: Partial<Record<RegiaoVocal, string>> = {};
  if (audios?.length) {
    const { data: assinados } = await supabase.storage
      .from("audios")
      .createSignedUrls(audios.map((a) => a.caminho_storage), 3600);
    audios.forEach((a, i) => {
      const url = assinados?.[i]?.signedUrl;
      if (url) urls[a.regiao as RegiaoVocal] = url;
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link href="/painel/exercicios" className="text-sm text-stone-500 hover:text-stone-800">
        ← Voltar para a biblioteca
      </Link>
      <h1 className="text-2xl font-semibold">{exercicio.titulo}</h1>

      {criado && (
        <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
          ✓ Exercício criado! Agora envie os áudios de piano abaixo (pode ser depois também).
        </p>
      )}

      <section className={`${cartao} space-y-3`}>
        <h2 className="text-lg font-semibold">Áudios de piano</h2>
        <p className="text-sm text-stone-600">
          Cada aluno ouve automaticamente o áudio da região vocal dele. Formatos: MP3 ou WAV.
        </p>
        <Audios exercicioId={exercicio.id} urls={urls} />
      </section>

      <section className={cartao}>
        <h2 className="mb-4 text-lg font-semibold">Dados do exercício</h2>
        <FormExercicio
          acao={atualizarExercicio.bind(null, exercicio.id)}
          exercicio={exercicio}
          textoBotao="Salvar alterações"
        />
      </section>

      <section className={`${cartao} space-y-2`}>
        <h2 className="text-lg font-semibold">Excluir</h2>
        <BotaoExcluir id={exercicio.id} titulo={exercicio.titulo} />
      </section>
    </div>
  );
}
