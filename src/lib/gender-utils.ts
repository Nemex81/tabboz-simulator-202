import type {
  PlayerProfile,
  Relationship,
  RelationshipTier,
  SexualOrientation,
  BinaryGenderCode,
  NarrativePlayerGender,
} from '@/lib/types'

function buildLegacyRelationshipSourceKey(relationship: Relationship): string {
  return `legacy-relationship:${relationship.id}`
}

function normalizeRelationshipMetAt(metAt: Relationship['metAt'] | 'rete' | 'in rete' | undefined): Relationship['metAt'] {
  if (metAt === 'rete' || metAt === 'in rete') {
    return 'online'
  }

  return metAt
}

export const DEFAULT_SEXUAL_ORIENTATION: SexualOrientation = 'eterosessuale'

const SELF_WORD_REPLACEMENTS: Array<[string, string]> = [
  ['stanco', 'stanca'],
  ['distrutto', 'distrutta'],
  ['andato', 'andata'],
  ['appiccicoso', 'appiccicosa'],
  ['rispettato', 'rispettata'],
  ['beccato', 'beccata'],
  ['bocciato', 'bocciata'],
  ['fidanzato', 'fidanzata'],
]

const RELATIONSHIP_TIER_LABELS: Record<RelationshipTier, string> = {
  sconosciuto: '💔 Sconosciuto',
  conoscente: '😐 Conoscente',
  amico: '😊 Amico',
  amico_stretto: '😎 Amico Stretto',
  migliore_amico: '👑 Migliore Amico',
  trombamica: '💋 Trombamica',
  fidanzata: '❤️ Fidanzata',
}

