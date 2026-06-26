import matchesData from "@/data/matches.json"
import { fetchExternalResults } from "@/lib/openfootball"
import { getAllPredictions, getParticipantsDb } from "@/lib/db/queries"
import { scorePrediction } from "@/lib/score-utils"
import type {
  Match,
  MatchesData,
  MatchResult,
  Participant,
  Score,
  StandingRow,
  StandingsResult,
} from "./types"

// Reexporta os helpers puros de pontuação para quem importa de "@/lib/scoring".
export {
  hasStarted,
  isExactScore,
  predictedAdvance,
  scorePrediction,
} from "@/lib/score-utils"
export type { PredictionScore } from "@/lib/score-utils"

const matches = (matchesData as MatchesData).matches

// ---------------------------------------------------------------------------
// Jogos (estáticos, vindos do matches.json)
// ---------------------------------------------------------------------------

export function getMatches(): Match[] {
  return [...matches].sort(
    (a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime(),
  )
}

export function getMatchById(matchId: number): Match | undefined {
  return matches.find((m) => m.id === matchId)
}

// ---------------------------------------------------------------------------
// Participantes e palpites (vindos do banco)
// ---------------------------------------------------------------------------

export function getParticipants(): Promise<Participant[]> {
  return getParticipantsDb()
}

// ---------------------------------------------------------------------------
// Resultados — obtidos dinamicamente do openfootball (com cache de 5 min)
// ---------------------------------------------------------------------------

export async function getResults(): Promise<Record<string, MatchResult>> {
  try {
    return await fetchExternalResults()
  } catch (err) {
    console.error("[scoring] falha ao buscar resultados:", err)
    return {}
  }
}

export async function getResult(matchId: number): Promise<MatchResult | null> {
  const results = await getResults()
  return results[String(matchId)] ?? null
}

// ---------------------------------------------------------------------------
// Classificação
// ---------------------------------------------------------------------------

export async function getStandings(): Promise<StandingsResult> {
  const [results, participants, predictionsByMatch] = await Promise.all([
    getResults(),
    getParticipantsDb(),
    getAllPredictions(),
  ])

  const rows: StandingRow[] = participants.map((participant) => {
    let points = 0
    let correct = 0
    let played = 0
    const correctMatches: StandingRow["correctMatches"] = []

    for (const match of matches) {
      const result = results[String(match.id)] ?? null
      if (!result) continue

      const prediction = predictionsByMatch[String(match.id)]?.[participant.id]
      if (!prediction) continue

      played += 1
      const { points: pts, exactScore, advanceCorrect } = scorePrediction(
        match,
        prediction,
        result,
      )

      if (pts > 0) {
        points += pts
        correct += 1
        correctMatches.push({
          matchId: match.id,
          home: match.home,
          away: match.away,
          round: match.round,
          score: result.score,
          points: pts,
          exactScore,
          advanceCorrect,
        })
      }
    }

    return { participant, points, correct, played, correctMatches }
  })

  const finishedCount = matches.filter(
    (m) => results[String(m.id)] !== undefined,
  ).length

  return {
    rows: rows.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.correct !== a.correct) return b.correct - a.correct
      return a.participant.name.localeCompare(b.participant.name)
    }),
    finishedCount,
  }
}

// Quantos jogos têm pelo menos um palpite registrado.
export async function getPredictedCount(): Promise<number> {
  const predictionsByMatch = await getAllPredictions()
  return Object.keys(predictionsByMatch).length
}

// Helper de score puro, exportado para reuso por tipo Score.
export type { Score }
