// src/lib/relation-system.ts
// Sistema relazioni a 4 assi — ZERO dipendenze React, solo TypeScript puro.
// Compatibile con il sistema Friend legacy tramite migrateLegacyFriend().

import type { Friend, FriendType, GameStats, GameDate } from '@/lib/types'

// ── Tipi ──────────────────────────────────────────────────────────────────────

export interface RelationStats {
  amicizia:  number  // 0-100 — vicinanza, fiducia, tempo passato insieme
  romantico: number  // 0-100 — attrazione, flirt, tensione sentimentale
  amore:     number  // 0-100 — legame profondo (condizionato)
  odio:      number  // 0-100 — risentimento, rivalità, tradimenti accumulati
  rivalita?: number  // 0-100, default 0 — competizione pubblica/reputazionale, asse indipendente, NON impatta tier
}

export type RelationTierV2 =
  | 'sconosciuto'
  | 'conoscente'
  | 'amico'
  | 'amico_stretto'
  | 'migliore_amico'
  | 'interesse_romantico'
  | 'innamorato_a'
  | 'fidanzato_a'
  | 'rivale'
  | 'nemico_giurato'

export interface RelationEffects {
  amicizia?:  number
  romantico?: number
  amore?:     number
  odio?:      number
  rivalita?:  number  // asse rivalità — NON entra nel tier
  statsEffects?: Partial<GameStats>
}

export interface InteractionDef {
  id:           string
  category:     number         // 0-7
  categoryLabel: string
  label:        string
  description:  string
  prereq:       {
    amicizia?:  number
    romantico?: number
    amore?:     number
    odio?:      number         // minimo richiesto
    odioMax?:   number         // massimo consentito
    amiciziaMin?: number
  }
  effects:      RelationEffects
  failEffects?: RelationEffects
  failChance?:  number         // 0-100. Assente = deterministico
}

// ── Costanti ──────────────────────────────────────────────────────────────────

export const DEFAULT_RELATION_STATS: RelationStats = {
  amicizia: 0, romantico: 0, amore: 0, odio: 0, rivalita: 0
}

export const ORIGIN_INITIAL_STATS: Record<
  'compagno_classe' | 'compagno_istituto' | 'extrascolastico',
  RelationStats
> = {
  compagno_classe:    { amicizia: 15, romantico: 0, amore: 0, odio: 0, rivalita: 0 },
  compagno_istituto:  { amicizia: 5,  romantico: 0, amore: 0, odio: 0, rivalita: 0 },
  extrascolastico:    { amicizia: 10, romantico: 0, amore: 0, odio: 0, rivalita: 0 },
}

/** Bonus probabilità incontro nuovo amico per location */
export const LOCATION_PROB_BONUS: Record<string, number> = {
  classe:     10,
  corridoio:  5,
  quartiere:  0,
  palestra:   8,
  online:     3,
  festa:      15,
  sport:      5,
  lavoro:     5,
}

/**
 * Peso FriendType per location (valori: probabilità relativa 0-100).
 * La somma per ogni location non deve necessariamente fare 100 — viene
 * usata come distribuzione pesata con Math.random().
 */
export const MET_AT_TYPE_WEIGHTS: Record<string, Partial<Record<FriendType, number>>> = {
  classe:     { coatto: 25, secchione: 25, sportivo: 25, ribelle: 25 },
  corridoio:  { coatto: 25, secchione: 25, sportivo: 25, ribelle: 25 },
  quartiere:  { coatto: 50, ribelle: 30, sportivo: 10, secchione: 5, generico: 5 },
  palestra:   { sportivo: 60, coatto: 30, ribelle: 5, secchione: 3, generico: 2 },
  online:     { secchione: 40, generico: 40, ribelle: 20 },
  festa:      { coatto: 35, sportivo: 25, ribelle: 25, secchione: 5, generico: 10 },
  sport:      { sportivo: 70, coatto: 15, ribelle: 10, generico: 5 },
  lavoro:     { generico: 50, secchione: 30, coatto: 10, ribelle: 10 },
}

