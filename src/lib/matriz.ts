// Matriz pedagógica: pilares, tags e interseções do Diagrama de Venn.
// Os ids (ex.: "registro-m2") são o que fica gravado no banco — não mude ids já usados.

export type PilarId = "respiracao" | "fonacao" | "articulacao";
export type Tag = { id: string; nome: string };
export type GrupoTags = { nome?: string; prefixo?: string; tags: Tag[] };
export type Pilar = { id: PilarId; nome: string; descricao: string; grupos: GrupoTags[] };

export const PILARES: Pilar[] = [
  {
    id: "respiracao",
    nome: "Respiração",
    descricao: "Controle e fluxo aéreo",
    grupos: [
      {
        tags: [
          { id: "consciencia-corporal", nome: "Consciência corporal" },
          { id: "resistencia", nome: "Resistência" },
          { id: "forca", nome: "Força" },
        ],
      },
    ],
  },
  {
    id: "fonacao",
    nome: "Fonação",
    descricao: "Ajuste de fonte vocal",
    grupos: [
      {
        nome: "Firmeza glótica",
        prefixo: "Firmeza:",
        tags: [
          { id: "firmeza-fortalecer", nome: "Fortalecer" },
          { id: "firmeza-suavizar", nome: "Suavizar" },
        ],
      },
      {
        nome: "Registros",
        prefixo: "Registro",
        tags: [
          { id: "registro-m1", nome: "M1" },
          { id: "registro-m2", nome: "M2" },
          { id: "registro-mix", nome: "Mix" },
        ],
      },
      {
        nome: "Modos de fonação",
        prefixo: "Modo",
        tags: [
          { id: "modo-soproso", nome: "Soproso" },
          { id: "modo-fluido", nome: "Fluido" },
          { id: "modo-neutro", nome: "Neutro" },
          { id: "modo-firme", nome: "Firme" },
        ],
      },
    ],
  },
  {
    id: "articulacao",
    nome: "Articulação",
    descricao: "Filtro e acústica vocal",
    grupos: [
      {
        tags: [
          { id: "consoantes", nome: "Consoantes (dicção)" },
          { id: "vogais-horizontais", nome: "Vogais horizontais" },
          { id: "vogais-verticais", nome: "Vogais verticais" },
          { id: "ressonancia", nome: "Ressonância" },
        ],
      },
    ],
  },
];

// Tags do Grupo 1 (iniciantes) — não pertencem aos pilares do Venn.
export const TAGS_INICIANTES: Tag[] = [
  { id: "afinacao", nome: "Afinação" },
  { id: "ritmo", nome: "Ritmo" },
];

export const NOME_PILAR: Record<PilarId, string> = Object.fromEntries(
  PILARES.map((p) => [p.id, p.nome])
) as Record<PilarId, string>;

export const PILAR_DA_TAG: Record<string, PilarId> = Object.fromEntries(
  PILARES.flatMap((p) => p.grupos.flatMap((g) => g.tags.map((t) => [t.id, p.id])))
);

export const NOME_TAG: Record<string, string> = Object.fromEntries([
  ...TAGS_INICIANTES.map((t) => [t.id, t.nome]),
  ...PILARES.flatMap((p) =>
    p.grupos.flatMap((g) => g.tags.map((t) => [t.id, g.prefixo ? g.prefixo === "Registro" ? `${g.prefixo} ${t.nome}` : `${g.prefixo} ${t.nome.toLowerCase()}` : t.nome]))
  ),
]);

export type InterseccaoId = "fonte-filtro" | "etvso" | "respiracao-fonacao" | "centro";

export const INTERSECCOES: { id: InterseccaoId; nome: string; explicacao: string }[] = [
  { id: "fonte-filtro", nome: "Ajuste fonte-filtro", explicacao: "Articulação + Fonação" },
  { id: "etvso", nome: "ETVSO", explicacao: "Articulação + Respiração" },
  { id: "respiracao-fonacao", nome: "Respiração + Fonação", explicacao: "Respiração + Fonação" },
  { id: "centro", nome: "Centro — alta performance", explicacao: "Os três pilares" },
];

/** Descobre em qual região do Venn o exercício está, a partir dos pilares marcados. */
export function interseccaoDe(pilares: string[]): InterseccaoId | null {
  const r = pilares.includes("respiracao");
  const f = pilares.includes("fonacao");
  const a = pilares.includes("articulacao");
  if (r && f && a) return "centro";
  if (a && f) return "fonte-filtro";
  if (a && r) return "etvso";
  if (r && f) return "respiracao-fonacao";
  return null;
}

export const NOME_INTERSECCAO: Record<InterseccaoId, string> = Object.fromEntries(
  INTERSECCOES.map((i) => [i.id, i.nome])
) as Record<InterseccaoId, string>;

export const NOMES_GRUPO_ALVO: Record<string, string> = {
  "": "Todos os alunos",
  "1": "Grupo 1 — Iniciantes",
  "2": "Grupo 2 — Técnica vocal",
};

export type Exercicio = {
  id: string;
  titulo: string;
  instrucoes: string | null;
  pilares: string[];
  tags: string[];
  grupo_alvo: 1 | 2 | null;
  criado_em: string;
};

// Áudios
export const TAMANHO_MAXIMO_MB = 50; // limite do Supabase configurado no bucket
export const TAMANHO_AVISO_MB = 15; // acima disso, avisamos que pode demorar para o aluno
export const EXTENSOES_AUDIO = [".mp3", ".wav"];
