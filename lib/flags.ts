// Mapeia nomes de seleções (PT-BR usados nos dados) para códigos ISO de país,
// usados para exibir a bandeira via flagcdn. Placeholders do mata-mata (ex: "2A", "W74") retornam null.
const TEAM_CODES: Record<string, string> = {
  "México": "mx",
  "África do Sul": "za",
  "Coreia do Sul": "kr",
  "Rep. Tcheca": "cz",
  "Canadá": "ca",
  "Bósnia": "ba",
  "Catar": "qa",
  "Suíça": "ch",
  "Brasil": "br",
  "Marrocos": "ma",
  "Haiti": "ht",
  "Escócia": "gb-sct",
  "Estados Unidos": "us",
  "Paraguai": "py",
  "Austrália": "au",
  "Turquia": "tr",
  "Alemanha": "de",
  "Curaçao": "cw",
  "Costa do Marfim": "ci",
  "Equador": "ec",
  "Holanda": "nl",
  "Japão": "jp",
  "Suécia": "se",
  "Tunísia": "tn",
  "Bélgica": "be",
  "Egito": "eg",
  "Irã": "ir",
  "Nova Zelândia": "nz",
  "Espanha": "es",
  "Cabo Verde": "cv",
  "Arábia Saudita": "sa",
  "Uruguai": "uy",
  "França": "fr",
  "Senegal": "sn",
  "Iraque": "iq",
  "Noruega": "no",
  "Argentina": "ar",
  "Argélia": "dz",
  "Áustria": "at",
  "Jordânia": "jo",
  "Portugal": "pt",
  "RD Congo": "cd",
  "Uzbequistão": "uz",
  "Colômbia": "co",
  "Inglaterra": "gb-eng",
  "Croácia": "hr",
  "Gana": "gh",
  "Panamá": "pa",
}

export function flagUrl(team: string): string | null {
  const code = TEAM_CODES[team]
  if (!code) return null
  return `https://flagcdn.com/w40/${code}.png`
}

export function isPlaceholder(team: string): boolean {
  return TEAM_CODES[team] === undefined
}