// ── Catalogo interazioni ───────────────────────────────────────────────────────

export const INTERACTION_CATALOG: Record<string, InteractionDef> = {

  // ── CAT 0 — CORTESIA ────────────────────────────────────────────────────────
  saluta: {
    id: 'saluta', category: 0, categoryLabel: 'Cortesia',
    label: 'Saluta',
    description: 'Un saluto veloce nel corridoio.',
    prereq: {},
    effects: { amicizia: 2, odio: -1 },
  },
  presenta_te: {
    id: 'presenta_te', category: 0, categoryLabel: 'Cortesia',
    label: 'Presentati',
    description: 'Ti presenti per la prima volta.',
    prereq: {},
    effects: { amicizia: 3 },
    // Applicato solo se amicizia < 5 (verificato in applyInteractionEffects)
  },
  fai_complimento: {
    id: 'fai_complimento', category: 0, categoryLabel: 'Cortesia',
    label: 'Fai un complimento',
    description: 'Gli/le fai un complimento generico.',
    prereq: {},
    effects: { amicizia: 2, romantico: 2 },
  },
  sorridi: {
    id: 'sorridi', category: 0, categoryLabel: 'Cortesia',
    label: 'Sorridi',
    description: 'Un sorriso basta a volte.',
    prereq: {},
    effects: { amicizia: 1 },
  },
  ignora: {
    id: 'ignora', category: 0, categoryLabel: 'Cortesia',
    label: 'Ignoralo/a',
    description: 'Lo/la ignori deliberatamente.',
    prereq: {},
    effects: { amicizia: -2, odio: 3 },
  },

  // ── CAT 1 — CONOSCENZA ──────────────────────────────────────────────────────
  chiacchiera: {
    id: 'chiacchiera', category: 1, categoryLabel: 'Conoscenza',
    label: 'Chiacchiera',
    description: 'Fate due chiacchiere di niente.',
    prereq: { amicizia: 10 },
    effects: { amicizia: 4 },
  },
  fai_battuta: {
    id: 'fai_battuta', category: 1, categoryLabel: 'Conoscenza',
    label: 'Fai una battuta',
    description: 'Gli/le lanci una battuta — non sempre funziona.',
    prereq: { amicizia: 10 },
    effects: { amicizia: 3 },
    failEffects: { amicizia: -1, odio: 2 },
    failChance: 25,
  },
  chiedi_come_stai: {
    id: 'chiedi_come_stai', category: 1, categoryLabel: 'Conoscenza',
    label: 'Chiedi come sta',
    description: 'Mostri interesse genuino per come sta.',
    prereq: { amicizia: 10 },
    effects: { amicizia: 3 },
    // amore +1 applicato condizionatamente (solo se amore > 0) in applyInteractionEffects
  },
  scambia_contatto: {
    id: 'scambia_contatto', category: 1, categoryLabel: 'Conoscenza',
    label: 'Scambia contatto',
    description: 'Ti scambi il numero di telefono.',
    prereq: { amicizia: 10 },
    effects: { amicizia: 5 },
  },
  racconta_barzelletta: {
    id: 'racconta_barzelletta', category: 1, categoryLabel: 'Conoscenza',
    label: 'Racconta una barzelletta',
    description: 'Provi a farlo/a ridere.',
    prereq: { amicizia: 10 },
    effects: { amicizia: 2, romantico: 1 },
    failEffects: { amicizia: -1 },
    failChance: 20,
  },

  // ── CAT 2 — AMICIZIA ────────────────────────────────────────────────────────
  esci_insieme: {
    id: 'esci_insieme', category: 2, categoryLabel: 'Amicizia',
    label: 'Esci insieme',
    description: 'Uscite a fare un giro insieme.',
    prereq: { amicizia: 30 },
    effects: { amicizia: 6, romantico: 3, statsEffects: { soldi: -10 } },
  },
  condividi_segreto: {
    id: 'condividi_segreto', category: 2, categoryLabel: 'Amicizia',
    label: 'Condividi un segreto',
    description: 'Gli/le confidi qualcosa di personale.',
    prereq: { amicizia: 30 },
    effects: { amicizia: 8, odio: -5 },
    failEffects: { amicizia: -5, odio: 10 },
    failChance: 15,
  },
  chiedi_consiglio: {
    id: 'chiedi_consiglio', category: 2, categoryLabel: 'Amicizia',
    label: 'Chiedi consiglio',
    description: 'Gli/le chiedi un parere su qualcosa.',
    prereq: { amicizia: 30 },
    effects: { amicizia: 5 },
  },
  fai_un_favore: {
    id: 'fai_un_favore', category: 2, categoryLabel: 'Amicizia',
    label: 'Fai un favore',
    description: 'Gli/le fai un favore senza chiedere niente.',
    prereq: { amicizia: 30 },
    effects: { amicizia: 7, odio: -3 },
  },
  prenditi_gioco: {
    id: 'prenditi_gioco', category: 2, categoryLabel: 'Amicizia',
    label: 'Prenditi gioco',
    description: 'Gli/le prendi un po\' in giro — rischio.',
    prereq: { amicizia: 30 },
    effects: { amicizia: 3 },
    failEffects: { amicizia: -5, odio: 8 },
    failChance: 35,
  },
  litiga: {
    id: 'litiga', category: 2, categoryLabel: 'Amicizia',
    label: 'Litiga',
    description: 'Ve la dite di tutti i colori.',
    prereq: { amicizia: 30 },
    effects: { amicizia: -10, odio: 15 },
  },

  // ── CAT 3 — AMICIZIA STRETTA ─────────────────────────────────────────────────
  confida_problema: {
    id: 'confida_problema', category: 3, categoryLabel: 'Amicizia Stretta',
    label: 'Confida un problema',
    description: 'Gli/le parli di qualcosa che ti pesa davvero.',
    prereq: { amicizia: 60 },
    effects: { amicizia: 10 },
    // amore +5 condizionato (romantico >= 20) gestito in applyInteractionEffects
  },
  chiedi_prestito: {
    id: 'chiedi_prestito', category: 3, categoryLabel: 'Amicizia Stretta',
    label: 'Chiedi un prestito',
    description: 'Gli/le chiedi di prestarti dei soldi.',
    prereq: { amicizia: 60 },
    effects: { amicizia: -10, statsEffects: { soldi: 35 } },
    // soldi: random 20-50, usato valore medio 35; handler applica random reale
  },
  difendi: {
    id: 'difendi', category: 3, categoryLabel: 'Amicizia Stretta',
    label: 'Difendi dall\'aggressore',
    description: 'Prendi le sue difese contro qualcuno.',
    prereq: { amicizia: 60 },
    effects: { amicizia: 12, odio: -8 },
    failEffects: { amicizia: 5, statsEffects: { reputazione: -5 } },
    failChance: 20,
  },
  studia_insieme: {
    id: 'studia_insieme', category: 3, categoryLabel: 'Amicizia Stretta',
    label: 'Studia insieme',
    description: 'Fate i compiti e studiate insieme.',
    prereq: { amicizia: 60 },
    effects: { amicizia: 6, statsEffects: { media: 0.2 } },
    // media +0.5 se type === 'secchione' gestito in applyInteractionEffects
  },
  festa_insieme: {
    id: 'festa_insieme', category: 3, categoryLabel: 'Amicizia Stretta',
    label: 'Organizza una festa',
    description: 'Organizzate una mini-festa insieme.',
    prereq: { amicizia: 60 },
    effects: { amicizia: 8, romantico: 5, statsEffects: { soldi: -30 } },
  },

  // ── CAT 4 — FLIRT LEGGERO ────────────────────────────────────────────────────
  flirta: {
    id: 'flirta', category: 4, categoryLabel: 'Flirt Leggero',
    label: 'Flirta',
    description: 'Ci provi in modo leggero.',
    prereq: { romantico: 20, odioMax: 39 },
    effects: { romantico: 5 },
    failEffects: { amicizia: -5, odio: 5 },
    failChance: 30,
  },
  fai_occhiolino: {
    id: 'fai_occhiolino', category: 4, categoryLabel: 'Flirt Leggero',
    label: 'Fai l\'occhiolino',
    description: 'Un gesto leggero e ambiguo.',
    prereq: { romantico: 20, odioMax: 39 },
    effects: { romantico: 3 },
    failEffects: { romantico: -1 },
    failChance: 15,
  },
  complimento_fisico: {
    id: 'complimento_fisico', category: 4, categoryLabel: 'Flirt Leggero',
    label: 'Complimento fisico',
    description: 'Gli/le fai un complimento sull\'aspetto.',
    prereq: { romantico: 20, odioMax: 39 },
    effects: { romantico: 4 },
    failEffects: { odio: 2 },
    failChance: 25,
  },

  // ── CAT 5 — INTERESSE ROMANTICO ──────────────────────────────────────────────
  invita_fuori: {
    id: 'invita_fuori', category: 5, categoryLabel: 'Interesse Romantico',
    label: 'Invita fuori',
    description: 'Gli/le proponi di uscire insieme, in modo esplicito.',
    prereq: { romantico: 50, amicizia: 20 },
    effects: { romantico: 8, amicizia: 5 },
    failEffects: { romantico: -10 },
    failChance: 25,
  },
  regala_qualcosa: {
    id: 'regala_qualcosa', category: 5, categoryLabel: 'Interesse Romantico',
    label: 'Regala qualcosa',
    description: 'Gli/le porti un piccolo regalo.',
    prereq: { romantico: 50, amicizia: 20 },
    effects: { romantico: 8, amore: 5, statsEffects: { soldi: -20 } },
  },
  dedica_canzone: {
    id: 'dedica_canzone', category: 5, categoryLabel: 'Interesse Romantico',
    label: 'Dedica una canzone',
    description: 'Gli/le dedichi una canzone — romantico ma rischioso.',
    prereq: { romantico: 50, amicizia: 20 },
    effects: { romantico: 6, amore: 4 },
    failEffects: { romantico: -5 },
    failChance: 20,
  },

  // ── CAT 6 — AMORE ─────────────────────────────────────────────────────────
  dichiara_amore: {
    id: 'dichiara_amore', category: 6, categoryLabel: 'Amore',
    label: 'Dichiarati',
    description: 'Gli/le dici quello che provi davvero.',
    prereq: { amore: 40, romantico: 50 },
    effects: { amore: 15 },
    failEffects: { amore: -15, romantico: -10 },
    failChance: 30,
  },
  bacio: {
    id: 'bacio', category: 6, categoryLabel: 'Amore',
    label: 'Bacio',
    description: 'Il primo bacio — richiede amore >= 40 e romantico >= 50.',
    prereq: { amore: 40, romantico: 50 },
    effects: { amore: 10, romantico: 5 },
  },
  litigate_coppia: {
    id: 'litigate_coppia', category: 6, categoryLabel: 'Amore',
    label: 'Litiga da coppia',
    description: 'Una lite seria, da innamorati.',
    prereq: { amore: 40, romantico: 50 },
    effects: { amore: -15, odio: 10 },
  },

  // ── CAT 7 — CONFLITTO ─────────────────────────────────────────────────────
  insulta: {
    id: 'insulta', category: 7, categoryLabel: 'Conflitto',
    label: 'Insulta',
    description: 'Gli/le dici cose brutte.',
    prereq: { odio: 30 },
    effects: { odio: 15, amicizia: -10 },
  },
  sfida: {
    id: 'sfida', category: 7, categoryLabel: 'Conflitto',
    label: 'Sfida',
    description: 'Lo/la sfidi fisicamente o verbalmente.',
    prereq: { odio: 30 },
    effects: { odio: 20, statsEffects: { reputazione: 10 } },
    failEffects: { odio: 20, statsEffects: { reputazione: -5 } },
    failChance: 40,
  },
  chiedi_scusa: {
    id: 'chiedi_scusa', category: 7, categoryLabel: 'Conflitto',
    label: 'Chiedi scusa',
    description: 'Fai il primo passo per riconciliarti.',
    prereq: {},  // disponibile sempre
    effects: { odio: -15, amicizia: 5 },
    // bonus amicizia solo se odio > 30, gestito in applyInteractionEffects
  },
  ignora_volutamente: {
    id: 'ignora_volutamente', category: 7, categoryLabel: 'Conflitto',
    label: 'Ignora volutamente',
    description: 'Lo/la ignori in modo ostentato e deliberato.',
    prereq: { odio: 30 },
    effects: { amicizia: -8, odio: 10 },
  },

  // ── CAT 7 — CONFLITTO (antagoniste) ────────────────────────────────────────
  litigata_furiosa: {
    id: 'litigata_furiosa', category: 7, categoryLabel: 'Conflitto',
    label: 'Litigata furiosa',
    description: 'Una lite feroce, senza freni.',
    prereq: { odio: 20 },
    effects: { amicizia: -15, odio: 12, rivalita: 25 },
  },

  sfida_pubblica: {
    id: 'sfida_pubblica', category: 7, categoryLabel: 'Conflitto',
    label: 'Sfida pubblica',
    description: 'Lo/la sfidi davanti a tutti — questione di onore.',
    prereq: { odio: 15 },
    effects: { amicizia: -8, rivalita: 15, statsEffects: { morale: -10 } },
    failEffects: { amicizia: -12, rivalita: 20, odio: 5, statsEffects: { reputazione: -5 } },
    failChance: 40,
  },

  insulto_diretto: {
    id: 'insulto_diretto', category: 7, categoryLabel: 'Conflitto',
    label: 'Insulto diretto',
    description: 'Parole pesanti, a bruciapelo.',
    prereq: { odio: 10 },
    effects: { amicizia: -10, odio: 15, rivalita: 20 },
  },

  sgarro_reputazione: {
    id: 'sgarro_reputazione', category: 7, categoryLabel: 'Conflitto',
    label: 'Sgarro alla reputazione',
    description: 'Spargi voci e gli/le rovini la reputazione.',
    prereq: { odio: 25 },
    effects: { amicizia: -20, odio: 20, rivalita: 30, statsEffects: { reputazione: 5 } },
    failEffects: { amicizia: -10, odio: 25, rivalita: 15, statsEffects: { reputazione: -10 } },
    failChance: 35,
  },
}

