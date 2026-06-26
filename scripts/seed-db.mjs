#!/usr/bin/env node
// Migra participantes e palpites do data/predictions.json para o banco Neon.
// Uso: node --env-file=/vercel/share/.env.project scripts/seed-db.mjs
//
// Idempotente: usa ON CONFLICT para não duplicar. Não sobrescreve palpites
// já existentes no banco (preserva o que foi enviado pelo site).

import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import pg from "pg"

const __dirname = dirname(fileURLToPath(import.meta.url))
const data = JSON.parse(
  readFileSync(join(__dirname, "..", "data", "predictions.json"), "utf8"),
)

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

async function main() {
  const client = await pool.connect()
  try {
    for (const p of data.participants) {
      await client.query(
        `INSERT INTO participants (id, name) VALUES ($1, $2)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name`,
        [p.id, p.name],
      )
    }
    console.log(`Participantes migrados: ${data.participants.length}`)

    let count = 0
    for (const [matchId, byParticipant] of Object.entries(data.predictions)) {
      for (const [participantId, score] of Object.entries(byParticipant)) {
        await client.query(
          `INSERT INTO predictions (participant_id, match_id, home_goals, away_goals)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (participant_id, match_id) DO NOTHING`,
          [participantId, Number(matchId), score[0], score[1]],
        )
        count++
      }
    }
    console.log(`Palpites processados: ${count}`)
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
