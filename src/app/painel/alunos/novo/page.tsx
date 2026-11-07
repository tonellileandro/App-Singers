import Link from "next/link";
import FormAluno from "../FormAluno";
import { criarAluno } from "../actions";
import { cartao } from "@/components/ui";

export default function NovoAluno() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href="/painel/alunos" className="text-sm text-stone-500 hover:text-stone-800">
        ← Voltar para alunos
      </Link>
      <h1 className="text-2xl font-semibold">Novo aluno</h1>
      <div className={cartao}>
        <FormAluno acao={criarAluno} textoBotao="Cadastrar aluno" />
      </div>
    </div>
  );
}