// ── Funzioni core ─────────────────────────────────────────────────────────────

/** Clampa tutti i valori di RelationStats nell'intervallo 0-100 */
export function clampRel(rel: RelationStats): RelationStats {
  return {
    amicizia:  Math.max(0, Math.min(100, Math.round(rel.amicizia))),
    romantico: Math.max(0, Math.min(100, Math.round(rel.romantico))),
    amore:     Math.max(0, Math.min(100, Math.round(rel.amore))),
    odio:      Math.max(0, Math.min(100, Math.round(rel.odio))),
    rivalita:  Math.max(0, Math.min(100, Math.round(rel.rivalita ?? 0))),
  }
}

/**
 * Calcola il tier V2 da un RelationStats, con uscita anticipata.
 * Ordine: odio → amore → romantico → amicizia → default.
 */
export function getRelationTierV2(rel: RelationStats): RelationTierV2 {
  if (rel.odio >= 80) return 'nemico_giurato'
  if (rel.odio >= 50) return 'rivale'
  if (rel.amore >= 70 && rel.romantico >= 60) return 'fidanzato_a'
  if (rel.amore >= 40 && rel.romantico >= 50) return 'innamorato_a'
  if (rel.romantico >= 60)                    return 'interesse_romantico'
  if (rel.amicizia >= 85)                     return 'migliore_amico'
  if (rel.amicizia >= 60)                     return 'amico_stretto'
  if (rel.amicizia >= 30)                     return 'amico'
  if (rel.amicizia >= 10)                     return 'conoscente'
  return 'sconosciuto'
}

