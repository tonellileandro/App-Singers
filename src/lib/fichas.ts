import type { RegiaoVocal } from "./alunos";

export type Ficha = {
  id: string;
  aluno_id: string;
  titulo: string;
  data: string;
  observacoes: string | null;
  criado_em: string;
};

export type ItemFicha = {
  exercicio_id: string;
  observacao: string;
};

// Se não houver gravação na região do aluno, usa a região mais próxima.
const ORDEM_ALTERNATIVA: Record<RegiaoVocal, RegiaoVocal[]> = {
  grave: ["grave", "medio", "agudo"],
  medio: ["medio", "grave", "agudo"],
  agudo: ["agudo", "medio", "grave"],
};

export function escolherRegiao(
  regiaoAluno: RegiaoVocal,
  disponiveis: string[]
): RegiaoVocal | null {
  return ORDEM_ALTERNATIVA[regiaoAluno].find((r) => disponiveis.includes(r)) ?? null;
}

export function formatarDataCurta(data: string) {
  // "2026-11-07" -> "07/11/2026" sem problema de fuso horário
  const [a, m, d] = data.slice(0, 10).split("-");
  return `${d}/${m}/${a}`;
}

export function hojeISO() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
}
