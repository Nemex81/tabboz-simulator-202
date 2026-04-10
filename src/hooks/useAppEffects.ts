import { useEffect } from 'react'
import type { MutableRefObject } from 'react'
import type {
  Friend,
  GameStats,
  PlayerProfile,
  Relationship,
  SchoolType,
  SubjectGrades,
  ThemeVariant,
} from '@/lib/types'
import type { ActivePartner, Ragazza } from '@/lib/girlfriend-system'
import { checkGameOver, calculateMedia } from '@/lib/game-utils'
import { playSound } from '@/lib/sound-effects'
import {
  DEFAULT_SEXUAL_ORIENTATION,
  normalizePlayerProfile,
  normalizeRelationshipCandidate,
  normalizeRomanticPartner,
} from '@/lib/gender-utils'

function getLegacyPartnerSourceKey(partner: Ragazza | null): string | null {
  if (!partner) return null

  const candidate = partner as Ragazza & {
    relationshipSourceKey?: string
    sourceKey?: string
  }

  return candidate.relationshipSourceKey ?? candidate.sourceKey ?? `legacy-partner:${partner.id}`
}

function normalizeActivePartner(partner: ActivePartner): ActivePartner {
  const normalizedPartner = normalizeRomanticPartner(partner)

  if (!normalizedPartner) {
    return partner
  }

  return {
    ...normalizedPartner,
    relationshipSourceKey: partner.relationshipSourceKey || getLegacyPartnerSourceKey(partner) || `legacy-partner:${partner.id}`,
  }
}

interface UseAppEffectsParams {
  currentTheme: ThemeVariant | null | undefined
  rawPlayerProfile: PlayerProfile | null
  setRawPlayerProfile: React.Dispatch<React.SetStateAction<PlayerProfile | null>>
  rawRelationships: Relationship[]
  setRawRelationships: React.Dispatch<React.SetStateAction<Relationship[]>>
  rawActivePartners: ActivePartner[]
  setRawActivePartners: React.Dispatch<React.SetStateAction<ActivePartner[]>>
  rawLegacyGirlfriend: Ragazza | null
  setRawLegacyGirlfriend: React.Dispatch<React.SetStateAction<Ragazza | null>>
  rawFriends: Friend[]
  setRawFriends: React.Dispatch<React.SetStateAction<Friend[]>>
  schoolType: SchoolType | null
  gameYear: number
  timetable: unknown
  teachersLength: number
  classRosterLength: number
  initSchoolYear: (schoolType: SchoolType, year: number) => void
  schoolBootstrapStartedRef: MutableRefObject<boolean>
  gameOver: boolean
  stats: GameStats
  grades: SubjectGrades
  setGameOver: (value: boolean) => void
  setGameOverReason: (value: string) => void
  announce: (message: string, priority?: 'polite' | 'assertive') => void
}

export function useAppEffects({
  currentTheme,
  rawPlayerProfile,
  setRawPlayerProfile,
  rawRelationships,
  setRawRelationships,
  rawActivePartners,
  setRawActivePartners,
  rawLegacyGirlfriend,
  setRawLegacyGirlfriend,
  rawFriends,
  setRawFriends,
  schoolType,
  gameYear,
  timetable,
  teachersLength,
  classRosterLength,
  initSchoolYear,
  schoolBootstrapStartedRef,
  gameOver,
  stats,
  grades,
  setGameOver,
  setGameOverReason,
  announce,
}: UseAppEffectsParams) {
  useEffect(() => {
    const htmlElement = document.querySelector('html')
    if (htmlElement) {
      htmlElement.setAttribute('data-theme', currentTheme ?? 'default')
    }
  }, [currentTheme])

  useEffect(() => {
    if (rawPlayerProfile && !rawPlayerProfile.orientamentoSessuale) {
      setRawPlayerProfile(prev => prev ? normalizePlayerProfile(prev) : null)
    }
  }, [rawPlayerProfile, setRawPlayerProfile])

  useEffect(() => {
    if ((rawRelationships ?? []).some(relationship =>
      !relationship.orientamentoSessuale ||
      !relationship.gender ||
      !relationship.sourceKey ||
      relationship.metAt === ('rete' as typeof relationship.metAt) ||
      relationship.metAt === ('in rete' as typeof relationship.metAt)
    )) {
      setRawRelationships(prev => (prev ?? []).map(normalizeRelationshipCandidate))
    }
  }, [rawRelationships, setRawRelationships])

  useEffect(() => {
    if ((rawActivePartners ?? []).length === 0 && rawLegacyGirlfriend) {
      const sourceKey = getLegacyPartnerSourceKey(rawLegacyGirlfriend)
      const normalizedLegacyPartner = normalizeRomanticPartner(rawLegacyGirlfriend)

      if (!sourceKey || !normalizedLegacyPartner) {
        return
      }

      setRawActivePartners([{
        ...normalizedLegacyPartner,
        relationshipSourceKey: sourceKey,
      }])
      setRawLegacyGirlfriend(null)
      return
    }

    if ((rawActivePartners ?? []).some(partner => (
      !partner.relationshipSourceKey ||
      !partner.orientamentoSessuale ||
      !partner.gender
    ))) {
      setRawActivePartners(prev => (prev ?? []).map(normalizeActivePartner))
    }

    if (rawLegacyGirlfriend) {
      setRawLegacyGirlfriend(null)
    }
  }, [rawActivePartners, rawLegacyGirlfriend, setRawActivePartners, setRawLegacyGirlfriend])

  useEffect(() => {
    if ((rawFriends ?? []).some(friend => !friend.orientamentoSessuale)) {
      setRawFriends(prev => (prev ?? []).map(friend => ({
        ...friend,
        orientamentoSessuale: friend.orientamentoSessuale ?? DEFAULT_SEXUAL_ORIENTATION,
      })))
    }
  }, [rawFriends, setRawFriends])

  useEffect(() => {
    if (!schoolType) {
      schoolBootstrapStartedRef.current = false
      return
    }

    const needsSchoolBootstrap = !timetable && teachersLength === 0 && classRosterLength === 0

    if (!needsSchoolBootstrap || schoolBootstrapStartedRef.current) {
      return
    }

    schoolBootstrapStartedRef.current = true
    initSchoolYear(schoolType, gameYear)
  }, [classRosterLength, gameYear, initSchoolYear, schoolType, teachersLength, timetable, schoolBootstrapStartedRef])

  useEffect(() => {
    const checkStatus = checkGameOver({ ...stats, media: calculateMedia(grades) })
    if (checkStatus.isOver && !gameOver) {
      playSound.gameOver()
      setGameOver(true)
      setGameOverReason(checkStatus.reason)
      announce(checkStatus.reason, 'assertive')
    }
  }, [announce, gameOver, grades, setGameOver, setGameOverReason, stats])
}