/** Label con emoji per RelationTierV2 */
export function getRelationTierV2Label(tier: RelationTierV2): string {
  const labels: Record<RelationTierV2, string> = {
    sconosciuto:         '👤 Sconosciuto',
    conoscente:          '🙂 Conoscente',
    amico:               '😊 Amico',
    amico_stretto:       '😎 Amico Stretto',
    migliore_amico:      '👑 Migliore Amico',
    interesse_romantico: '🌸 Interesse Romantico',
    innamorato_a:        '💕 Innamorato/a',
    fidanzato_a:         '❤️ Fidanzato/a',
    rivale:              '⚔️ Rivale',
    nemico_giurato:      '💀 Nemico Giurato',
  }
  return labels[tier]
}

// ── Rivalry tier (asse indipendente) ─────────────────────────────────────────

export type RivalryTier = 'neutro' | 'rivale' | 'nemico_giurato'

export function getRivalryTier(rivalita: number): RivalryTier {
  if (rivalita >= 70) return 'nemico_giurato'
  if (rivalita >= 30) return 'rivale'
  return 'neutro'
}

export function getRivalryTierLabel(tier: RivalryTier): string {
  const labels: Record<RivalryTier, string> = {
    neutro:         'Neutro',
    rivale:         '⚔️ Rivale',
    nemico_giurato: '💀 Nemico Giurato',
  }
  return labels[tier]
}

