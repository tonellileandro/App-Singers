import Link from "next/link";
import { notFound } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/server";
import type { Aluno } from "@/lib/alunos";
import FormAluno from "../FormAluno";
import AcoesAluno from "./AcoesAluno";
import { atualizarAluno } from "../actions";
import { botaoSecundario, cartao } from "@/components/ui";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ salvo?: string; anamnese?: string }>;
};

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

export default async function PaginaAluno({ params, searchParams }: Props) {
  const { id } = await params;
  const { salvo, anamnese: anamneseSalva } = await searchParams;

  const supabase = await criarClienteServidor();
  const { data: aluno } = await supabase.from("alunos").select("*").eq("id", id).maybeSingle();
  if (!aluno) notFound();
  const a = aluno as Aluno;

  const { data: anamnese } = await supabase
    .from("anamneses")
    .select("consentimento_em, criado_em")
    .eq("aluno_id", id)
    .order("criado_em", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href="/painel/alunos" className="text-sm text-stone-500 hover:text-stone-800">
        ← Voltar para alunos
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold">{a.nome}</h1>
        {!a.ativo && (
          <span className="rounded-full bg-stone-200 px-2.5 py-0.5 text-xs font-medium text-stone-700">
            Inativo
          </span>
        )}
      </div>

      {salvo && (
        <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
          ✓ Aluno cadastrado! Agora você pode preencher a anamnese.
        </p>
      )}
      {anamneseSalva && (
        <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
          ✓ Anamnese salva.
        </p>
      )}

      <section className={`${cartao} space-y-3`}>
        <h2 className="text-lg font-semibold">Anamnese</h2>
        {anamnese ? (
          <p className="text-sm text-stone-600">
            Preenchida. Consentimento registrado em {formatarData(anamnese.consentimento_em)}.
          </p>
        ) : (
          <p className="text-sm text-amber-700">Ainda não preenchida.</p>
        )}
        <Link href={`/painel/alunos/${a.id}/anamnese`} className={botaoSecundario}>
          {anamnese ? "Ver / editar anamnese" : "Preencher anamnese"}
        </Link>
        <p className="text-xs text-stone-500">
          🔒 A anamnese é confidencial: aparece só aqui no painel, nunca na ficha nem no link do aluno.
        </p>
      </section>

      <section className={cartao}>
        <h2 className="mb-4 text-lg font-semibold">Dados do aluno</h2>
        <FormAluno acao={atualizarAluno.bind(null, a.id)} aluno={a} textoBotao="Salvar alterações" />
      </section>

      <section className={`${cartao} space-y-3`}>
        <h2 className="text-lg font-semibold">Situação</h2>
        <AcoesAluno id={a.id} nome={a.nome} ativo={a.ativo} />
      </section>
    </div>
  );
}
