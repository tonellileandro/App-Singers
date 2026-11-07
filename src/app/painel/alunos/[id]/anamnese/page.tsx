import Link from "next/link";
import { notFound } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/server";
import { TEXTO_CONSENTIMENTO_PADRAO } from "@/lib/anamnese";
import FormAnamnese from "./FormAnamnese";
import { salvarAnamnese } from "../../actions";
import { cartao } from "@/components/ui";

type Props = { params: Promise<{ id: string }> };

export default async function PaginaAnamnese({ params }: Props) {
  const { id } = await params;
  const supabase = await criarClienteServidor();

  const { data: aluno } = await supabase.from("alunos").select("id, nome").eq("id", id).maybeSingle();
  if (!aluno) notFound();

  const { data: anamnese } = await supabase
    .from("anamneses")
    .select("respostas, consentimento_texto, consentimento_em")
    .eq("aluno_id", id)
    .order("criado_em", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href={`/painel/alunos/${id}`} className="text-sm text-stone-500 hover:text-stone-800">
        ← Voltar para {aluno.nome}
      </Link>
      <h1 className="text-2xl font-semibold">Anamnese — {aluno.nome}</h1>
      <p className="text-sm text-stone-600">
        🔒 Informações confidenciais. Ficam só no painel e nunca aparecem na ficha do aluno.
        Responda só o que for relevante; nenhuma pergunta é obrigatória.
      </p>
      <div className={cartao}>
        <FormAnamnese
          acao={salvarAnamnese.bind(null, id)}
          respostas={(anamnese?.respostas as Record<string, string>) ?? {}}
          textoConsentimento={anamnese?.consentimento_texto ?? TEXTO_CONSENTIMENTO_PADRAO}
          jaConsentiu={!!anamnese}
        />
      </div>
    </div>
  );
}