/**
 * Getter di compatibilità: restituisce il valore di affinità del Friend
 * sia nel formato legacy (affinita: number) sia nel nuovo (rel.amicizia).
 */
export function getAffinita(friend: Friend): number {
  if (friend.rel != null) return friend.rel.amicizia
  if (friend.affinita != null) return friend.affinita
  return 50
}

/**
 * Converte una GameDate in un indice progressivo di giorni.
 * NOTA: approssimazione (mesi = 30gg fissi). Adatta solo a confronti
 * relativi di inattività. Non usare per calcoli di data precisi.
 */
export function dateToDayIndex(date: GameDate): number {
  return (date.year - 2026) * 365 + (date.month - 1) * 30 + date.day
}

/**
 * Funzione di migrazione idempotente: se il Friend ha già `rel`, lo ritorna
 * invariato. Altrimenti crea `rel` a partire da `affinita` legacy.
 */
export function migrateLegacyFriend(f: Friend): Friend {
  if (f.rel != null) {
    // Assicura che rivalita esista anche in friend migrati in precedenza
    if (f.rel.rivalita == null) {
      return { ...f, rel: { ...f.rel, rivalita: 0 } }
    }
    return f
  }
  const affinita = f.affinita ?? 50
  const originType = f.originType ?? 'extrascolastico'
  return {
    ...f,
    originType,
    rel: {
      amicizia:  Math.max(0, Math.min(100, affinita)),
      romantico: 0,
      amore:     0,
      odio:      0,
      rivalita:  0,
    },
  }
}

