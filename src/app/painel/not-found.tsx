import Link from "next/link";

export default function NaoEncontrado() {
  return (
    <div className="py-16 text-center">
      <p className="text-lg font-medium">Página não encontrada.</p>
      <Link href="/painel/alunos" className="mt-4 inline-block text-lilas-700 underline">
        Voltar para alunos
      </Link>
    </div>
  );
}
