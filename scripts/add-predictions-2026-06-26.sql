WITH incoming(participant_id, match_id, home_goals, away_goals, kickoff) AS (
  VALUES
    ('GW', 61, 2, 1, timestamptz '2026-06-27T03:00:00Z'),
    ('BB', 61, 3, 2, timestamptz '2026-06-27T03:00:00Z'),
    ('LS', 61, 2, 1, timestamptz '2026-06-27T03:00:00Z'),
    ('EP', 61, 2, 2, timestamptz '2026-06-27T03:00:00Z'),
    ('GW', 62, 1, 1, timestamptz '2026-06-27T03:00:00Z'),
    ('BB', 62, 1, 1, timestamptz '2026-06-27T03:00:00Z'),
    ('LS', 62, 0, 1, timestamptz '2026-06-27T03:00:00Z'),
    ('EP', 62, 1, 1, timestamptz '2026-06-27T03:00:00Z'),
    ('GW', 63, 2, 1, timestamptz '2026-06-27T00:00:00Z'),
    ('BB', 63, 2, 1, timestamptz '2026-06-27T00:00:00Z'),
    ('LS', 63, 2, 0, timestamptz '2026-06-27T00:00:00Z'),
    ('EP', 63, 3, 2, timestamptz '2026-06-27T00:00:00Z'),
    ('GW', 64, 1, 2, timestamptz '2026-06-27T00:00:00Z'),
    ('BB', 64, 2, 3, timestamptz '2026-06-27T00:00:00Z'),
    ('LS', 64, 1, 2, timestamptz '2026-06-27T00:00:00Z'),
    ('EP', 64, 0, 1, timestamptz '2026-06-27T00:00:00Z'),
    ('GW', 65, 2, 3, timestamptz '2026-06-26T19:00:00Z'),
    ('BB', 65, 2, 2, timestamptz '2026-06-26T19:00:00Z'),
    ('LS', 65, 2, 3, timestamptz '2026-06-26T19:00:00Z'),
    ('EP', 65, 1, 2, timestamptz '2026-06-26T19:00:00Z'),
    ('GW', 66, 3, 1, timestamptz '2026-06-26T19:00:00Z'),
    ('BB', 66, 2, 0, timestamptz '2026-06-26T19:00:00Z'),
    ('LS', 66, 2, 1, timestamptz '2026-06-26T19:00:00Z'),
    ('EP', 66, 3, 1, timestamptz '2026-06-26T19:00:00Z'),
    ('GW', 67, 1, 1, timestamptz '2026-06-28T02:00:00Z'),
    ('BB', 67, 1, 1, timestamptz '2026-06-28T02:00:00Z'),
    ('EP', 67, 2, 1, timestamptz '2026-06-28T02:00:00Z'),
    ('GW', 68, 1, 3, timestamptz '2026-06-28T02:00:00Z'),
    ('BB', 68, 0, 3, timestamptz '2026-06-28T02:00:00Z'),
    ('EP', 68, 0, 3, timestamptz '2026-06-28T02:00:00Z'),
    ('GW', 69, 2, 2, timestamptz '2026-06-27T23:30:00Z'),
    ('BB', 69, 1, 2, timestamptz '2026-06-27T23:30:00Z'),
    ('LS', 69, 1, 2, timestamptz '2026-06-27T23:30:00Z'),
    ('EP', 69, 3, 3, timestamptz '2026-06-27T23:30:00Z'),
    ('GW', 70, 2, 0, timestamptz '2026-06-27T23:30:00Z'),
    ('BB', 70, 1, 0, timestamptz '2026-06-27T23:30:00Z'),
    ('LS', 70, 1, 0, timestamptz '2026-06-27T23:30:00Z'),
    ('EP', 70, 2, 1, timestamptz '2026-06-27T23:30:00Z'),
    ('GW', 71, 1, 3, timestamptz '2026-06-27T21:00:00Z'),
    ('BB', 71, 0, 3, timestamptz '2026-06-27T21:00:00Z'),
    ('LS', 71, 0, 4, timestamptz '2026-06-27T21:00:00Z'),
    ('EP', 71, 0, 2, timestamptz '2026-06-27T21:00:00Z'),
    ('GW', 72, 0, 1, timestamptz '2026-06-27T21:00:00Z'),
    ('BB', 72, 2, 1, timestamptz '2026-06-27T21:00:00Z'),
    ('LS', 72, 3, 2, timestamptz '2026-06-27T21:00:00Z'),
    ('EP', 72, 1, 0, timestamptz '2026-06-27T21:00:00Z')
),
upserted AS (
  INSERT INTO predictions (participant_id, match_id, home_goals, away_goals, updated_at)
  SELECT participant_id, match_id, home_goals, away_goals, now()
  FROM incoming
  WHERE kickoff > now()
  ON CONFLICT (participant_id, match_id) DO UPDATE
    SET home_goals = EXCLUDED.home_goals,
        away_goals = EXCLUDED.away_goals,
        updated_at = now()
  RETURNING participant_id, match_id, home_goals, away_goals
)
SELECT count(*) AS palpites_gravados FROM upserted;