/**
 * Verifica se un'interazione è disponibile date le RelationStats attuali.
 * Restituisce { canUse: true } oppure { canUse: false, reason: '...' }.
 */
export function checkInteractionAvailable(
  id: string,
  rel: RelationStats
): { canUse: boolean; reason?: string } {
  const def = INTERACTION_CATALOG[id]
  if (!def) return { canUse: false, reason: 'Interazione non trovata' }

  const { prereq } = def

  if (prereq.amicizia != null && rel.amicizia < prereq.amicizia) {
    return { canUse: false, reason: `Amicizia insufficiente (min ${prereq.amicizia})` }
  }
  if (prereq.romantico != null && rel.romantico < prereq.romantico) {
    return { canUse: false, reason: `Romantico insufficiente (min ${prereq.romantico})` }
  }
  if (prereq.amore != null && rel.amore < prereq.amore) {
    return { canUse: false, reason: `Amore insufficiente (min ${prereq.amore})` }
  }
  if (prereq.odio != null && rel.odio < prereq.odio) {
    return { canUse: false, reason: `Conflitto insufficiente (min odio ${prereq.odio})` }
  }
  if (prereq.odioMax != null && rel.odio > prereq.odioMax) {
    return { canUse: false, reason: `Odio troppo alto (max ${prereq.odioMax})` }
  }

  return { canUse: true }
}

