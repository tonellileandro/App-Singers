"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/server";
import { PERGUNTAS_ANAMNESE } from "@/lib/anamnese";

export type EstadoFormulario = { erro?: string; sucesso?: string } | undefined;

const MSG_ERRO_GERAL =
  "Não foi possível salvar agora. Verifique sua internet e tente de novo. Se continuar, avise o suporte.";

function lerDadosAluno(form: FormData) {
  const nome = String(form.get("nome") ?? "").trim();
  const contato = String(form.get("contato") ?? "").trim();
  const grupo = Number(form.get("grupo"));
  const regiao_vocal = String(form.get("regiao_vocal") ?? "");
  const classificacao_vocal = String(form.get("classificacao_vocal") ?? "").trim();

  if (!nome) return { erro: "Preencha o nome do aluno." };
  if (grupo !== 1 && grupo !== 2) return { erro: "Escolha o grupo do aluno." };
  if (!["grave", "medio", "agudo"].includes(regiao_vocal))
    return { erro: "Escolha a região vocal (grave, médio ou agudo)." };

  return {
    dados: {
      nome,
      contato: contato || null,
      grupo,
      regiao_vocal,
      classificacao_vocal: classificacao_vocal || null,
    },
  };
}

export async function criarAluno(_: EstadoFormulario, form: FormData): Promise<EstadoFormulario> {
  const lido = lerDadosAluno(form);
  if (!lido.dados) return { erro: lido.erro };

  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.from("alunos").insert(lido.dados).select("id").single();
  if (error || !data) {
    console.error(error);
    return { erro: MSG_ERRO_GERAL };
  }
  revalidatePath("/painel", "layout");
  redirect(`/painel/alunos/${data.id}?salvo=1`);
}

export async function atualizarAluno(
  id: string,
  _: EstadoFormulario,
  form: FormData
): Promise<EstadoFormulario> {
  const lido = lerDadosAluno(form);
  if (!lido.dados) return { erro: lido.erro };

  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("alunos").update(lido.dados).eq("id", id);
  if (error) {
    console.error(error);
    return { erro: MSG_ERRO_GERAL };
  }
  revalidatePath("/painel", "layout");
  return { sucesso: "Alterações salvas." };
}

export async function alternarAtivo(id: string, ativo: boolean) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("alunos").update({ ativo }).eq("id", id);
  if (error) throw new Error(MSG_ERRO_GERAL);
  revalidatePath("/painel", "layout");
}

export async function excluirAluno(id: string) {
  const supabase = await criarClienteServidor();
  // Apaga também anamnese, avaliações e fichas do aluno (exclusão em cascata).
  const { error } = await supabase.from("alunos").delete().eq("id", id);
  if (error) {
    console.error(error);
    throw new Error(MSG_ERRO_GERAL);
  }
  revalidatePath("/painel", "layout");
  redirect("/painel/alunos?excluido=1");
}

export async function salvarAnamnese(
  alunoId: string,
  _: EstadoFormulario,
  form: FormData
): Promise<EstadoFormulario> {
  const consentiu = form.get("consentiu") === "on";
  const consentimento_texto = String(form.get("consentimento_texto") ?? "").trim();
  if (!consentiu)
    return {
      erro: "Para guardar a anamnese, o aluno precisa concordar com o termo de consentimento (marque a caixa no final).",
    };
  if (!consentimento_texto) return { erro: "O texto do termo de consentimento não pode ficar vazio." };

  const respostas: Record<string, string> = {};
  for (const p of PERGUNTAS_ANAMNESE) {
    const valor = String(form.get(`r_${p.chave}`) ?? "").trim();
    if (valor) respostas[p.chave] = valor;
  }

  const supabase = await criarClienteServidor();
  const { data: existente } = await supabase
    .from("anamneses")
    .select("id, consentimento_texto, consentimento_em")
    .eq("aluno_id", alunoId)
    .order("criado_em", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Se o texto do termo mudou, registra um novo consentimento com a data de hoje.
  const consentimento_em =
    existente && existente.consentimento_texto === consentimento_texto
      ? existente.consentimento_em
      : new Date().toISOString();

  const { error } = existente
    ? await supabase
        .from("anamneses")
        .update({ respostas, consentimento_texto, consentimento_em })
        .eq("id", existente.id)
    : await supabase
        .from("anamneses")
        .insert({ aluno_id: alunoId, respostas, consentimento_texto, consentimento_em });

  if (error) {
    console.error(error);
    return { erro: MSG_ERRO_GERAL };
  }
  revalidatePath(`/painel/alunos/${alunoId}`, "layout");
  redirect(`/painel/alunos/${alunoId}?anamnese=1`);
}
