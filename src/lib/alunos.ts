export type RegiaoVocal = "grave" | "medio" | "agudo";

export type Aluno = {
  id: string;
  nome: string;
  contato: string | null;
  grupo: 1 | 2;
  regiao_vocal: RegiaoVocal;
  classificacao_vocal: string | null;
  token_publico: string;
  ativo: boolean;
  criado_em: string;
};

export const NOMES_GRUPO: Record<number, string> = {
  1: "Grupo 1 — Iniciantes",
  2: "Grupo 2 — Técnica vocal",
};

export const NOMES_REGIAO: Record<RegiaoVocal, string> = {
  grave: "Grave",
  medio: "Médio",
  agudo: "Agudo",
};

export const SUGESTOES_CLASSIFICACAO = [
  "Soprano",
  "Mezzo-soprano",
  "Contralto",
  "Contratenor",
  "Tenor",
  "Barítono",
  "Baixo",
  "Ainda não definida",
];