/**
 * Applica gli effetti di un'interazione a RelationStats e GameStats.
 * Pure function: restituisce nuovi oggetti, non muta gli input.
 *
 * Gestisce:
 * - failChance: lancio casuale per determinare successo/fallimento
 * - Regole speciali: amore condizionato, presenta_te solo se amicizia < 5,
 *   chiedi_scusa bonus solo se odio > 30, studia_insieme bonus se secchione,
 *   confida_problema amore condizionato a romantico >= 20,
 *   chiedi_prestito: soldi random 20-50
 */
export function applyInteractionEffects(
  id: string,
  rel: RelationStats,
  stats: GameStats,
  friendType?: FriendType
): {
  newRel: RelationStats
  newStats: Partial<GameStats>
  message: string
  success: boolean
} {
  const def = INTERACTION_CATALOG[id]
  if (!def) {
    return { newRel: rel, newStats: {}, message: 'Interazione non trovata.', success: false }
  }

  // Determina successo/fallimento
  const success = def.failChance == null || Math.random() * 100 >= def.failChance
  const effectsToApply = success ? def.effects : (def.failEffects ?? def.effects)

  // Copia mutabile delle relazioni
  let newRel: RelationStats = { ...rel }
  const newStats: Partial<GameStats> = {}

  // Applica delta relazionali
  if (effectsToApply.amicizia  != null) newRel.amicizia  += effectsToApply.amicizia
  if (effectsToApply.romantico != null) newRel.romantico += effectsToApply.romantico
  if (effectsToApply.amore     != null) newRel.amore     += effectsToApply.amore
  if (effectsToApply.odio      != null) newRel.odio      += effectsToApply.odio
  if (effectsToApply.rivalita  != null) newRel.rivalita   = (newRel.rivalita ?? 0) + effectsToApply.rivalita

  // Applica effetti su GameStats
  if (effectsToApply.statsEffects) {
    Object.assign(newStats, effectsToApply.statsEffects)
  }

  // ── Regole speciali ──────────────────────────────────────────────────────

  // presenta_te: bonus solo se amicizia era < 5
  if (id === 'presenta_te' && rel.amicizia >= 5) {
    newRel.amicizia = rel.amicizia // annulla il bonus
  }

  // chiedi_come_stai: amore +1 solo se amore > 0
  if (id === 'chiedi_come_stai' && success && rel.amore > 0) {
    newRel.amore += 1
  }

  // confida_problema: amore +5 solo se romantico >= 20
  if (id === 'confida_problema' && success && rel.romantico >= 20) {
    newRel.amore += 5
  }

  // chiedi_scusa: amicizia +5 solo se odio > 30
  if (id === 'chiedi_scusa') {
    if (rel.odio <= 30) newRel.amicizia = rel.amicizia // annulla il bonus amicizia
  }

  // studia_insieme: media +0.5 se friend è secchione
  if (id === 'studia_insieme' && success && friendType === 'secchione') {
    newStats.media = (newStats.media ?? 0) + 0.3  // bonus aggiuntivo (0.2 base + 0.3 = 0.5 totale)
  }

  // chiedi_prestito: soldi random 20-50 (il valore in catalog è un placeholder)
  if (id === 'chiedi_prestito' && success) {
    newStats.soldi = Math.floor(Math.random() * 31) + 20
  }

  // ── Regola: amore condizionato ───────────────────────────────────────────
  // amore può aumentare SOLO se amicizia >= 40 && romantico >= 30
  if (newRel.amore > rel.amore && (rel.amicizia < 40 || rel.romantico < 30)) {
    newRel.amore = rel.amore // blocca l'incremento
  }

  // ── Clamp finale ─────────────────────────────────────────────────────────
  newRel = clampRel(newRel)

  // Messaggio
  const resultLabel = success ? '✅' : '❌'
  const message = success
    ? `${resultLabel} ${def.label}: ${_describeRelEffects(def.effects)}`
    : `${resultLabel} ${def.label}: non è andata bene. ${_describeRelEffects(def.failEffects ?? {})}`

  return { newRel, newStats, message, success }
}

