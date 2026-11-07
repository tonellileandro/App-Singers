import Link from "next/link";
import FormExercicio from "../FormExercicio";
import { criarExercicio } from "../actions";
import { cartao } from "@/components/ui";

export default function NovoExercicio() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href="/painel/exercicios" className="text-sm text-stone-500 hover:text-stone-800">
        ← Voltar para a biblioteca
      </Link>
      <h1 className="text-2xl font-semibold">Novo exercício</h1>
      <p className="text-sm text-stone-600">
        Depois de salvar, você poderá enviar os áudios de piano (grave, médio e agudo).
      </p>
      <div className={cartao}>
        <FormExercicio acao={criarExercicio} textoBotao="Salvar e enviar áudios →" />
      </div>
    </div>
  );
}
