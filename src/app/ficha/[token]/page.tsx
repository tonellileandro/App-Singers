import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { criarClienteAdmin } from "@/lib/supabase/admin";
import { escolherRegiao, formatarDataCurta } from "@/lib/fichas";
import type { RegiaoVocal } from "@/lib/alunos";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Minha ficha de treino — Singers House",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ f?: string }>;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function Moldura({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-lilas-50">
      <header className="border-b-4 border-amarelo-300 bg-lilas-600 px-4 py-4 text-white">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <Image src="/logo.png" alt="" width={48} height={48} className="rounded-full" priority />
          <div>
            <p className="font-semibold tracking-wide">SINGERS HOUSE</p>
            <p className="text-xs text-white/80">escola de voz e música</p>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-2xl space-y-4 px-4 py-6">{children}</main>
    </div>
  );
}

function Aviso({ texto }: { texto: string }) {
  return (
    <Moldura>
      <p className="rounded-2xl bg-white p-8 text-center text-stone-600 shadow-sm">{texto}</p>
    </Moldura>
  );
}

export default async function FichaPublica({ params, searchParams }: Props) {
  const { token } = await params;
  const { f } = await searchParams;
  if (!UUID.test(token)) notFound();

  const supabase = criarClienteAdmin();
  if (!supabase) return <Aviso texto="Esta página ainda está sendo configurada. Tente mais tarde." />;

  // Só os campos necessários — nunca a anamnese nem contato.
  const { data: aluno } = await supabase
    .from("alunos")
    .select("id, nome, regiao_vocal, ativo")
    .eq("token_publico", token)
    .maybeSingle();
  if (!aluno) notFound();
  if (!aluno.ativo) return <Aviso texto="Esta ficha não está mais disponível. Fale com sua professora." />;

  const { data: fichas } = await supabase
    .from("fichas")
    .select("id, titulo, data, observacoes")
    .eq("aluno_id", aluno.id)
    .order("data", { ascending: false })
    .order("criado_em", { ascending: false });

  if (!fichas?.length)
    return <Aviso texto={`Olá, ${aluno.nome.split(" ")[0]}! Sua ficha de treino ainda está sendo preparada. 🎵`} />;

  const ficha = fichas.find((x) => x.id === f) ?? fichas[0];

  const { data: itens } = await supabase
    .from("ficha_itens")
    .select("id, observacao, exercicios(titulo, instrucoes, audios_exercicio(regiao, caminho_storage))")
    .eq("ficha_id", ficha.id)
    .order("ordem");

  type Item = {
    id: string;
    observacao: string | null;
    exercicios: {
      titulo: string;
      instrucoes: string | null;
      audios_exercicio: { regiao: string; caminho_storage: string }[];
    } | null;
  };
  const lista = ((itens ?? []) as unknown as Item[]).filter((i) => i.exercicios);

  // Escolhe o áudio certo para a região vocal do aluno e gera links temporários.
  const caminhos = lista.map((i) => {
    const audios = i.exercicios!.audios_exercicio ?? [];
    const r = escolherRegiao(aluno.regiao_vocal as RegiaoVocal, audios.map((a) => a.regiao));
    return audios.find((a) => a.regiao === r)?.caminho_storage ?? null;
  });
  const validos = caminhos.filter((c): c is string => !!c);
  const urls = new Map<string, string>();
  if (validos.length) {
    const { data: assinados } = await supabase.storage.from("audios").createSignedUrls(validos, 60 * 60 * 12);
    assinados?.forEach((a, i) => a.signedUrl && urls.set(validos[i], a.signedUrl));
  }

  const anteriores = fichas.filter((x) => x.id !== ficha.id);

  return (
    <Moldura>
      <section className="space-y-1">
        <p className="text-lilas-700">Olá, {aluno.nome.split(" ")[0]}! 👋</p>
        <h1 className="text-2xl font-semibold text-stone-900">{ficha.titulo}</h1>
        <p className="text-sm text-stone-500">{formatarDataCurta(ficha.data)}</p>
      </section>

      {ficha.observacoes && (
        <p className="whitespace-pre-line rounded-2xl border-l-4 border-amarelo-400 bg-amarelo-50 p-4 text-stone-800">
          {ficha.observacoes}
        </p>
      )}

      {lista.length === 0 && (
        <p className="rounded-2xl bg-white p-8 text-center text-stone-600 shadow-sm">
          Os exercícios desta ficha ainda vão ser adicionados. 🎵
        </p>
      )}

      <ol className="space-y-4">
        {lista.map((item, i) => {
          const url = caminhos[i] ? urls.get(caminhos[i]!) : undefined;
          return (
            <li key={item.id} className="space-y-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-lilas-100">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amarelo-300 font-bold text-lilas-900">
                  {i + 1}
                </span>
                <h2 className="pt-0.5 text-lg font-semibold text-lilas-800">{item.exercicios!.titulo}</h2>
              </div>
              {item.exercicios!.instrucoes && (
                <p className="whitespace-pre-line text-stone-700">{item.exercicios!.instrucoes}</p>
              )}
              {item.observacao && (
                <p className="rounded-lg bg-lilas-50 px-3 py-2 text-sm text-lilas-900">
                  <strong>Para você:</strong> {item.observacao}
                </p>
              )}
              {url && <audio controls preload="metadata" src={url} className="w-full" />}
            </li>
          );
        })}
      </ol>

      {anteriores.length > 0 && (
        <section className="space-y-2 pt-4">
          <h2 className="text-sm font-semibold text-stone-600">
            {ficha.id === fichas[0].id ? "Fichas anteriores" : "Outras fichas"}
          </h2>
          <ul className="space-y-1">
            {anteriores.map((x) => (
              <li key={x.id}>
                <Link
                  href={x.id === fichas[0].id ? `/ficha/${token}` : `/ficha/${token}?f=${x.id}`}
                  className="text-sm text-lilas-700 underline"
                >
                  {x.titulo} ({formatarDataCurta(x.data)})
                  {x.id === fichas[0].id ? " — atual" : ""}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="pt-6 text-center text-xs text-stone-400">Bons estudos! 🎶 Singers House</p>
    </Moldura>
  );
}
