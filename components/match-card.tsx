"use client"

import { TeamFlag } from "@/components/team-flag"
import type { Match, MatchResult, Participant, PredictionEntry } from "@/lib/types"
import { cn } from "@/lib/utils"
import { predictedAdvance, scorePrediction } from "@/lib/score-utils"

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
  result: MatchResult | null
  predictions: Record<string, PredictionEntry> | null
  participants: Participant[]
}) {
  const { date, time } = formatDateTime(match.kickoff)
  const finished = result !== null
  const isKnockout = match.stage === "knockout"

  const winners =
    finished && predictions
      ? participants.filter((p) => {
          const guess = predictions[p.id]
          return guess && scorePrediction(match, guess, result).points > 0
        })
      : []

  const hasPredictions = predictions !== null

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
              <span>{result.score[0]}</span>
              <span className="opacity-60">×</span>
              <span>{result.score[1]}</span>
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

      {finished && isKnockout && result.advance && (
        <p className="text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Classificado: <span className="text-primary">{result.advance}</span>
        </p>
      )}

      {!hasPredictions ? (
        <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Sem palpites registrados
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-1 border-t border-border pt-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Palpites
            </span>
            {finished && (
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {winners.length} {winners.length === 1 ? "acerto" : "acertos"}
              </span>
            )}
          </div>
          <ul className="flex flex-col gap-1">
            {participants.map((p) => {
              const guess = predictions[p.id]
              if (!guess) return null
              const score = finished
                ? scorePrediction(match, guess, result)
                : null
              const guessAdvance = isKnockout ? predictedAdvance(match, guess) : null
              return (
                <li
                  key={p.id}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded px-2 py-1 text-sm",
                    score && score.points > 0 && "bg-accent",
                  )}
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-muted-foreground">
                      {p.name}
                    </span>
                    {isKnockout && guessAdvance && (
                      <span className="truncate font-mono text-[9px] uppercase tracking-wider text-muted-foreground/70">
                        avança: {guessAdvance}
                      </span>
                    )}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="font-mono tabular-nums">
                      {guess.homeGoals} × {guess.awayGoals}
                    </span>
                    {score && (
                      <span
                        className={cn(
                          "inline-flex h-4 min-w-12 items-center justify-center rounded-full px-1.5 font-mono text-[9px] font-bold uppercase tracking-wider",
                          score.points > 0
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {score.points > 0 ? `+${score.points} pt` : "—"}
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
