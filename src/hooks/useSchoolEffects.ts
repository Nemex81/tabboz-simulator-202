/**
 * useSchoolEffects.ts — hook che centralizza i useEffect scolastici
 * estratti da App.tsx (STEP 9.4). Non gestisce logica di dominio:
 * osserva valori KV e chiama setter/callback di App.
 */
import { useEffect } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { GameStats, SubjectGrades, SchoolRecord, GameTime } from '@/lib/types'
import type { SchoolEvent } from '@/lib/school-events'
import { clampStat, calculateMedia } from '@/lib/game-utils'
import { playSound } from '@/lib/sound-effects'
import { getParentEventByMedia } from '@/lib/school-events'

type SetState<T> = Dispatch<SetStateAction<T>>

export interface UseSchoolEffectsParams {
  currentPhase: string | null
  dayType: string | null
  gameTime: GameTime
  schoolRecord: SchoolRecord
  grades: SubjectGrades
  stats: GameStats
  gameOver: boolean
  marinatoOggi: boolean
  setMarinatoOggi: SetState<boolean>
  setShowStreetMorning: SetState<boolean>
  setStreetMorningEvents: SetState<never[]>
  setShowSchoolMorning: SetState<boolean>
  setSchoolMorningEvents: SetState<never[]>
  setMorningChoicePending: SetState<boolean>
  setStats: SetState<GameStats>
  setSchoolEvent: SetState<SchoolEvent | null>
  setShowSchoolEvent: SetState<boolean>
  setGameOver: SetState<boolean>
  setGameOverReason: SetState<string>
  announce: (msg: string) => void
}

export function useSchoolEffects(p: UseSchoolEffectsParams) {

  // F6: reset marinatoOggi al cambio di giorno
  useEffect(() => {
    p.setMarinatoOggi(false)
    p.setShowStreetMorning(false)
    p.setStreetMorningEvents([])
    p.setShowSchoolMorning(false)
    p.setSchoolMorningEvents([])
  }, [p.gameTime.currentDate.day, p.gameTime.currentDate.month, p.gameTime.currentDate.year]) // eslint-disable-line react-hooks/exhaustive-deps

  // BUG 2: nascondi SchoolMorningPanel quando si esce dalla mattina
  useEffect(() => {
    if (p.currentPhase !== 'mattina') {
      p.setShowSchoolMorning(false)
      p.setShowStreetMorning(false)
    }
  }, [p.currentPhase]) // eslint-disable-line react-hooks/exhaustive-deps

  // morningChoicePending: aggiorna stato scelta mattutina
  useEffect(() => {
    if (p.currentPhase === 'mattina' && p.dayType === 'feriale' && p.gameTime.schoolYear.isSchoolPeriod) {
      if (!p.schoolRecord.wentToSchoolToday && !p.marinatoOggi) {
        p.setMorningChoicePending(true)
      } else {
        p.setMorningChoicePending(false)
      }
    } else {
      p.setMorningChoicePending(false)
    }
  }, [p.currentPhase, p.dayType, p.gameTime.schoolYear.isSchoolPeriod, p.schoolRecord.wentToSchoolToday, p.marinatoOggi]) // eslint-disable-line react-hooks/exhaustive-deps

  // F4: soglie assenze con conseguenze scalari
  useEffect(() => {
    if (!p.gameTime.schoolYear.isSchoolPeriod || p.gameOver) return
    const a = p.schoolRecord.assenze
    if (a === 15) {
      p.announce('📬 I tuoi genitori hanno ricevuto una LETTERA dalla scuola per le assenze! -50 Soldi (punizione)')
      p.setStats((s) => ({ ...s!, soldi: clampStat(s!.soldi - 50, 0, 1000) }))
      playSound.moneySpent()
    } else if (a === 25) {
      p.announce('⚠️ ATTENZIONE: 25 assenze! Rischi di NON essere ammesso allo scrutinio!')
      playSound.eventTrigger()
      const parentEvent = getParentEventByMedia(calculateMedia(p.grades), p.stats)
      if (parentEvent) {
        p.setSchoolEvent(parentEvent)
        p.setShowSchoolEvent(true)
      }
    } else if (a >= 35) {
      playSound.gameOver()
      p.setGameOver(true)
      p.setGameOverReason(`BOCCIATO! Troppe assenze (${a} giorni)! Non sei stato ammesso allo scrutinio!`)
    }
  }, [p.schoolRecord.assenze]) // eslint-disable-line react-hooks/exhaustive-deps

  // F5: condotta — warning < 5, game over < 1
  useEffect(() => {
    if (!p.gameTime.schoolYear.isSchoolPeriod || p.gameOver) return
    const c = p.schoolRecord.condotta
    if (c < 1 && c >= 0) {
      playSound.gameOver()
      p.setGameOver(true)
      p.setGameOverReason(`ESPULSO! Condotta ${c.toFixed(1)}/10 — comportamento insostenibile. Game Over!`)
    } else if (c < 5 && c >= 1) {
      p.announce(`🚨 Condotta CRITICA (${c.toFixed(1)}/10)! Ancora una nota e verrai ESPULSO dalla scuola!`)
      playSound.eventTrigger()
    }
  }, [p.schoolRecord.condotta]) // eslint-disable-line react-hooks/exhaustive-deps
}
