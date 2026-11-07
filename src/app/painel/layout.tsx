import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/server";

const MENU = [
  { href: "/painel/alunos", rotulo: "Alunos" },
  { href: "/painel/avaliacoes", rotulo: "Avaliações", embreve: true },
  { href: "/painel/exercicios", rotulo: "Exercícios" },
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
      <header className="border-b-4 border-amarelo-300 bg-lilas-600 text-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link href="/painel" className="flex items-center gap-2">
            <Image src="/logo.png" alt="" width={40} height={40} className="rounded-full" priority />
            <span className="text-lg font-semibold tracking-wide">SINGERS HOUSE</span>
          </Link>
          <nav className="flex flex-wrap gap-1 text-sm">
            {MENU.map((item) =>
              item.embreve ? (
                <span key={item.href} className="rounded-lg px-3 py-1.5 text-white/45" title="Em breve">
                  {item.rotulo}
                </span>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-1.5 font-medium text-white hover:bg-white/15"
                >
                  {item.rotulo}
                </Link>
              )
            )}
          </nav>
          <form action="/auth/sair" method="post" className="ml-auto">
            <button className="rounded-lg border border-amarelo-300 px-3 py-1.5 text-sm text-amarelo-200 hover:bg-amarelo-300 hover:text-lilas-800">
              Sair
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
