// src/lib/school-roster-transitions.ts
// Fase 3C — Transizioni annuali: bocciatura compagni, nuovi studenti, turnover professori.
// Funzioni pure, zero dipendenze React.

import type { Classmate, Teacher, Friend, SchoolType } from '@/lib/types'
import { generateTeachers } from '@/lib/school-teachers'
import { generateClassRoster } from '@/lib/school-roster'
import type { RelationStats } from '@/lib/relation-system'

// ── Helpers ───────────────────────────────────────────────────────────────────

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pickN<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

// ── Tipo di ritorno ───────────────────────────────────────────────────────────

export interface YearTransitionResult {
  /** Roster aggiornato (senza bocciati, con nuovi studenti). */
  newRoster: Classmate[]
  /** Lista docenti aggiornata (senza i sostituiti, con i nuovi). */
  newTeachers: Teacher[]
  /** Compagni rimossi dalla classe. */
  departedClassmates: Classmate[]
  /** Nuovi studenti aggiunti alla classe. */
  newStudents: Classmate[]
  /** Professori rimossi. */
  departedTeachers: Teacher[]
  /** Nuovi professori aggiunti. */
  newTeachersAdded: Teacher[]
  /** Lista amici aggiornata (originType cambiati + eventuali nuovi extrascolastici). */
  updatedFriends: Friend[]
}

// ── Funzione principale ───────────────────────────────────────────────────────

/**
 * Applica la transizione annuale alla classe e al corpo docente.
 *
 * - 1-4 compagni vengono bocciati (estratti casualmente).
 * - I bocciati già promossi ad amici (`promotedToFriend: true`) rimangono in
 *   `friends[]` ma con `originType` aggiornato a `'extrascolastico'`.
 * - I bocciati NON ancora promossi con `relation >= 10` vengono aggiunti a
 *   `friends[]` come `'extrascolastico'`.
 * - 0-2 nuovi studenti con `relation` 5-15 si aggiungono alla classe.
 * - 0-2 professori vengono sostituiti con una scheda vergine.
 *
 * @param classRoster - Roster corrente della classe.
 * @param teachers    - Lista corrente dei professori.
 * @param schoolType  - Indirizzo scolastico (per generare i prof sostituti).
 * @param newYear     - Anno scolastico in arrivo (usato per generare strutture).
 * @param friends     - Lista amici corrente (può essere modificata per gli extrascolastici).
 * @returns Oggetto `YearTransitionResult` con tutte le strutture aggiornate.
 */
export function applyYearTransition(
  classRoster: Classmate[],
  teachers: Teacher[],
  schoolType: SchoolType,
  newYear: number,
  friends: Friend[]
): YearTransitionResult {
  // ── 1. Compagni bocciati ───────────────────────────────────────────────────
  const failCount = randomInt(1, Math.min(4, classRoster.length))
  const departedClassmates = pickN(classRoster, failCount)
  const departedIds = new Set(departedClassmates.map(c => c.id))

  // ── 2. Aggiornamento lista amici per i bocciati ───────────────────────────
  let updatedFriends = friends.map(f => {
    const departed = departedClassmates.find(c => c.id === f.id)
    if (!departed) return f
    // Il bocciato era già un amico → aggiorna solo originType
    return { ...f, originType: 'extrascolastico' as const }
  })

  // Bocciati NON ancora promossi ma con relation >= 55 → aggiungi come extrascolastici
  const alreadyFriendIds = new Set(updatedFriends.map(f => f.id))
  for (const departed of departedClassmates) {
    if (!departed.promotedToFriend && departed.relation >= 55 && !alreadyFriendIds.has(departed.id)) {
      const amicizia = departed.relation
      const rel: RelationStats = {
        amicizia,
        romantico: 0,
        amore: 0,
        odio: 0,
        rivalita: 0,
      }
      const newFriend: Friend = {
        id: departed.id,
        name: departed.name,
        type: departed.type,
        intelligenza: departed.intelligenza,
        unlocked: true,
        originType: 'extrascolastico',
        metAt: 'classe',
        schoolYearMet: departed.yearJoined,
        rel,
      }
      updatedFriends = [...updatedFriends, newFriend]
    }
  }

  // ── 3. Nuovi studenti ─────────────────────────────────────────────────────
  const newStudentCount = randomInt(0, 2)
  const newStudents: Classmate[] = generateNewStudents(newStudentCount, newYear)

  // ── 4. Roster aggiornato ──────────────────────────────────────────────────
  const survivingRoster = classRoster.filter(c => !departedIds.has(c.id))
  const newRoster: Classmate[] = [...survivingRoster, ...newStudents]

  // ── 5. Professori sostituiti ──────────────────────────────────────────────
  const replacedCount = randomInt(0, Math.min(2, teachers.length))
  const departedTeachers = pickN(teachers, replacedCount)
  const departedTeacherIds = new Set(departedTeachers.map(t => t.id))
  const survivingTeachers = teachers.filter(t => !departedTeacherIds.has(t.id))

  // Genera nuovi prof sostituti — uno per materia rimasta scoperta
  const newTeachersAdded: Teacher[] = generateReplacementTeachers(
    departedTeachers,
    schoolType,
    newYear
  )

  const newTeachers: Teacher[] = [...survivingTeachers, ...newTeachersAdded]

  return {
    newRoster,
    newTeachers,
    departedClassmates,
    newStudents,
    departedTeachers,
    newTeachersAdded,
    updatedFriends,
  }
}

// ── Helpers privati ───────────────────────────────────────────────────────────

/**
 * Genera `count` nuovi studenti con relazione 5-15 per il nuovo anno.
 * Usa `generateClassRoster` come serbatoio di nomi/personalità e poi
 * sovrascrive `relation` e `yearJoined`.
 */
function generateNewStudents(count: number, newYear: number): Classmate[] {
  if (count === 0) return []
  // Genera un piccolo roster temporaneo e prendi i primi `count`
  const pool = generateClassRoster(newYear)
  return pool.slice(0, count).map(c => ({
    ...c,
    relation: randomInt(50, 60),
    yearJoined: newYear,
  }))
}

/**
 * Genera nuovi professori sostituti per le materie rimaste scoperte.
 * I sostituti vengono estratti da `generateTeachers(schoolType, newYear)`,
 * filtrando per le `subjectKey` dei partiti.
 */
function generateReplacementTeachers(
  departed: Teacher[],
  schoolType: SchoolType,
  newYear: number
): Teacher[] {
  if (departed.length === 0) return []

  const neededSubjects = new Set(departed.map(t => t.subjectKey))
  // Genera il pool completo per l'anno entrante e filtra per materie necessarie
  const fullPool = generateTeachers(schoolType, newYear)
  const replacements: Teacher[] = []

  for (const subject of neededSubjects) {
    const candidate = fullPool.find(t => t.subjectKey === subject)
    if (candidate) {
      replacements.push(candidate)
    }
  }

  return replacements
}
