import matchesData from "@/data/matches.json"
import predictionsData from "@/data/predictions.json"
import { fetchExternalResults } from "@/lib/openfootball"
import type {
  Match,
  MatchesData,
  Participant,
  PredictionsData,
  Score,
  StandingRow,
  StandingsResult,
} from "./types"

const matches = (matchesData as MatchesData).matches
const { participants, predictions } = predictionsData as unknown as PredictionsData

// ---------------------------------------------------------------------------
// Resultados — obtidos dinamicamente do openfootball (com cache de 5 min)
// ---------------------------------------------------------------------------

export async function getResults(): Promise<Record<string, Score>> {
  try {
    return await fetchExternalResults()
  } catch (err) {
    console.error("[scoring] falha ao buscar resultados:", err)
    return {}
  }
}

// ---------------------------------------------------------------------------
// Queries síncronas (usadas onde os resultados já foram carregados)
// ---------------------------------------------------------------------------

export function getMatches(): Match[] {
  return [...matches].sort(
    (a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime(),
  )
}

export function getParticipants(): Participant[] {
  return participants
}

export function getPrediction(
  matchId: number,
  participantId: string,
): Score | null {
  return predictions[String(matchId)]?.[participantId] ?? null
}

export function getPredictionsForMatch(
  matchId: number,
): Record<string, Score> | null {
  return predictions[String(matchId)] ?? null
}

// 1 ponto para o placar exato (gols mandante e visitante corretos)
export function isExact(prediction: Score, result: Score): boolean {
  return prediction[0] === result[0] && prediction[1] === result[1]
}

// ---------------------------------------------------------------------------
// Queries async (buscam resultados externos)
// ---------------------------------------------------------------------------

export async function getResult(matchId: number): Promise<Score | null> {
  const results = await getResults()
  return results[String(matchId)] ?? null
}

export async function getStandings(): Promise<StandingsResult> {
  const results = await getResults()

  const rows: StandingRow[] = participants.map((participant) => {
    let points = 0
    let correct = 0
    let played = 0

    for (const match of matches) {
      const result = results[String(match.id)] ?? null
      if (!result) continue

      const prediction = getPrediction(match.id, participant.id)
      if (!prediction) continue

      played += 1
      if (isExact(prediction, result)) {
        points += 1
        correct += 1
      }
    }

    return { participant, points, correct, played }
  })

  const finishedCount = matches.filter((m) => results[String(m.id)] !== undefined).length

  return {
    rows: rows.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      return a.participant.name.localeCompare(b.participant.name)
    }),
    finishedCount,
  }
}

export function getPredictedCount(): number {
  return matches.filter((m) => getPredictionsForMatch(m.id) !== null).length
}
