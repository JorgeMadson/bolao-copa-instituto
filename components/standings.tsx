import { getStandings } from "@/lib/scoring"
import { cn } from "@/lib/utils"

const MEDALS = [
  "border-l-[oklch(0.78_0.13_90)]",
  "border-l-[oklch(0.72_0.02_150)]",
  "border-l-[oklch(0.62_0.1_50)]",
]

export async function Standings() {
  const { rows: standings, finishedCount: finished } = await getStandings()

  return (
    <section aria-labelledby="ranking-title" className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2
            id="ranking-title"
            className="font-mono text-xs uppercase tracking-widest text-muted-foreground"
          >
            Classificação
          </h2>
          <p className="text-pretty text-2xl font-bold tracking-tight">
            Ranking do bolão
          </p>
        </div>
        <span className="shrink-0 font-mono text-xs text-muted-foreground">
          {finished} {finished === 1 ? "jogo apurado" : "jogos apurados"}
        </span>
      </div>

      <ol className="flex flex-col gap-2">
        {standings.map((row, index) => {
          const position = index + 1
          return (
            <li
              key={row.participant.id}
              className={cn(
                "rounded-lg border border-l-4 border-border bg-card shadow-sm",
                MEDALS[index] ?? "border-l-border",
              )}
            >
              <div className="flex items-center gap-4 p-4">
                <span className="w-6 shrink-0 text-center font-mono text-lg font-bold tabular-nums text-muted-foreground">
                  {position}
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-semibold leading-tight">
                    {row.participant.name}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {row.correct} de {row.played} palpites apurados
                  </span>
                </div>
                <div className="flex shrink-0 flex-col items-end">
                  <span className="text-2xl font-bold tabular-nums text-primary">
                    {row.points}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {row.points === 1 ? "ponto" : "pontos"}
                  </span>
                </div>
              </div>

              {row.correctMatches.length > 0 && (
                <details className="group border-t border-border">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-2.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground">
                    <span>
                      Ver {row.correctMatches.length}{" "}
                      {row.correctMatches.length === 1
                        ? "jogo acertado"
                        : "jogos acertados"}
                    </span>
                    <span className="transition-transform group-open:rotate-180">
                      v
                    </span>
                  </summary>
                  <ul className="flex flex-col gap-1.5 px-4 pb-4">
                    {row.correctMatches.map((m) => (
                      <li
                        key={m.matchId}
                        className="flex items-center justify-between gap-3 rounded-md bg-muted/50 px-3 py-2 text-sm"
                      >
                        <span className="min-w-0 truncate">
                          {m.home}{" "}
                          <span className="font-mono font-bold tabular-nums text-primary">
                            {m.score[0]}-{m.score[1]}
                          </span>{" "}
                          {m.away}
                        </span>
                        <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          {m.round}
                        </span>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
