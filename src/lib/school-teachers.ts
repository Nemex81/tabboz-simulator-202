import type { SchoolType, Teacher } from '@/lib/types'
import { getActiveSubjectsForYear } from '@/lib/subjects'

// ─── Pool nomi ────────────────────────────────────────────────────────────────

const MALE_NAMES = [
  'Carlo', 'Sergio', 'Roberto', 'Antonio', 'Mario', 'Luigi', 'Giuseppe',
  'Franco', 'Gianni', 'Enzo', 'Piero', 'Gino', 'Bruno', 'Claudio',
  'Maurizio', 'Renato', 'Walter', 'Emilio', 'Osvaldo', 'Dario'
]

const FEMALE_NAMES = [
  'Maria', 'Anna', 'Carla', 'Rosa', 'Paola', 'Elena', 'Laura',
  'Giovanna', 'Teresa', 'Grazia', 'Lucia', 'Silvana', 'Roberta',
  'Patrizia', 'Mirella', 'Franca', 'Ornella', 'Ivana', 'Rossana', 'Lidia'
]

const SURNAMES = [
  'Rossi', 'Bianchi', 'Ferrari', 'Russo', 'Marino', 'Greco',
  'Romano', 'Gallo', 'Costa', 'Ricci', 'Fontana', 'Barbieri',
  'Conti', 'Esposito', 'Mancini', 'Giordano', 'Rizzo', 'Lombardi',
  'Moretti', 'Colombo'
]

// ─── Distribuzione gaussiana centrata su 5, range 1-10 ───────────────────────
//
// Approssimazione CLT: somma 6 uniform(0,1) → Normal(3, 0.5).
// Normalizza a Standard Normal, poi scala a mean=centro, std=stdDev.

function gaussianInt(center: number, stdDev: number): number {
  let sum = 0
  for (let i = 0; i < 6; i++) sum += Math.random()
  const standardNormal = (sum - 3) / Math.sqrt(0.5)
  const raw = center + standardNormal * stdDev
  return Math.max(1, Math.min(10, Math.round(raw)))
}

// ─── Generatori nomi ──────────────────────────────────────────────────────────

function pickRandom<T>(pool: T[]): T {
  return pool[Math.floor(Math.random() * pool.length)]
}

// ─── generateTeachers ─────────────────────────────────────────────────────────
//
// Produce un Teacher per ogni materia attiva nell'anno (weeklyHours > 0).
// Tutti gli attributi vengono calcolati UNA SOLA VOLTA al momento della
// generazione: il KV di persistenza li congela, non vengono mai ricalcolati
// al caricamento (C9).

export function generateTeachers(
  schoolType: SchoolType,
  schoolYear: number
): Teacher[] {
  const activeSubjects = getActiveSubjectsForYear(schoolType, schoolYear)
    .filter(s => (s.weeklyHours ?? 0) > 0)

  const usedNames: Set<string> = new Set()

  return activeSubjects.map((subject, index) => {
    const gender: 'M' | 'F' = Math.random() < 0.5 ? 'M' : 'F'
    const firstName = gender === 'M' ? pickRandom(MALE_NAMES) : pickRandom(FEMALE_NAMES)
    const surname = pickRandom(SURNAMES)
    const name = buildUniqueName(firstName, surname, usedNames, index)

    // Attributi 1-10 con distribuzione gaussiana centrata su 5
    const severita = gaussianInt(5, 1.5)
    const simpatia = gaussianInt(5, 1.5)
    const corruttibilita = gaussianInt(5, 1.5)
    const resistenzaMinacce = gaussianInt(5, 1.5)

    // C9 — relazione calcolata UNA SOLA VOLTA al momento della generazione — scala [0,100]
    const relazione = clampRelazione(
      (simpatia * 3 + 40) + Math.round((Math.random() - 0.5) * 8)
    )

    const sogliaRottura = Math.round(35 - severita * 2.5)  // range ~[10,33]
    const isOstile = relazione < sogliaRottura

    return {
      id: `teacher_${schoolType}_${schoolYear}_${index + 1}`,
      name,
      subjectKey: subject.key,
      gender,
      severita,
      simpatia,
      corruttibilita,
      resistenzaMinacce,
      relazione,
      sogliaRottura,
      isOstile,
      memoria: [],
      corruptionCount: 0,
      threatCount: 0,
    }
  })
}

// ─── Helper: lookup rapido professore per materia ─────────────────────────────

export function getTeacherForSubject(
  teachers: Teacher[],
  subjectKey: string
): Teacher | undefined {
  return teachers.find(t => t.subjectKey === subjectKey)
}

// ─── Privati ──────────────────────────────────────────────────────────────────

function clampRelazione(value: number): number {
  return Math.max(0, Math.min(100, value))
}

function buildUniqueName(
  firstName: string,
  surname: string,
  usedNames: Set<string>,
  fallbackIndex: number
): string {
  const fullName = `Prof. ${firstName} ${surname}`
  if (!usedNames.has(fullName)) {
    usedNames.add(fullName)
    return fullName
  }
  // Prova cognomi alternativi prima del fallback numerico
  for (const altSurname of SURNAMES) {
    const alt = `Prof. ${firstName} ${altSurname}`
    if (!usedNames.has(alt)) {
      usedNames.add(alt)
      return alt
    }
  }
  const fallback = `Prof. Docente ${fallbackIndex + 1}`
  usedNames.add(fallback)
  return fallback
}
