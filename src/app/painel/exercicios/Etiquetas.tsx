import { NOME_PILAR, NOME_TAG, NOME_INTERSECCAO, interseccaoDe, type PilarId } from "@/lib/matriz";

export default function Etiquetas({ pilares, tags }: { pilares: string[]; tags: string[] }) {
  const interseccao = interseccaoDe(pilares);
  return (
    <div className="flex flex-wrap gap-1.5">
      {interseccao && (
        <span className="rounded-full bg-amarelo-300 px-2.5 py-0.5 text-xs font-semibold text-lilas-900">
          {NOME_INTERSECCAO[interseccao]}
        </span>
      )}
      {pilares.map((p) => (
        <span key={p} className="rounded-full bg-lilas-600 px-2.5 py-0.5 text-xs font-medium text-white">
          {NOME_PILAR[p as PilarId] ?? p}
        </span>
      ))}
      {tags.map((t) => (
        <span key={t} className="rounded-full bg-lilas-100 px-2.5 py-0.5 text-xs text-lilas-800">
          {NOME_TAG[t] ?? t}
        </span>
      ))}
    </div>
  );
}
