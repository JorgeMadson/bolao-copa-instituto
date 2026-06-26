import { and, asc, eq } from "drizzle-orm"
import { db } from "./index"
import { participants, predictions } from "./schema"
import type { Participant, PredictionEntry, PredictionsByMatch } from "../types"

// Lista os participantes do bolão (ordem alfabética).
export async function getParticipantsDb(): Promise<Participant[]> {
  const rows = await db
    .select()
    .from(participants)
    .orderBy(asc(participants.name))
  return rows.map((r) => ({ id: r.id, name: r.name }))
}

// Todos os palpites, agrupados por jogo -> participante.
export async function getAllPredictions(): Promise<PredictionsByMatch> {
  const rows = await db.select().from(predictions)
  const byMatch: PredictionsByMatch = {}
  for (const r of rows) {
    const key = String(r.matchId)
    if (!byMatch[key]) byMatch[key] = {}
    byMatch[key][r.participantId] = {
      homeGoals: r.homeGoals,
      awayGoals: r.awayGoals,
      advance: r.advance,
    }
  }
  return byMatch
}

// Palpites de um participante específico, indexados por matchId (string).
export async function getPredictionsForParticipant(
  participantId: string,
): Promise<Record<string, PredictionEntry>> {
  const rows = await db
    .select()
    .from(predictions)
    .where(eq(predictions.participantId, participantId))
  const result: Record<string, PredictionEntry> = {}
  for (const r of rows) {
    result[String(r.matchId)] = {
      homeGoals: r.homeGoals,
      awayGoals: r.awayGoals,
      advance: r.advance,
    }
  }
  return result
}

// Insere ou atualiza um palpite (um por participante+jogo).
export async function upsertPrediction(input: {
  participantId: string
  matchId: number
  homeGoals: number
  awayGoals: number
  advance: string | null
}): Promise<void> {
  await db
    .insert(predictions)
    .values({
      participantId: input.participantId,
      matchId: input.matchId,
      homeGoals: input.homeGoals,
      awayGoals: input.awayGoals,
      advance: input.advance,
    })
    .onConflictDoUpdate({
      target: [predictions.participantId, predictions.matchId],
      set: {
        homeGoals: input.homeGoals,
        awayGoals: input.awayGoals,
        advance: input.advance,
        updatedAt: new Date(),
      },
    })
}

// Verifica se um participante existe (validação nas server actions).
export async function participantExists(id: string): Promise<boolean> {
  const rows = await db
    .select({ id: participants.id })
    .from(participants)
    .where(eq(participants.id, id))
    .limit(1)
  return rows.length > 0
}

// Remove um palpite (caso o participante limpe os campos).
export async function deletePrediction(
  participantId: string,
  matchId: number,
): Promise<void> {
  await db
    .delete(predictions)
    .where(
      and(
        eq(predictions.participantId, participantId),
        eq(predictions.matchId, matchId),
      ),
    )
}
