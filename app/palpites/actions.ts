"use server"

import { revalidatePath } from "next/cache"
import { getMatchById } from "@/lib/scoring"
import { hasStarted } from "@/lib/score-utils"
import {
  deletePrediction,
  getPredictionsForParticipant,
  participantExists,
  upsertPrediction,
} from "@/lib/db/queries"
import type { PredictionEntry } from "@/lib/types"

export interface SaveEntry {
  matchId: number
  // null/undefined = sem palpite (será removido se existir)
  homeGoals: number | null
  awayGoals: number | null
  advance: string | null
}

export interface SaveResult {
  ok: boolean
  saved: number
  skipped: number
  message: string
}

function clampGoals(value: number | null): number | null {
  if (value === null || Number.isNaN(value)) return null
  const n = Math.trunc(value)
  if (n < 0) return 0
  if (n > 30) return 30
  return n
}

// Carrega os palpites do próprio participante (somente os dele).
export async function loadMyPredictions(
  participantId: string,
): Promise<Record<string, PredictionEntry>> {
  if (!participantId) return {}
  const exists = await participantExists(participantId)
  if (!exists) return {}
  return getPredictionsForParticipant(participantId)
}

// Salva (insere/atualiza/remove) os palpites do participante. Recusa qualquer
// jogo que já tenha começado — a trava acontece no horário do apito inicial.
export async function savePredictions(
  participantId: string,
  entries: SaveEntry[],
): Promise<SaveResult> {
  if (!participantId || !(await participantExists(participantId))) {
    return { ok: false, saved: 0, skipped: 0, message: "Participante inválido." }
  }

  const now = new Date()
  let saved = 0
  let skipped = 0

  for (const entry of entries) {
    const match = getMatchById(entry.matchId)
    if (!match) {
      skipped += 1
      continue
    }

    // Trava no início do jogo.
    if (hasStarted(match, now)) {
      skipped += 1
      continue
    }

    const home = clampGoals(entry.homeGoals)
    const away = clampGoals(entry.awayGoals)

    // Sem placar completo => remove eventual palpite anterior.
    if (home === null || away === null) {
      await deletePrediction(participantId, entry.matchId)
      continue
    }

    // O campo "avança" só faz sentido no mata-mata e quando o placar empata.
    const advance =
      match.stage === "knockout" && home === away ? entry.advance : null

    await upsertPrediction({
      participantId,
      matchId: entry.matchId,
      homeGoals: home,
      awayGoals: away,
      advance,
    })
    saved += 1
  }

  revalidatePath("/")
  revalidatePath("/palpites")

  const message =
    skipped > 0
      ? `${saved} palpite(s) salvo(s). ${skipped} jogo(s) ignorado(s) por já terem começado.`
      : `${saved} palpite(s) salvo(s) com sucesso!`

  return { ok: true, saved, skipped, message }
}