const ROMANTIC_STATUS_LABELS: Record<string, Record<BinaryGenderCode, string>> = {
  sconosciuta: { F: '❓ Sconosciuta', M: '❓ Sconosciuto' },
  conoscente: { F: '👋 Conoscente', M: '👋 Conoscente' },
  amica: { F: '😊 Amica', M: '😊 Amico' },
  interessata: { F: '😍 Interessata', M: '😍 Interessato' },
  fidanzata: { F: '💕 Fidanzata', M: '💕 Fidanzato' },
  ex: { F: '🖤 Ex', M: '🖤 Ex' },
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function applyCasePattern(source: string, replacement: string): string {
  if (source.toUpperCase() === source) {
    return replacement.toUpperCase()
  }
  if (source[0] === source[0]?.toUpperCase() && source.slice(1) === source.slice(1).toLowerCase()) {
    return replacement[0].toUpperCase() + replacement.slice(1)
  }
  return replacement
}

function replaceWordWithCase(text: string, masculine: string, feminine: string): string {
  const regex = new RegExp(`\\b${escapeRegExp(masculine)}\\b`, 'gi')
  return text.replace(regex, (match) => applyCasePattern(match, feminine))
}

export function renderPlayerForm(
  playerGender: NarrativePlayerGender | null | undefined,
  masculine: string,
  feminine: string,
): string {
  return playerGender === 'femmina' ? feminine : masculine
}

export function normalizePlayerGender(gender: unknown): NarrativePlayerGender {
  return gender === 'femmina' ? 'femmina' : 'maschio'
}

export function normalizeCharacterGenderCode(
  gender: BinaryGenderCode | NarrativePlayerGender | undefined | null,
  fallback: BinaryGenderCode = 'F',
): BinaryGenderCode {
  if (gender === 'M' || gender === 'maschio') return 'M'
  if (gender === 'F' || gender === 'femmina') return 'F'
  return fallback
}

export function getCharacterGenderLabel(playerGender: NarrativePlayerGender): string {
  return playerGender === 'femmina' ? 'Femmina' : 'Maschio'
}

export function getSexualOrientationLabel(orientation: SexualOrientation): string {
  switch (orientation) {
    case 'omosessuale':
      return 'Omosessuale'
    case 'bisessuale':
      return 'Bisessuale'
    case 'pansessuale':
      return 'Pansessuale'
    case 'asessuale':
      return 'Asessuale'
    default:
      return 'Eterosessuale'
  }
}

export function ensureSexualOrientation<T extends { orientamentoSessuale?: SexualOrientation }>(
  character: T,
): T & { orientamentoSessuale: SexualOrientation } {
  return {
    ...character,
    orientamentoSessuale: character.orientamentoSessuale ?? DEFAULT_SEXUAL_ORIENTATION,
  }
}

export function normalizePlayerProfile(profile: PlayerProfile | null): PlayerProfile | null {
  if (!profile) return null
  return {
    ...profile,
    gender: normalizePlayerGender(profile.gender),
    orientamentoSessuale: profile.orientamentoSessuale ?? DEFAULT_SEXUAL_ORIENTATION,
  }
}

export function normalizePlayerProfileNullable(profile: PlayerProfile | null | undefined): PlayerProfile | null {
  return normalizePlayerProfile(profile ?? null)
}

export function normalizeRelationshipCandidate(relationship: Relationship): Relationship {
  return {
    ...relationship,
    sourceKey: relationship.sourceKey ?? buildLegacyRelationshipSourceKey(relationship),
    sourceType: relationship.sourceType ?? 'generated_interest',
    metAt: normalizeRelationshipMetAt(relationship.metAt as Relationship['metAt'] | 'rete' | 'in rete' | undefined),
    gender: normalizeCharacterGenderCode(relationship.gender, 'F'),
    orientamentoSessuale: relationship.orientamentoSessuale ?? DEFAULT_SEXUAL_ORIENTATION,
  }
}

export function normalizeRomanticPartner<T extends {
  gender?: BinaryGenderCode | NarrativePlayerGender
  orientamentoSessuale?: SexualOrientation
}>(partner: T | null | undefined, fallbackGender: BinaryGenderCode = 'F'): (T & {
  gender: BinaryGenderCode
  orientamentoSessuale: SexualOrientation
}) | null {
  if (!partner) return null
  return {
    ...partner,
    gender: normalizeCharacterGenderCode(partner.gender, fallbackGender),
    orientamentoSessuale: partner.orientamentoSessuale ?? DEFAULT_SEXUAL_ORIENTATION,
  }
}

export function getPreferredPartnerGender(
  playerGender: NarrativePlayerGender,
  orientation: SexualOrientation = DEFAULT_SEXUAL_ORIENTATION,
): BinaryGenderCode | null {
  switch (orientation) {
    case 'eterosessuale':
      return playerGender === 'femmina' ? 'M' : 'F'
    case 'omosessuale':
      return playerGender === 'femmina' ? 'F' : 'M'
    case 'bisessuale':
    case 'pansessuale':
      return null
    case 'asessuale':
      return null
    default:
      return playerGender === 'femmina' ? 'M' : 'F'
  }
}

export function isRomanticallyCompatible(
  playerGender: NarrativePlayerGender,
  playerOrientation: SexualOrientation,
  candidateGender: BinaryGenderCode,
  candidateOrientation: SexualOrientation = DEFAULT_SEXUAL_ORIENTATION,
): boolean {
  const preferredGender = getPreferredPartnerGender(playerGender, playerOrientation)
  if (preferredGender && candidateGender !== preferredGender) {
    return false
  }

  if (candidateOrientation === 'eterosessuale') {
    const expectedForCandidate = candidateGender === 'M' ? 'femmina' : 'maschio'
    return expectedForCandidate === playerGender
  }

  if (candidateOrientation === 'omosessuale') {
    const expectedForCandidate = candidateGender === 'M' ? 'maschio' : 'femmina'
    return expectedForCandidate === playerGender
  }

  return candidateOrientation !== 'asessuale'
}

export function getVisibleRelationshipTierLabel(
  tier: RelationshipTier,
  playerGender: NarrativePlayerGender,
): string {
  if (playerGender === 'maschio') {
    return RELATIONSHIP_TIER_LABELS[tier]
  }

  switch (tier) {
    case 'fidanzata':
      return '❤️ Fidanzato'
    case 'trombamica':
      return '💋 Trombamico'
    default:
      return RELATIONSHIP_TIER_LABELS[tier]
  }
}

export function getRomanticStatusLabel(status: string, partnerGender: BinaryGenderCode): string {
  const labels = ROMANTIC_STATUS_LABELS[status]
  if (!labels) return status
  return labels[partnerGender]
}

export function getPotentialPartnersHeading(playerGender: NarrativePlayerGender): string {
  return playerGender === 'femmina' ? 'RAGAZZI DA CONQUISTARE' : 'RAGAZZE DA CONQUISTARE'
}

export function getPotentialPartnersEmptyLabel(playerGender: NarrativePlayerGender): string {
  return playerGender === 'femmina' ? 'Nessun ragazzo disponibile!' : 'Nessuna ragazza disponibile!'
}

export function getPotentialPartnerCollective(playerGender: NarrativePlayerGender): string {
  return playerGender === 'femmina' ? 'ragazzi' : 'ragazze'
}

export function getPartnerNoun(partnerGender: BinaryGenderCode): string {
  return partnerGender === 'M' ? 'ragazzo' : 'ragazza'
}

export function getPartnerObjectPronoun(partnerGender: BinaryGenderCode): string {
  return partnerGender === 'M' ? 'gli' : 'le'
}

export function getPartnerSubjectPronoun(partnerGender: BinaryGenderCode): string {
  return partnerGender === 'M' ? 'lui' : 'lei'
}

export function getPartnerAdjective(partnerGender: BinaryGenderCode, masculine: string, feminine: string): string {
  return partnerGender === 'M' ? masculine : feminine
}

export function adaptNarrativeText(
  text: string,
  playerGender: NarrativePlayerGender | null | undefined,
): string {
  if (playerGender !== 'femmina') {
    return text
  }

  return SELF_WORD_REPLACEMENTS.reduce((currentText, [masculine, feminine]) => {
    return replaceWordWithCase(currentText, masculine, feminine)
  }, text)
}