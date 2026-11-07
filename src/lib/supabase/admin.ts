import "server-only";
import { createClient } from "@supabase/supabase-js";

// Cliente com a chave secreta (service_role). SÓ roda no servidor e só é usado
// na página pública da ficha, que busca os dados pelo token do aluno.
export function criarClienteAdmin() {
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!chave) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, chave, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
