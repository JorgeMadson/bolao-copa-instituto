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

// Resultado de um jogo. `score` é o placar do tempo normal (90 min).
// `advance` é o time que avançou (apenas mata-mata) — definido por prorrogação
// ou pênaltis quando o tempo normal terminou empatado.
export interface MatchResult {
  score: Score
  advance: string | null
}

// Palpite de um participante para um jogo.
export interface PredictionEntry {
  homeGoals: number
  awayGoals: number
  // Time que o participante acha que avança (mata-mata). Em caso de palpite
  // não empatado, o classificado é o vencedor do placar.
  advance: string | null
}

// matchId -> participantId -> palpite
export type PredictionsByMatch = Record<string, Record<string, PredictionEntry>>

export interface MatchesData {
  tournament: string
  matches: Match[]
}

export interface CorrectMatch {
  matchId: number
  home: string
  away: string
  round: string
  score: Score
  // Pontos ganhos neste jogo (1 = só placar/avanço, 2 = placar + avanço no mata-mata).
  points: number
  // Detalha o que foi acertado, para exibição.
  exactScore: boolean
  advanceCorrect: boolean
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
