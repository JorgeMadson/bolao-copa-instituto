import Link from "next/link"
import { Standings } from "@/components/standings"
import { MatchList } from "@/components/match-list"
import {
  getMatches,
  getFinishedCount,
  getPredictedCount,
  getResult,
  getPredictionsForMatch,
} from "@/lib/scoring"

export default function HomePage() {
  const matches = getMatches()
  const predictedIds = matches
    .filter((m) => getPredictionsForMatch(m.id) !== null)
    .map((m) => m.id)
  const finishedIds = matches.filter((m) => getResult(m.id) !== null).map((m) => m.id)

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-8 md:py-12">
      <header className="flex flex-col gap-4 border-b border-border pb-8">
        <div className="flex items-center justify-between gap-4">
          <span className="font-mono text-xs uppercase tracking-widest text-primary">
            World Cup 2026
          </span>
          <Link
            href="/admin"
            className="rounded-full border border-border px-3 py-1 font-mono text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
          >
            Inserir placares
          </Link>
        </div>
        <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
          Bolão da Copa do Mundo 2026
        </h1>
        <p className="max-w-2xl text-pretty leading-relaxed text-muted-foreground">
          Acerte o placar exato de cada jogo e marque 1 ponto. Acompanhe o
          ranking dos colegas em tempo real conforme os resultados saem.
        </p>
        <dl className="flex flex-wrap gap-6 pt-2">
          <div className="flex flex-col">
            <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Total de jogos
            </dt>
            <dd className="text-2xl font-bold tabular-nums">{matches.length}</dd>
          </div>
          <div className="flex flex-col">
            <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Apurados
            </dt>
            <dd className="text-2xl font-bold tabular-nums">
              {getFinishedCount()}
            </dd>
          </div>
          <div className="flex flex-col">
            <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Com palpites
            </dt>
            <dd className="text-2xl font-bold tabular-nums">
              {getPredictedCount()}
            </dd>
          </div>
        </dl>
      </header>

      <Standings />

      <MatchList
        matches={matches}
        predictedIds={predictedIds}
        finishedIds={finishedIds}
      />

      <footer className="border-t border-border pt-6 font-mono text-xs text-muted-foreground">
        Dados dos jogos baseados em openfootball/worldcup.json. Atualize os
        placares na página{" "}
        <Link href="/admin" className="text-primary underline">
          Inserir placares
        </Link>
        .
      </footer>
    </main>
  )
}
