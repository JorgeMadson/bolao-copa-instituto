"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { TeamFlag } from "@/components/team-flag"
import matchesData from "@/data/matches.json"
import resultsData from "@/data/results.json"
import type { MatchesData, ResultsData, Score } from "@/lib/types"

const matches = (matchesData as MatchesData).matches
const initialResults = (resultsData as ResultsData).results

type Draft = Record<string, { home: string; away: string }>

function buildDraft(): Draft {
  const draft: Draft = {}
  for (const m of matches) {
    const r = initialResults[String(m.id)]
    draft[m.id] = {
      home: r ? String(r[0]) : "",
      away: r ? String(r[1]) : "",
    }
  }
  return draft
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(iso))
}

export default function AdminPage() {
  const [draft, setDraft] = useState<Draft>(buildDraft)
  const [copied, setCopied] = useState(false)

  const json = useMemo(() => {
    const results: Record<string, Score> = {}
    for (const m of matches) {
      const d = draft[m.id]
      if (!d) continue
      const h = d.home.trim()
      const a = d.away.trim()
      if (h === "" || a === "") continue
      const hn = Number(h)
      const an = Number(a)
      if (Number.isNaN(hn) || Number.isNaN(an)) continue
      results[m.id] = [hn, an]
    }
    return JSON.stringify({ results }, null, 2)
  }, [draft])

  const filledCount = useMemo(
    () => Object.keys(JSON.parse(json).results).length,
    [json],
  )

  function update(id: number, side: "home" | "away", value: string) {
    const clean = value.replace(/[^0-9]/g, "").slice(0, 2)
    setDraft((prev) => ({ ...prev, [id]: { ...prev[id], [side]: clean } }))
    setCopied(false)
  }

  async function copyJson() {
    await navigator.clipboard.writeText(json)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 md:py-12">
      <header className="flex flex-col gap-4 border-b border-border pb-6">
        <div className="flex items-center justify-between gap-4">
          <span className="font-mono text-xs uppercase tracking-widest text-primary">
            Administração
          </span>
          <Link
            href="/"
            className="rounded-full border border-border px-3 py-1 font-mono text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
          >
            Voltar ao bolão
          </Link>
        </div>
        <h1 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
          Inserir placares dos jogos
        </h1>
        <p className="max-w-2xl text-pretty leading-relaxed text-muted-foreground">
          Digite o placar final de cada jogo. Em seguida copie o JSON gerado,
          cole no arquivo{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            data/results.json
          </code>{" "}
          e rode o comando{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            npm run salvar
          </code>{" "}
          para publicar a atualização no Git.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Jogos ({filledCount} com placar)
        </h2>
        <ul className="flex flex-col divide-y divide-border rounded-lg border border-border bg-card">
          {matches.map((m) => (
            <li
              key={m.id}
              className="flex items-center gap-3 px-3 py-2.5 text-sm"
            >
              <span className="w-10 shrink-0 font-mono text-[10px] text-muted-foreground">
                {formatDate(m.kickoff)}
              </span>
              <div className="flex flex-1 items-center justify-end gap-2 text-right">
                <span className="truncate">{m.home}</span>
                <TeamFlag team={m.home} />
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <input
                  inputMode="numeric"
                  aria-label={`Gols ${m.home}`}
                  value={draft[m.id]?.home ?? ""}
                  onChange={(e) => update(m.id, "home", e.target.value)}
                  className="h-9 w-10 rounded-md border border-input bg-background text-center font-mono text-base tabular-nums outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                />
                <span className="text-muted-foreground">×</span>
                <input
                  inputMode="numeric"
                  aria-label={`Gols ${m.away}`}
                  value={draft[m.id]?.away ?? ""}
                  onChange={(e) => update(m.id, "away", e.target.value)}
                  className="h-9 w-10 rounded-md border border-input bg-background text-center font-mono text-base tabular-nums outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                />
              </div>
              <div className="flex flex-1 items-center gap-2">
                <TeamFlag team={m.away} />
                <span className="truncate">{m.away}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            JSON para salvar
          </h2>
          <button
            type="button"
            onClick={copyJson}
            className="rounded-md bg-primary px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-primary-foreground transition-opacity hover:opacity-90"
          >
            {copied ? "Copiado!" : "Copiar JSON"}
          </button>
        </div>
        <pre className="max-h-80 overflow-auto rounded-lg border border-border bg-muted p-4 font-mono text-xs leading-relaxed text-foreground">
          {json}
        </pre>
      </section>
    </main>
  )
}
