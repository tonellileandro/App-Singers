import Link from "next/link";
import { notFound } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/server";
import type { RegiaoVocal } from "@/lib/alunos";
import EditorFicha, { type ExercicioResumo } from "./EditorFicha";

type Props = { params: Promise<{ id: string }> };

export default async function PaginaFicha({ params }: Props) {
  const { id } = await params;
  const supabase = await criarClienteServidor();

  const { data: ficha } = await supabase
    .from("fichas")
    .select("id, titulo, data, observacoes, alunos(id, nome, grupo, regiao_vocal, token_publico)")
    .eq("id", id)
    .maybeSingle();
  if (!ficha) notFound();
  const aluno = ficha.alunos as unknown as {
    id: string;
    nome: string;
    grupo: 1 | 2;
    regiao_vocal: RegiaoVocal;
    token_publico: string;
  };

  const [{ data: itens }, { data: exercicios }] = await Promise.all([
    supabase.from("ficha_itens").select("exercicio_id, observacao").eq("ficha_id", id).order("ordem"),
    supabase
      .from("exercicios")
      .select("id, titulo, pilares, tags, grupo_alvo, audios_exercicio(regiao)")
      .order("titulo"),
  ]);

  const resumo: ExercicioResumo[] = (exercicios ?? []).map((e) => ({
    id: e.id,
    titulo: e.titulo,
    pilares: e.pilares,
    tags: e.tags,
    grupo_alvo: e.grupo_alvo,
    regioes: (e.audios_exercicio ?? []).map((a: { regiao: string }) => a.regiao),
  }));

  return (
    <div className="space-y-3">
      <Link href={`/painel/alunos/${aluno.id}`} className="text-sm text-stone-500 hover:text-stone-800">
        ← Voltar para {aluno.nome}
      </Link>
      <EditorFicha
        ficha={{
          id: ficha.id,
          titulo: ficha.titulo,
          data: ficha.data,
          observacoes: ficha.observacoes ?? "",
        }}
        aluno={aluno}
        itensIniciais={(itens ?? []).map((i) => ({
          exercicio_id: i.exercicio_id,
          observacao: i.observacao ?? "",
        }))}
        exercicios={resumo}
      />
    </div>
  );
}
