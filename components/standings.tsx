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
                "flex items-center gap-4 rounded-lg border border-l-4 border-border bg-card p-4 shadow-sm",
                MEDALS[index] ?? "border-l-border",
              )}
            >
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
            </li>
          )
        })}
      </ol>
    </section>
  )
}
