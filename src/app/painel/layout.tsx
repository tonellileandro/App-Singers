import Link from "next/link";
import { redirect } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/server";

const MENU = [
  { href: "/painel/alunos", rotulo: "Alunos" },
  { href: "/painel/avaliacoes", rotulo: "Avaliações", embreve: true },
  { href: "/painel/exercicios", rotulo: "Exercícios", embreve: true },
  { href: "/painel/fichas", rotulo: "Fichas", embreve: true },
];

export default async function LayoutPainel({ children }: { children: React.ReactNode }) {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link href="/painel" className="text-lg font-semibold text-rose-700">
            Aulas de Canto
          </Link>
          <nav className="flex flex-wrap gap-1 text-sm">
            {MENU.map((item) =>
              item.embreve ? (
                <span key={item.href} className="rounded-lg px-3 py-1.5 text-stone-400" title="Em breve">
                  {item.rotulo}
                </span>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-1.5 font-medium text-stone-700 hover:bg-stone-100"
                >
                  {item.rotulo}
                </Link>
              )
            )}
          </nav>
          <form action="/auth/sair" method="post" className="ml-auto">
            <button className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-100">
              Sair
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
