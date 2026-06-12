import matchesData from "@/data/matches.json"
import predictionsData from "@/data/predictions.json"
import resultsData from "@/data/results.json"
import type {
  Match,
  MatchesData,
  Participant,
  PredictionsData,
  ResultsData,
  Score,
  StandingRow,
} from "./types"

const matches = (matchesData as MatchesData).matches
const { participants, predictions } = predictionsData as PredictionsData
const { results } = resultsData as ResultsData

export function getMatches(): Match[] {
  return [...matches].sort(
    (a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime(),
  )
}

export function getParticipants(): Participant[] {
  return participants
}

export function getResult(matchId: number): Score | null {
  return results[String(matchId)] ?? null
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

export function getStandings(): StandingRow[] {
  const rows: StandingRow[] = participants.map((participant) => {
    let points = 0
    let correct = 0
    let played = 0

    for (const match of matches) {
      const result = getResult(match.id)
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

  return rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    return a.participant.name.localeCompare(b.participant.name)
  })
}

export function getFinishedCount(): number {
  return matches.filter((m) => getResult(m.id) !== null).length
}

export function getPredictedCount(): number {
  return matches.filter((m) => getPredictionsForMatch(m.id) !== null).length
}
