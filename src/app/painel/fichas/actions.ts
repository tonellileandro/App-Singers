"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/server";
import type { ItemFicha } from "@/lib/fichas";

export type EstadoFormulario = { erro?: string } | undefined;

export async function criarFicha(_: EstadoFormulario, form: FormData): Promise<EstadoFormulario> {
  const aluno_id = String(form.get("aluno_id") ?? "");
  const titulo = String(form.get("titulo") ?? "").trim();
  const data = String(form.get("data") ?? "");
  const observacoes = String(form.get("observacoes") ?? "").trim();
  if (!aluno_id) return { erro: "Escolha o aluno." };
  if (!titulo) return { erro: "Dê um título à ficha." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return { erro: "Escolha a data da ficha." };

  const supabase = await criarClienteServidor();
  const { data: nova, error } = await supabase
    .from("fichas")
    .insert({ aluno_id, titulo, data, observacoes: observacoes || null })
    .select("id")
    .single();
  if (error || !nova) {
    console.error(error);
    return { erro: "Não foi possível criar a ficha. Tente de novo." };
  }
  revalidatePath("/painel", "layout");
  redirect(`/painel/fichas/${nova.id}`);
}

export async function salvarFicha(
  fichaId: string,
  dados: { titulo: string; data: string; observacoes: string; itens: ItemFicha[] }
): Promise<{ erro?: string }> {
  const titulo = dados.titulo.trim();
  if (!titulo) return { erro: "Dê um título à ficha." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dados.data)) return { erro: "Escolha a data da ficha." };

  const supabase = await criarClienteServidor();
  const { error: erroFicha } = await supabase
    .from("fichas")
    .update({ titulo, data: dados.data, observacoes: dados.observacoes.trim() || null })
    .eq("id", fichaId);
  if (erroFicha) {
    console.error(erroFicha);
    return { erro: "Não foi possível salvar. Verifique sua internet e tente de novo." };
  }

  // Regrava a lista de exercícios na ordem atual.
  const { error: erroApagar } = await supabase.from("ficha_itens").delete().eq("ficha_id", fichaId);
  if (erroApagar) {
    console.error(erroApagar);
    return { erro: "Não foi possível salvar os exercícios. Tente de novo." };
  }
  if (dados.itens.length) {
    const { error } = await supabase.from("ficha_itens").insert(
      dados.itens.map((it, i) => ({
        ficha_id: fichaId,
        exercicio_id: it.exercicio_id,
        ordem: i + 1,
        observacao: it.observacao.trim() || null,
      }))
    );
    if (error) {
      console.error(error);
      return {
        erro: "Os dados da ficha foram salvos, mas os exercícios não. Clique em Salvar de novo.",
      };
    }
  }
  revalidatePath("/painel", "layout");
  return {};
}

export async function excluirFicha(fichaId: string): Promise<{ erro?: string }> {
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("fichas").delete().eq("id", fichaId);
  if (error) return { erro: "Não foi possível excluir agora. Tente de novo." };
  revalidatePath("/painel", "layout");
  redirect("/painel/fichas?excluida=1");
}
