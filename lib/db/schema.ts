import { integer, pgTable, serial, text, timestamp, unique } from "drizzle-orm/pg-core"

// Participantes do bolão. O id é uma sigla curta (ex: "GW") usada nas referências.
export const participants = pgTable("participants", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

// Palpites: um por (participante, jogo). `advance` guarda o time que o
// participante acha que avança no mata-mata (usado em caso de empate / pênaltis).
export const predictions = pgTable(
  "predictions",
  {
    id: serial("id").primaryKey(),
    participantId: text("participant_id").notNull(),
    matchId: integer("match_id").notNull(),
    homeGoals: integer("home_goals").notNull(),
    awayGoals: integer("away_goals").notNull(),
    advance: text("advance"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    participantMatchUnique: unique("predictions_participant_match_unique").on(
      table.participantId,
      table.matchId,
    ),
  }),
)

export type ParticipantRow = typeof participants.$inferSelect
export type PredictionRow = typeof predictions.$inferSelect
