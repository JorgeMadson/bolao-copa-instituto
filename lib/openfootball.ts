/**
 * Busca os resultados do openfootball/worldcup.json e mapeia para o formato
 * interno { matchId: [homeGoals, awayGoals] }.
 *
 * A correspondência é feita pelo par (team1, team2) da fonte externa versus
 * (home, away) do matches.json local, usando a tabela de nomes abaixo.
 */

import matchesData from "@/data/matches.json"
import type { Match, MatchesData, MatchResult, Score } from "./types"

const OPENFOOTBALL_URL =
  "https://raw.githubusercontent.com/openfootball/worldcup.json/refs/heads/master/2026/worldcup.json"

/** Mapeamento nome EN (openfootball) → nome PT-BR (matches.json) */
const NAME_MAP: Record<string, string> = {
  Mexico: "México",
  "South Africa": "África do Sul",
  "South Korea": "Coreia do Sul",
  "Czech Republic": "Rep. Tcheca",
  Canada: "Canadá",
  "Bosnia & Herzegovina": "Bósnia",
  Qatar: "Catar",
  Switzerland: "Suíça",
  Brazil: "Brasil",
  Morocco: "Marrocos",
  Haiti: "Haiti",
  Scotland: "Escócia",
  USA: "Estados Unidos",
  Paraguay: "Paraguai",
  Australia: "Austrália",
  Turkey: "Turquia",
  Germany: "Alemanha",
  "Curaçao": "Curaçao",
  "Ivory Coast": "Costa do Marfim",
  Ecuador: "Equador",
  Netherlands: "Holanda",
  Japan: "Japão",
  Sweden: "Suécia",
  Tunisia: "Tunísia",
  Belgium: "Bélgica",
  Egypt: "Egito",
  Iran: "Irã",
  "New Zealand": "Nova Zelândia",
  Spain: "Espanha",
  "Cape Verde": "Cabo Verde",
  "Saudi Arabia": "Arábia Saudita",
  Uruguay: "Uruguai",
  France: "França",
  Senegal: "Senegal",
  Iraq: "Iraque",
  Norway: "Noruega",
  Argentina: "Argentina",
  Algeria: "Argélia",
  Austria: "Áustria",
  Jordan: "Jordânia",
  Portugal: "Portugal",
  "DR Congo": "RD Congo",
  Uzbekistan: "Uzbequistão",
  Colombia: "Colômbia",
  England: "Inglaterra",
  Croatia: "Croácia",
  Ghana: "Gana",
  Panama: "Panamá",
}

interface OFScore {
  ft?: [number, number] // tempo normal (90 min)
  et?: [number, number] // após prorrogação (acumulado)
  p?: [number, number] // disputa de pênaltis
}

interface OFMatch {
  team1: string
  team2: string
  score?: OFScore
}

/**
 * Determina o time que avança num confronto de mata-mata a partir do placar
 * externo. Considera pênaltis, depois prorrogação, depois tempo normal.
 */
function computeAdvance(
  home: string,
  away: string,
  score: OFScore,
): string | null {
  if (score.p) {
    if (score.p[0] === score.p[1]) return null
    return score.p[0] > score.p[1] ? home : away
  }
  const final = score.et ?? score.ft
  if (!final) return null
  if (final[0] > final[1]) return home
  if (final[1] > final[0]) return away
  return null
}

interface OFData {
  matches: OFMatch[]
}

const localMatches: Match[] = (matchesData as MatchesData).matches

/** Converte nome EN para PT-BR, ou retorna o original se não encontrado */
function toPtBr(name: string): string {
  return NAME_MAP[name] ?? name
}

/**
 * Busca os resultados da fonte externa e retorna um mapa
 * matchId (string) → MatchResult { score, advance }.
 *
 * - `score` é o placar do tempo normal (90 min).
 * - `advance` é o time que se classificou (apenas mata-mata). Para a fase de
 *   grupos é sempre null. No mata-mata, considera pênaltis > prorrogação >
 *   tempo normal.
 *
 * Jogos sem placar confirmado não aparecem no mapa.
 */
export async function fetchExternalResults(): Promise<
  Record<string, MatchResult>
> {
  const res = await fetch(OPENFOOTBALL_URL, {
    next: { revalidate: 300 }, // revalida a cada 5 minutos
  })

  if (!res.ok) {
    throw new Error(`Erro ao buscar openfootball: ${res.status}`)
  }

  const data: OFData = await res.json()

  // Indexa os jogos externos por par de times (PT-BR) → placar completo
  const externalMap = new Map<string, OFScore>()
  for (const m of data.matches) {
    if (!m.score?.ft) continue
    const key = `${toPtBr(m.team1)}|${toPtBr(m.team2)}`
    externalMap.set(key, m.score)
  }

  // Mapeia para IDs internos
  const results: Record<string, MatchResult> = {}
  for (const match of localMatches) {
    const key = `${match.home}|${match.away}`
    const score = externalMap.get(key)
    if (!score?.ft) continue

    const ftScore: Score = score.ft
    const advance =
      match.stage === "knockout"
        ? computeAdvance(match.home, match.away, score)
        : null

    results[String(match.id)] = { score: ftScore, advance }
  }

  return results
}