/**
 * Applica l'erosione temporale giornaliera a tutti i Friend attivi.
 * Pure function: Friend[] in → Friend[] out (nuovi oggetti, input invariato).
 *
 * Regole:
 * - odio > 60  → amicizia -1/giorno
 * - amicizia > 70 → odio -1/giorno
 * - inattività > 30gg → amicizia -1/giorno
 * - inattività > 60gg → amicizia -2/giorno (cumulativo: -1 da regola sopra + -1 qui)
 */
export function applyDailyErosion(
  friends: Friend[],
  currentDayIndex: number
): Friend[] {
  return friends.map(f => {
    // Friend senza rel o non unlocked: non partecipa all'erosione
    if (!f.rel || f.unlocked === false) return f

    let rel = { ...f.rel }

    // Erosione reciproca odio/amicizia
    if (rel.odio > 60)      rel.amicizia = Math.max(0, rel.amicizia - 1)
    if (rel.amicizia > 70)  rel.odio     = Math.max(0, rel.odio - 1)

    // Erosione inattività
    const lastDay = f.lastInteractionDay ?? 0
    const inactivity = currentDayIndex - lastDay

    if (inactivity > 60) {
      rel.amicizia = Math.max(0, rel.amicizia - 2)
    } else if (inactivity > 30) {
      rel.amicizia = Math.max(0, rel.amicizia - 1)
    }

    // Se nessun cambiamento, restituisce lo stesso oggetto friend (ottimizzazione)
    if (
      rel.amicizia  === f.rel.amicizia &&
      rel.romantico === f.rel.romantico &&
      rel.amore     === f.rel.amore &&
      rel.odio      === f.rel.odio &&
      (rel.rivalita ?? 0) === (f.rel.rivalita ?? 0)
    ) {
      return f
    }

    return { ...f, rel }
  })
}

// ── Helper privato ────────────────────────────────────────────────────────────

function _describeRelEffects(effects: RelationEffects): string {
  const parts: string[] = []
  if (effects.amicizia  != null) parts.push(`Amicizia ${effects.amicizia  > 0 ? '+' : ''}${effects.amicizia}`)
  if (effects.romantico != null) parts.push(`Romantico ${effects.romantico > 0 ? '+' : ''}${effects.romantico}`)
  if (effects.amore     != null) parts.push(`Amore ${effects.amore     > 0 ? '+' : ''}${effects.amore}`)
  if (effects.odio      != null) parts.push(`Odio ${effects.odio      > 0 ? '+' : ''}${effects.odio}`)
  if (effects.rivalita  != null) parts.push(`Rivalità ${effects.rivalita > 0 ? '+' : ''}${effects.rivalita}`)
  if (effects.statsEffects) {
    const se = effects.statsEffects
    if (se.soldi      != null) parts.push(`Soldi ${se.soldi      > 0 ? '+' : ''}${se.soldi}€`)
    if (se.reputazione != null) parts.push(`Reputazione ${se.reputazione > 0 ? '+' : ''}${se.reputazione}`)
    if (se.media      != null) parts.push(`Media ${se.media      > 0 ? '+' : ''}${se.media.toFixed(1)}`)
  }
  return parts.join(', ') || '(nessun effetto)'
}

/**
 * Calcola la probabilità effettiva di generare un nuovo amico.
 * Nessuna penalità fino a 6 amici. Da 7 in su: -5% per ogni amico aggiuntivo.
 * Restituisce sempre un valore >= 0.
 */
export function getFriendGenChance(
  baseProbability: number,
  currentFriendsCount: number
): number {
  const penalty = Math.max(0, currentFriendsCount - 6) * 5
  return Math.max(0, baseProbability - penalty)
}
