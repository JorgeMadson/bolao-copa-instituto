import Link from "next/link"
import { TeamFlag } from "@/components/team-flag"
import { getMatches, getAllResults } from "@/lib/scoring"

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(iso))
}

export default async function AdminPage() {
  const matches = getMatches()
  const results = await getAllResults()
  const finishedCount = Object.keys(results).length

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 md:py-12">
      <header className="flex flex-col gap-4 border-b border-border pb-6">
        <div className="flex items-center justify-between gap-4">
          <span className="font-mono text-xs uppercase tracking-widest text-primary">
            Resultados
          </span>
          <Link
            href="/"
            className="rounded-full border border-border px-3 py-1 font-mono text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
          >
            Voltar ao bolão
          </Link>
        </div>
        <h1 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
          Placares dos jogos
        </h1>
        <p className="max-w-2xl text-pretty leading-relaxed text-muted-foreground">
          Resultados importados automaticamente de{" "}
          <a
            href="https://github.com/openfootball/worldcup.json"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            openfootball/worldcup.json
          </a>
          . A página atualiza a cada 5 minutos sem intervenção manual.
        </p>
        <div className="flex gap-6 pt-1">
          <div className="flex flex-col">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Total de jogos
            </span>
            <span className="text-2xl font-bold tabular-nums">{matches.length}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Com resultado
            </span>
            <span className="text-2xl font-bold tabular-nums text-primary">
              {finishedCount}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Aguardando
            </span>
            <span className="text-2xl font-bold tabular-nums text-muted-foreground">
              {matches.length - finishedCount}
            </span>
          </div>
        </div>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Todos os jogos ({finishedCount} com placar)
        </h2>
        <ul className="flex flex-col divide-y divide-border rounded-lg border border-border bg-card">
          {matches.map((m) => {
            const result = results[String(m.id)]
            return (
              <li
                key={m.id}
                className="flex items-center gap-3 px-3 py-2.5 text-sm"
              >
                <span className="w-24 shrink-0 font-mono text-[10px] text-muted-foreground">
                  {formatDate(m.kickoff)}
                </span>
                <div className="flex flex-1 items-center justify-end gap-2 text-right">
                  <span className="truncate">{m.home}</span>
                  <TeamFlag team={m.home} />
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {result ? (
                    <span className="flex items-center gap-1 rounded-md bg-primary px-3 py-1 font-mono text-base font-bold tabular-nums text-primary-foreground">
                      <span>{result[0]}</span>
                      <span className="opacity-60">×</span>
                      <span>{result[1]}</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-md bg-muted px-3 py-1 font-mono text-xs text-muted-foreground">
                      vs
                    </span>
                  )}
                </div>
                <div className="flex flex-1 items-center gap-2">
                  <TeamFlag team={m.away} />
                  <span className="truncate">{m.away}</span>
                </div>
              </li>
            )
          })}
        </ul>
      </section>
    </main>
  )
}
