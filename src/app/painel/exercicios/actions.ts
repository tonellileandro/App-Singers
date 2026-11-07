"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/server";
import { PILAR_DA_TAG, NOME_TAG, type PilarId } from "@/lib/matriz";
import type { RegiaoVocal } from "@/lib/alunos";

export type EstadoFormulario = { erro?: string; sucesso?: string } | undefined;

const MSG_ERRO_GERAL =
  "Não foi possível salvar agora. Verifique sua internet e tente de novo.";
const PILARES_VALIDOS: PilarId[] = ["respiracao", "fonacao", "articulacao"];
const REGIOES: RegiaoVocal[] = ["grave", "medio", "agudo"];

function lerDadosExercicio(form: FormData) {
  const titulo = String(form.get("titulo") ?? "").trim();
  const instrucoes = String(form.get("instrucoes") ?? "").trim();
  const grupoTexto = String(form.get("grupo_alvo") ?? "");
  const tags = [...new Set(form.getAll("tags").map(String))].filter((t) => t in NOME_TAG);
  const pilaresMarcados = form.getAll("pilares").map(String) as PilarId[];

  if (!titulo) return { erro: "Dê um título ao exercício." };

  // Marcar uma tag já marca o pilar dela.
  const pilares = new Set<PilarId>(pilaresMarcados.filter((p) => PILARES_VALIDOS.includes(p)));
  for (const t of tags) if (PILAR_DA_TAG[t]) pilares.add(PILAR_DA_TAG[t]);

  return {
    dados: {
      titulo,
      instrucoes: instrucoes || null,
      grupo_alvo: grupoTexto === "1" ? 1 : grupoTexto === "2" ? 2 : null,
      tags,
      pilares: PILARES_VALIDOS.filter((p) => pilares.has(p)),
    },
  };
}

export async function criarExercicio(_: EstadoFormulario, form: FormData): Promise<EstadoFormulario> {
  const lido = lerDadosExercicio(form);
  if (!lido.dados) return { erro: lido.erro };
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.from("exercicios").insert(lido.dados).select("id").single();
  if (error || !data) {
    console.error(error);
    return { erro: MSG_ERRO_GERAL };
  }
  revalidatePath("/painel/exercicios");
  redirect(`/painel/exercicios/${data.id}?criado=1`);
}

export async function atualizarExercicio(
  id: string,
  _: EstadoFormulario,
  form: FormData
): Promise<EstadoFormulario> {
  const lido = lerDadosExercicio(form);
  if (!lido.dados) return { erro: lido.erro };
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("exercicios").update(lido.dados).eq("id", id);
  if (error) {
    console.error(error);
    return { erro: MSG_ERRO_GERAL };
  }
  revalidatePath("/painel/exercicios", "layout");
  return { sucesso: "Alterações salvas." };
}

export async function excluirExercicio(id: string): Promise<{ erro?: string }> {
  const supabase = await criarClienteServidor();
  const { data: audios } = await supabase
    .from("audios_exercicio")
    .select("caminho_storage")
    .eq("exercicio_id", id);

  const { error } = await supabase.from("exercicios").delete().eq("id", id);
  if (error) {
    if (error.code === "23503")
      return {
        erro: "Este exercício está em uma ou mais fichas de alunos. Tire-o das fichas antes de excluir.",
      };
    console.error(error);
    return { erro: "Não foi possível excluir agora. Tente de novo." };
  }
  const caminhos = (audios ?? []).map((a) => a.caminho_storage);
  if (caminhos.length) await supabase.storage.from("audios").remove(caminhos);

  revalidatePath("/painel/exercicios");
  redirect("/painel/exercicios?excluido=1");
}

/** Chamado depois que o navegador já enviou o arquivo para o Storage. */
export async function registrarAudio(
  exercicioId: string,
  regiao: RegiaoVocal,
  caminho: string
): Promise<{ erro?: string }> {
  if (!REGIOES.includes(regiao) || !caminho.startsWith(`exercicios/${exercicioId}/`))
    return { erro: "Dados do áudio inválidos." };

  const supabase = await criarClienteServidor();
  const { data: anterior } = await supabase
    .from("audios_exercicio")
    .select("caminho_storage")
    .eq("exercicio_id", exercicioId)
    .eq("regiao", regiao)
    .maybeSingle();

  const { error } = await supabase
    .from("audios_exercicio")
    .upsert(
      { exercicio_id: exercicioId, regiao, caminho_storage: caminho },
      { onConflict: "exercicio_id,regiao" }
    );
  if (error) {
    console.error(error);
    await supabase.storage.from("audios").remove([caminho]);
    return { erro: "O arquivo foi enviado, mas não consegui registrá-lo. Tente de novo." };
  }
  if (anterior && anterior.caminho_storage !== caminho)
    await supabase.storage.from("audios").remove([anterior.caminho_storage]);

  revalidatePath(`/painel/exercicios/${exercicioId}`);
  revalidatePath("/painel/exercicios");
  return {};
}

export async function removerAudio(exercicioId: string, regiao: RegiaoVocal): Promise<{ erro?: string }> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("audios_exercicio")
    .select("id, caminho_storage")
    .eq("exercicio_id", exercicioId)
    .eq("regiao", regiao)
    .maybeSingle();
  if (!data) return {};
  const { error } = await supabase.from("audios_exercicio").delete().eq("id", data.id);
  if (error) return { erro: "Não foi possível remover agora. Tente de novo." };
  await supabase.storage.from("audios").remove([data.caminho_storage]);
  revalidatePath(`/painel/exercicios/${exercicioId}`);
  revalidatePath("/painel/exercicios");
  return {};
}
