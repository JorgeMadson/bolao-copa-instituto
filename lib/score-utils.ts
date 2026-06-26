// Funções puras de pontuação, sem dependência de banco de dados — seguras para
// uso tanto no servidor quanto em componentes client.
import type { Match, MatchResult, PredictionEntry } from "./types"

// Um jogo já começou? (usado para travar palpites e revelar palpites alheios)
export function hasStarted(match: Match, now: Date = new Date()): boolean {
  return now.getTime() >= new Date(match.kickoff).getTime()
}

// Placar exato do tempo normal vale 1 ponto.
export function isExactScore(
  prediction: PredictionEntry,
  result: MatchResult,
): boolean {
  return (
    prediction.homeGoals === result.score[0] &&
    prediction.awayGoals === result.score[1]
  )
}

// Time que o participante acha que avança: o vencedor do placar palpitado, ou,
// em caso de empate no palpite, o time escolhido no campo `advance`.
export function predictedAdvance(
  match: Match,
  prediction: PredictionEntry,
): string | null {
  if (prediction.homeGoals > prediction.awayGoals) return match.home
  if (prediction.awayGoals > prediction.homeGoals) return match.away
  return prediction.advance
}

export interface PredictionScore {
  points: number
  exactScore: boolean
  advanceCorrect: boolean
}

// Pontuação de um palpite:
// - 1 ponto pelo placar exato do tempo normal (grupos e mata-mata).
// - +1 ponto, no mata-mata, por acertar o time que se classifica.
export function scorePrediction(
  match: Match,
  prediction: PredictionEntry,
  result: MatchResult,
): PredictionScore {
  const exactScore = isExactScore(prediction, result)
  let points = exactScore ? 1 : 0
  let advanceCorrect = false

  if (match.stage === "knockout" && result.advance) {
    const guess = predictedAdvance(match, prediction)
    if (guess && guess === result.advance) {
      advanceCorrect = true
      points += 1
    }
  }

  return { points, exactScore, advanceCorrect }
}
