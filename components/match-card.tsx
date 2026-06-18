"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { TeamFlag } from "@/components/team-flag"
import type { Match, Participant, Score } from "@/lib/types"
import { cn } from "@/lib/utils"
import { isExact } from "@/lib/scoring"

function formatDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso)
  const date = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: "America/Sao_Paulo",
  }).format(d)
  const time = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(d)
  return { date, time }
}

export function MatchCard({
  match,
  result,
  predictions,
  participants,
}: {
  match: Match
  result: Score | null
  predictions: Record<string, Score> | null
  participants: Participant[]
}) {
  const { date, time } = formatDateTime(match.kickoff)
  const finished = result !== null

  // Jogos encerrados começam recolhidos para reduzir a rolagem.
  const [expanded, setExpanded] = useState(!finished)

  const correctCount =
    finished && predictions
      ? participants.reduce((acc, p) => {
          const guess = predictions[p.id]
          return acc + (guess && isExact(guess, result) ? 1 : 0)
        }, 0)
      : 0

  const hasPredictions = predictions !== null
  const collapsible = finished && hasPredictions

  return (
    <article className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {match.group ? `Grupo ${match.group}` : match.round}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {date} · {time}
        </span>
      </div>

      <div className="flex items-center justify-center gap-3">
        <div className="flex flex-1 items-center justify-end gap-2 text-right">
          <span className="truncate text-sm font-semibold">{match.home}</span>
          <TeamFlag team={match.home} />
        </div>
        <div
          className={cn(
            "flex shrink-0 items-center gap-1 rounded-md px-3 py-1 font-mono text-lg font-bold tabular-nums",
            finished
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          {finished ? (
            <>
              <span>{result[0]}</span>
              <span className="opacity-60">×</span>
              <span>{result[1]}</span>
            </>
          ) : (
            <span className="text-xs">vs</span>
          )}
        </div>
        <div className="flex flex-1 items-center gap-2">
          <TeamFlag team={match.away} />
          <span className="truncate text-sm font-semibold">{match.away}</span>
        </div>
      </div>

      {!hasPredictions ? (
        <div className="border-t border-border pt-3">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Sem palpites registrados para este jogo
          </span>
        </div>
      ) : collapsible && !expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          aria-expanded={false}
          className="flex items-center justify-between gap-2 border-t border-border pt-3 text-left"
        >
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {correctCount > 0
              ? `${correctCount} ${correctCount === 1 ? "acerto" : "acertos"} · ver palpites`
              : "Nenhum acerto · ver palpites"}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </button>
      ) : (
        <div className="flex flex-col gap-1 border-t border-border pt-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Palpites
            </span>
            {collapsible && (
              <button
                type="button"
                onClick={() => setExpanded(false)}
                aria-expanded
                className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
              >
                Recolher
                <ChevronDown className="h-4 w-4 rotate-180" aria-hidden="true" />
              </button>
            )}
          </div>
          <ul className="flex flex-col gap-1">
            {participants.map((p) => {
              const guess = predictions[p.id]
              if (!guess) return null
              const correct = result ? guess[0] === result[0] && guess[1] === result[1] : false
              return (
                <li
                  key={p.id}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded px-2 py-1 text-sm",
                    correct && "bg-accent",
                  )}
                >
                  <span className="truncate text-muted-foreground">
                    {p.name}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="font-mono tabular-nums">
                      {guess[0]} × {guess[1]}
                    </span>
                    {finished && (
                      <span
                        className={cn(
                          "inline-flex h-4 w-12 items-center justify-center rounded-full font-mono text-[9px] font-bold uppercase tracking-wider",
                          correct
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {correct ? "+1 pt" : "—"}
                      </span>
                    )}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </article>
  )
}
