// src/lib/game-balance.constants.ts
// Costanti di bilanciamento centralizzate del gioco.
// Tutti i file consumer importano da qui invece di hardcodare valori inline.

// ── Limiti statistiche ────────────────────────────────────────────────────────

export const STAT_CAPS = {
  default: { min: 0, max: 100 },
  soldi:   { min: 0, max: 1000 },
  media:   { min: 0, max: 10 },
} as const

// ── Relazioni (scala unificata [0,100]) ───────────────────────────────────────

export const RELATION = {
  MIN: 0,
  MAX: 100,
  NEUTRAL: 50,
  CLASSMATE_PROMOTION_THRESHOLD: 65,
  TEACHER_ISTERESI: 10,
} as const

// ── Economia ──────────────────────────────────────────────────────────────────

export const ECONOMY = {
  PAGHETTA_SETTIMANALE: 50,
  PALESTRA_COSTO: 20,
  LAMPADA_COSTO: 30,
  CORRUZIONE_COSTO: 50,
  BAR_COSTO: 2,
  DISCO_COSTO: 30,
  CINEMA_COSTO: 15,
  SHOPPING_COSTO: 40,
} as const

// ── Scuola ────────────────────────────────────────────────────────────────────

export const SCHOOL = {
  ASSENZE_SCANDALO: 35,
  ASSENZE_WARNING: 25,
  ASSENZE_MULTA: 15,
  MULTA_IMPORTO: 50,
  CONDOTTA_BONUS_INTERVALLO: 5,   // ogni N giorni
  CONDOTTA_BONUS_VALORE: 0.3,
  EXAM_CHANCE_PER_DAY: 0.30,
  MAX_SCHEDULED_EXAMS: 3,
} as const

// ── Formula reputazione ───────────────────────────────────────────────────────

export const REPUTATION_WEIGHTS = {
  coattaggine: 0.25,
  muscoli: 0.15,
  figosita: 0.20,
  soldi: 0.10,
  media: 0.10,
  carisma: 0.20,
} as const

// ── Scommesse ─────────────────────────────────────────────────────────────────

export const BET = {
  BASE_AMOUNT: 10,
  REP_MULTIPLIER: 5,
  REP_DIVISOR: 20,
  DIFF_MULTIPLIER: 5,
  MAX_BET: 60,
} as const
