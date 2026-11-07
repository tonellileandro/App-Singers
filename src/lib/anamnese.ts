// Perguntas da anamnese. Para mudar, acrescentar ou tirar perguntas, edite esta lista.
// Respostas antigas continuam guardadas mesmo se uma pergunta for removida.
export type Pergunta = {
  chave: string;
  texto: string;
  tipo: "curta" | "longa";
  ajuda?: string;
};

export const PERGUNTAS_ANAMNESE: Pergunta[] = [
  { chave: "idade", texto: "Idade", tipo: "curta" },
  { chave: "profissao", texto: "Profissão / uso da voz no dia a dia", tipo: "longa" },
  { chave: "experiencia", texto: "Experiência com canto ou música", tipo: "longa" },
  { chave: "objetivos", texto: "O que deseja alcançar com as aulas", tipo: "longa" },
  {
    chave: "problemas_vocais",
    texto: "Já teve rouquidão frequente, calos, nódulos, pólipos ou outro problema vocal?",
    tipo: "longa",
  },
  {
    chave: "acompanhamento",
    texto: "Faz ou já fez acompanhamento com fonoaudiólogo(a) ou otorrino?",
    tipo: "longa",
  },
  {
    chave: "saude",
    texto: "Condições de saúde relevantes",
    tipo: "longa",
    ajuda: "Ex.: refluxo, alergias, rinite, sinusite, asma, problemas de tireoide.",
  },
  { chave: "cirurgias", texto: "Cirurgias (principalmente garganta, nariz, pulmão)", tipo: "longa" },
  { chave: "medicamentos", texto: "Medicamentos de uso contínuo", tipo: "longa" },
  { chave: "fumo_alcool", texto: "Fuma ou consome bebida alcoólica? Com que frequência?", tipo: "longa" },
  { chave: "agua", texto: "Quanta água bebe por dia (aproximadamente)", tipo: "curta" },
  { chave: "sono", texto: "Como está o sono (horas por noite, qualidade)", tipo: "curta" },
  { chave: "observacoes", texto: "Outras observações", tipo: "longa" },
];

export const TEXTO_CONSENTIMENTO_PADRAO =
  "Autorizo a professora a coletar e guardar as informações desta anamnese, incluindo " +
  "dados de saúde, com a única finalidade de planejar e acompanhar minhas aulas de canto. " +
  "Sei que esses dados não serão compartilhados com terceiros e que posso pedir, a qualquer " +
  "momento, para consultá-los, corrigi-los ou apagá-los (Lei Geral de Proteção de Dados — " +
  "Lei 13.709/2018).";
