"use client"

import { useMemo, useState } from "react"
import type { Match } from "@/lib/types"
import { cn } from "@/lib/utils"
import { MatchCardClient } from "@/components/match-card-client"
import type { Score } from "@/lib/types"

type Filter = "comPalpite" | "encerrados" | "todos"

const FILTERS: { id: Filter; label: string }[] = [
  { id: "comPalpite", label: "Com palpites" },
  { id: "encerrados", label: "Encerrados" },
  { id: "todos", label: "Todos os jogos" },
]

export function MatchList({
  matches,
  predictedIds,
  finishedIds,
  results,
}: {
  matches: Match[]
  predictedIds: number[]
  finishedIds: number[]
  results: Record<string, Score>
}) {
  const [filter, setFilter] = useState<Filter>("comPalpite")

  const predicted = useMemo(() => new Set(predictedIds), [predictedIds])
  const finished = useMemo(() => new Set(finishedIds), [finishedIds])

  const visible = useMemo(() => {
    if (filter === "encerrados") {
      // Mais recentes primeiro para ver logo o que acabou de ser apurado.
      return matches
        .filter((m) => finished.has(m.id))
        .sort(
          (a, b) =>
            new Date(b.kickoff).getTime() - new Date(a.kickoff).getTime(),
        )
    }
    if (filter === "comPalpite") {
      // Jogos ainda não apurados no topo; os encerrados (recolhidos) ao final.
      return matches
        .filter((m) => predicted.has(m.id))
        .sort((a, b) => {
          const aFinished = finished.has(a.id) ? 1 : 0
          const bFinished = finished.has(b.id) ? 1 : 0
          if (aFinished !== bFinished) return aFinished - bFinished
          return new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()
        })
    }
    return matches
  }, [filter, matches, predicted, finished])

  return (
    <section aria-labelledby="jogos-title" className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <div>
          <h2
            id="jogos-title"
            className="font-mono text-xs uppercase tracking-widest text-muted-foreground"
          >
            Calendário
          </h2>
          <p className="text-pretty text-2xl font-bold tracking-tight">Jogos</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-full border px-3 py-1 font-mono text-xs uppercase tracking-wider transition-colors",
                filter === f.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Nenhum jogo nesta categoria por enquanto.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {visible.map((match) => (
            <MatchCardClient
              key={match.id}
              match={match}
              result={results[String(match.id)] ?? null}
            />
          ))}
        </div>
      )}
    </section>
  )
}
