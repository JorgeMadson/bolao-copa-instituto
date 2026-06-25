export type Stage = "group" | "knockout"

export interface Match {
  id: number
  stage: Stage
  group: string | null
  round: string
  kickoff: string
  venue: string
  home: string
  away: string
}

export interface Participant {
  id: string
  name: string
}

// [gols mandante, gols visitante]
export type Score = [number, number]

export interface MatchesData {
  tournament: string
  matches: Match[]
}

export interface PredictionsData {
  participants: Participant[]
  predictions: Record<string, Record<string, Score>>
}

export interface ResultsData {
  results: Record<string, Score>
}

export interface CorrectMatch {
  matchId: number
  home: string
  away: string
  round: string
  score: Score
}

export interface StandingRow {
  participant: Participant
  points: number
  correct: number
  played: number
  correctMatches: CorrectMatch[]
}

export interface StandingsResult {
  rows: StandingRow[]
  finishedCount: number
}
