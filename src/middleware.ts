import type { NextRequest } from "next/server";
import { atualizarSessao } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return atualizarSessao(request);
}

export const config = {
  // A página pública /ficha/... e os arquivos estáticos não passam pelo login.
  matcher: ["/painel/:path*", "/login"],
};
