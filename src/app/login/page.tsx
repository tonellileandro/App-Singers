"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { criarClienteNavegador } from "@/lib/supabase/client";

function traduzirErro(mensagem: string) {
  if (mensagem.includes("Invalid login credentials")) return "E-mail ou senha incorretos.";
  if (mensagem.includes("Email not confirmed"))
    return "Este e-mail ainda não foi confirmado. Confira sua caixa de entrada.";
  if (mensagem.toLowerCase().includes("fetch"))
    return "Não foi possível conectar. Verifique sua internet e tente de novo.";
  return "Não foi possível entrar. Tente novamente em instantes.";
}

export default function PaginaLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    const supabase = criarClienteNavegador();
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    setCarregando(false);
    if (error) {
      setErro(traduzirErro(error.message));
      return;
    }
    router.replace("/painel");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <form
        onSubmit={entrar}
        className="w-full max-w-sm space-y-5 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-stone-200"
      >
        <div>
          <h1 className="text-2xl font-semibold">Aulas de Canto</h1>
          <p className="mt-1 text-sm text-stone-500">Entre para acessar o painel.</p>
        </div>

        <label className="block">
          <span className="text-sm font-medium">E-mail</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Senha</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
          />
        </label>

        {erro && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {erro}
          </p>
        )}

        <button
          type="submit"
          disabled={carregando}
          className="w-full rounded-lg bg-rose-600 px-4 py-2.5 font-medium text-white hover:bg-rose-700 disabled:opacity-60"
        >
          {carregando ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}
