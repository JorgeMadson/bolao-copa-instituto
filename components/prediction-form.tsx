"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { Check, Loader2, Lock } from "lucide-react"
import { TeamFlag } from "@/components/team-flag"
import type { Match, Participant } from "@/lib/types"
import { cn } from "@/lib/utils"
import { loadMyPredictions, savePredictions, type SaveEntry } from "@/app/palpites/actions"

const STORAGE_KEY = "bolao:participantId"

interface Draft {
  home: string
  away: string
  advance: string | null
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(iso))
}

export function PredictionForm({
  matches,
  participants,
  nowMs,
}: {
  matches: Match[]
  participants: Participant[]
  nowMs: number
}) {
  const [participantId, setParticipantId] = useState("")
  const [drafts, setDrafts] = useState<Record<string, Draft>>({})
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [isSaving, startSaving] = useTransition()

  // Restaura o nome selecionado na última visita.
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) setParticipantId(stored)
  }, [])

  // Carrega os palpites do participante selecionado.
  useEffect(() => {
    if (!participantId) {
      setDrafts({})
      return
    }
    window.localStorage.setItem(STORAGE_KEY, participantId)
    setLoading(true)
    setStatus(null)
    loadMyPredictions(participantId)
      .then((preds) => {
        const next: Record<string, Draft> = {}
        for (const [matchId, p] of Object.entries(preds)) {
          next[matchId] = {
            home: String(p.homeGoals),
            away: String(p.awayGoals),
            advance: p.advance,
          }
        }
        setDrafts(next)
      })
      .finally(() => setLoading(false))
  }, [participantId])

  const editableMatches = useMemo(
    () =>
      matches
        .filter((m) => new Date(m.kickoff).getTime() > nowMs)
        .sort(
          (a, b) =>
            new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime(),
        ),
    [matches, nowMs],
  )

  const lockedCount = matches.length - editableMatches.length

  // Agrupa por rodada, preservando a ordem cronológica.
  const groups = useMemo(() => {
    const map = new Map<string, Match[]>()
    for (const m of editableMatches) {
      const list = map.get(m.round) ?? []
      list.push(m)
      map.set(m.round, list)
    }
    return [...map.entries()]
  }, [editableMatches])

  function updateDraft(matchId: number, patch: Partial<Draft>) {
    setDrafts((prev) => ({
      ...prev,
      [matchId]: {
        home: prev[matchId]?.home ?? "",
        away: prev[matchId]?.away ?? "",
        advance: prev[matchId]?.advance ?? null,
        ...patch,
      },
    }))
    setStatus(null)
  }

  function handleSave() {
    const entries: SaveEntry[] = editableMatches.map((m) => {
      const d = drafts[String(m.id)]
      const home = d?.home?.trim() ? Number(d.home) : null
      const away = d?.away?.trim() ? Number(d.away) : null
      return {
        matchId: m.id,
        homeGoals: home,
        awayGoals: away,
        advance: d?.advance ?? null,
      }
    })

    startSaving(async () => {
      const result = await savePredictions(participantId, entries)
      setStatus(result.message)
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="participant"
          className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
        >
          Quem é você?
        </label>
        <select
          id="participant"
          value={participantId}
          onChange={(e) => setParticipantId(e.target.value)}
          className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-semibold text-foreground outline-none ring-ring focus-visible:ring-2"
        >
          <option value="">Selecione seu nome…</option>
          {participants.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <p className="text-pretty text-xs leading-relaxed text-muted-foreground">
          Os palpites travam no horário de início de cada jogo. No mata-mata, em
          caso de empate no tempo normal, escolha quem se classifica nos
          pênaltis.
        </p>
      </div>

      {!participantId ? (
        <p className="rounded-lg border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Selecione seu nome para começar a palpitar.
        </p>
      ) : loading ? (
        <p className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card p-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Carregando seus palpites…
        </p>
      ) : editableMatches.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Não há jogos abertos para palpitar no momento.
        </p>
      ) : (
        <>
          {lockedCount > 0 && (
            <p className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              {lockedCount} jogo(s) já começaram e não podem mais ser editados
            </p>
          )}

          <div className="flex flex-col gap-6">
            {groups.map(([round, roundMatches]) => (
              <section key={round} className="flex flex-col gap-3">
                <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  {round}
                </h2>
                <ul className="flex flex-col gap-3">
                  {roundMatches.map((m) => {
                    const d = drafts[String(m.id)]
                    const home = d?.home ?? ""
                    const away = d?.away ?? ""
                    const isKnockout = m.stage === "knockout"
                    const isTie =
                      home.trim() !== "" && away.trim() !== "" && home === away
                    const needsAdvance = isKnockout && isTie
                    return (
                      <li
                        key={m.id}
                        className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 shadow-sm"
                      >
                        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          {formatDate(m.kickoff)}
                          {m.group ? ` · Grupo ${m.group}` : ""}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-1 items-center justify-end gap-2 text-right">
                            <span className="truncate text-sm font-semibold">
                              {m.home}
                            </span>
                            <TeamFlag team={m.home} />
                          </div>
                          <input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            max={30}
                            aria-label={`Gols ${m.home}`}
                            value={home}
                            onChange={(e) =>
                              updateDraft(m.id, { home: e.target.value })
                            }
                            className="h-10 w-12 rounded-md border border-border bg-background text-center font-mono text-base font-bold tabular-nums outline-none ring-ring focus-visible:ring-2"
                          />
                          <span className="font-mono text-xs text-muted-foreground">
                            ×
                          </span>
                          <input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            max={30}
                            aria-label={`Gols ${m.away}`}
                            value={away}
                            onChange={(e) =>
                              updateDraft(m.id, { away: e.target.value })
                            }
                            className="h-10 w-12 rounded-md border border-border bg-background text-center font-mono text-base font-bold tabular-nums outline-none ring-ring focus-visible:ring-2"
                          />
                          <div className="flex flex-1 items-center gap-2">
                            <TeamFlag team={m.away} />
                            <span className="truncate text-sm font-semibold">
                              {m.away}
                            </span>
                          </div>
                        </div>

                        {needsAdvance && (
                          <div className="flex flex-col gap-1.5 border-t border-border pt-2">
                            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                              Empate — quem se classifica?
                            </span>
                            <div className="flex gap-2">
                              {[m.home, m.away].map((team) => (
                                <button
                                  key={team}
                                  type="button"
                                  onClick={() =>
                                    updateDraft(m.id, { advance: team })
                                  }
                                  className={cn(
                                    "flex-1 rounded-md border px-2 py-1.5 text-xs font-semibold transition-colors",
                                    d?.advance === team
                                      ? "border-primary bg-primary text-primary-foreground"
                                      : "border-border bg-background text-muted-foreground hover:text-foreground",
                                  )}
                                >
                                  {team}
                                </button>
                              ))}
                            </div>
                            {!d?.advance && (
                              <span className="font-mono text-[10px] text-destructive">
                                Escolha quem avança para ganhar o ponto extra.
                              </span>
                            )}
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </section>
            ))}
          </div>

          <div className="sticky bottom-4 z-10 flex flex-col gap-2">
            {status && (
              <p className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground shadow-sm">
                <Check className="h-4 w-4 text-primary" aria-hidden="true" />
                {status}
              </p>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-lg transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Salvando…
                </>
              ) : (
                "Salvar palpites"
              )}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
