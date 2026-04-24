import { GameDate, GameTime, SchoolYear, DayPhase, DayType, DayPhaseConfig, GameTimeV2 } from '@/lib/types'

const MONTHS = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
]

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

export const isLeapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

export const getDaysInMonth = (month: number, year: number): number => {
  if (month === 2 && isLeapYear(year)) return 29
  return DAYS_IN_MONTH[month - 1]
}

export const formatDate = (date: GameDate): string => {
  return `${date.day} ${MONTHS[date.month - 1]} ${date.year}`
}

export const getDayOfWeekLabel = (date: GameDate): string => {
  const jsDate = new Date(date.year, date.month - 1, date.day)
  const label = jsDate.toLocaleDateString('it-IT', { weekday: 'long' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export const advanceDay = (date: GameDate): GameDate => {
  const daysInMonth = getDaysInMonth(date.month, date.year)
  let newDay = date.day + 1
  let newMonth = date.month
  let newYear = date.year

  if (newDay > daysInMonth) {
    newDay = 1
    newMonth++
    if (newMonth > 12) {
      newMonth = 1
      newYear++
    }
  }

  return { day: newDay, month: newMonth, year: newYear }
}

export const compareDates = (date1: GameDate, date2: GameDate): number => {
  if (date1.year !== date2.year) return date1.year - date2.year
  if (date1.month !== date2.month) return date1.month - date2.month
  return date1.day - date2.day
}

export const isDateAfterOrEqual = (date1: GameDate, date2: GameDate): boolean => {
  return compareDates(date1, date2) >= 0
}

export const isDateBefore = (date1: GameDate, date2: GameDate): boolean => {
  return compareDates(date1, date2) < 0
}

export const isSchoolPeriod = (date: GameDate, schoolYear: SchoolYear): boolean => {
  if (!schoolYear.schoolStartDate || !schoolYear.schoolStartDate.year ||
      !schoolYear.schoolEndDate || !schoolYear.schoolEndDate.year) {
    return true
  }
  
  return (
    isDateAfterOrEqual(date, schoolYear.schoolStartDate) &&
    isDateBefore(date, schoolYear.schoolEndDate)
  )
}

export const shouldShowReportCard = (date: GameDate, reportCardDate: GameDate | undefined): boolean => {
  if (!reportCardDate || !reportCardDate.year) {
    return false
  }
  return compareDates(date, reportCardDate) === 0
}

export const calculateNextSchoolYear = (currentSchoolYear: SchoolYear): SchoolYear => {
  const nextYear = currentSchoolYear.currentYear + 1
  
  const currentStartYear = currentSchoolYear.schoolStartDate?.year ?? 2026
  const currentEndYear = currentSchoolYear.schoolEndDate?.year ?? 2027
  
  const startYear = currentStartYear + 1
  const endYear = currentEndYear + 1

  return {
    currentYear: nextYear,
    isSchoolPeriod: true,
    daysUntilBreak: 180,
    schoolStartDate: { day: 15, month: 9, year: startYear },
    schoolEndDate: { day: 10, month: 6, year: endYear },
    reportCardDate: { day: 10, month: 6, year: endYear }
  }
}

export const advanceGameTime = (gameTime: GameTime): GameTime => {
  const newDate = advanceDay(gameTime.currentDate)
  let newSchoolYear = { ...gameTime.schoolYear }
  let newAge = gameTime.age

  const isInSchoolPeriod = isSchoolPeriod(newDate, newSchoolYear)
  newSchoolYear.isSchoolPeriod = isInSchoolPeriod

  const birthdayMonth = 9
  const birthdayDay = 1
  if (compareDates(newDate, { day: birthdayDay, month: birthdayMonth, year: newDate.year }) === 0) {
    newAge++
  }

  return {
    ...gameTime,
    currentDate: newDate,
    actionsRemaining: gameTime.maxActionsPerDay ?? 3,
    schoolYear: newSchoolYear,
    age: newAge
  }
}

export const getSchoolYearName = (year: number): string => {
  switch (year) {
    case 1: return 'Prima Superiore'
    case 2: return 'Seconda Superiore'
    case 3: return 'Terza Superiore'
    case 4: return 'Quarta Superiore'
    case 5: return 'Quinta Superiore'
    default: return `Anno ${year}`
  }
}

export const getDaysUntilReportCard = (currentDate: GameDate, reportCardDate: GameDate | undefined): number => {
  if (!reportCardDate || !reportCardDate.year) {
    return 0
  }
  
  let count = 0
  let tempDate = { ...currentDate }
  
  while (isDateBefore(tempDate, reportCardDate) && count < 365) {
    tempDate = advanceDay(tempDate)
    count++
  }
  
  return count
}

export const getWeekNumber = (date: GameDate): number => {
  const jan1 = new Date(date.year, 0, 1)
  const current = new Date(date.year, date.month - 1, date.day)
  const dayOfYear = Math.floor((current.getTime() - jan1.getTime()) / (1000 * 60 * 60 * 24))
  return Math.floor(dayOfYear / 7)
}

export const isSaturday = (date: GameDate): boolean => {
  const jsDate = new Date(date.year, date.month - 1, date.day)
  return jsDate.getDay() === 6
}

export const shouldReceivePaghetta = (currentDate: GameDate, lastPaghettaDate: GameDate | undefined): boolean => {
  if (!isSaturday(currentDate)) return false
  
  if (!lastPaghettaDate || !lastPaghettaDate.year) return true
  
  const currentWeek = getWeekNumber(currentDate)
  const lastWeek = getWeekNumber(lastPaghettaDate)
  
  return currentWeek !== lastWeek
}

// ─── Fasce Orarie (Fase B) ──────────────────────────────────────────────────

/** Classifica il giorno rispetto a festività italiane fisse, sabato, domenica. */
export const getDayType = (date: GameDate): DayType => {
  const jsDate = new Date(date.year, date.month - 1, date.day)
  const dow = jsDate.getDay() // 0=Dom, 6=Sab

  const pad = (n: number) => String(n).padStart(2, '0')
  const key = `${date.year}-${pad(date.month)}-${pad(date.day)}`

  const festivita = [
    `${date.year}-01-01`, // Capodanno
    `${date.year}-01-06`, // Epifania
    `${date.year}-04-25`, // Liberazione
    `${date.year}-05-01`, // Festa del Lavoro
    `${date.year}-06-02`, // Repubblica
    `${date.year}-08-15`, // Ferragosto
    `${date.year}-11-01`, // Ognissanti
    `${date.year}-12-08`, // Immacolata
    `${date.year}-12-25`, // Natale
    `${date.year}-12-26`, // Santo Stefano
  ]

  if (festivita.includes(key)) return 'festivo'
  if (dow === 0) return 'domenica'
  if (dow === 6) return 'sabato'
  return 'feriale'
}

/** Sequenza fissa delle fasi in un giorno. */
export const PHASE_SEQUENCE: DayPhase[] = ['mattina', 'pomeriggio', 'sera', 'notte']

/** Configurazione statica delle fasce per ogni combinazione (DayPhase, DayType). */
export const DAY_PHASE_CONFIG: Record<DayType, Record<DayPhase, DayPhaseConfig>> = {
  feriale: {
    mattina:    { label: 'Mattina',    timeRange: '07:00–13:00', maxActions: 2, energyCost: 5,  nightRecovery: 0 },
    pomeriggio: { label: 'Pomeriggio', timeRange: '13:00–18:00', maxActions: 2, energyCost: 8,  nightRecovery: 0 },
    sera:       { label: 'Sera',       timeRange: '18:00–23:00', maxActions: 2, energyCost: 10, nightRecovery: 0 },
    notte:      { label: 'Notte',      timeRange: '23:00–07:00', maxActions: 2, energyCost: 0,  nightRecovery: -20 },
  },
  sabato: {
    mattina:    { label: 'Mattina',    timeRange: '08:00–13:00', maxActions: 2, energyCost: 5,  nightRecovery: 0 },
    pomeriggio: { label: 'Pomeriggio', timeRange: '13:00–19:00', maxActions: 3, energyCost: 8,  nightRecovery: 0 },
    sera:       { label: 'Sera',       timeRange: '19:00–24:00', maxActions: 2, energyCost: 10, nightRecovery: 0 },
    notte:      { label: 'Notte',      timeRange: '00:00–08:00', maxActions: 2, energyCost: 0,  nightRecovery: -25 },
  },
  domenica: {
    mattina:    { label: 'Mattina',    timeRange: '09:00–13:00', maxActions: 1, energyCost: 5,  nightRecovery: 0 },
    pomeriggio: { label: 'Pomeriggio', timeRange: '13:00–18:00', maxActions: 2, energyCost: 8,  nightRecovery: 0 },
    sera:       { label: 'Sera',       timeRange: '18:00–22:00', maxActions: 2, energyCost: 10, nightRecovery: 0 },
    notte:      { label: 'Notte',      timeRange: '22:00–09:00', maxActions: 2, energyCost: 0,  nightRecovery: -30 },
  },
  festivo: {
    mattina:    { label: 'Mattina',    timeRange: '09:00–13:00', maxActions: 1, energyCost: 5,  nightRecovery: 0 },
    pomeriggio: { label: 'Pomeriggio', timeRange: '13:00–18:00', maxActions: 2, energyCost: 8,  nightRecovery: 0 },
    sera:       { label: 'Sera',       timeRange: '18:00–22:00', maxActions: 2, energyCost: 10, nightRecovery: 0 },
    notte:      { label: 'Notte',      timeRange: '22:00–09:00', maxActions: 2, energyCost: 0,  nightRecovery: -30 },
  },
}

/**
 * Avanza alla fase successiva del giorno.
 * Se la fase successiva è 'mattina' avanza anche il giorno.
 */
export const advancePhase = (gameTime: GameTimeV2): GameTimeV2 => {
  const currentIdx = PHASE_SEQUENCE.indexOf(gameTime.currentPhase)
  const nextIdx = (currentIdx + 1) % PHASE_SEQUENCE.length
  const nextPhase = PHASE_SEQUENCE[nextIdx]

  // Fine del giorno: passa a mattina del giorno successivo
  if (nextPhase === 'mattina') {
    const newGameTime = advanceGameTime(gameTime) // avanza la data base
    const newDayType = getDayType(newGameTime.currentDate)
    const cfg = DAY_PHASE_CONFIG[newDayType]['mattina']
    return {
      ...newGameTime,
      currentPhase: 'mattina',
      dayType: newDayType,
      phaseActionsRemaining: cfg.maxActions,
    }
  }

  // Stessa giornata, fase successiva
  const cfg = DAY_PHASE_CONFIG[gameTime.dayType][nextPhase]
  return {
    ...gameTime,
    currentPhase: nextPhase,
    phaseActionsRemaining: cfg.maxActions,
  }
}

/** Costruisce un GameTimeV2 da un GameTime esistente (migrazione). */
export const toGameTimeV2 = (gt: GameTime): GameTimeV2 => {
  const dayType = getDayType(gt.currentDate)
  const phase: DayPhase = 'mattina'
  const cfg = DAY_PHASE_CONFIG[dayType][phase]
  return {
    ...gt,
    currentPhase: phase,
    dayType,
    phaseActionsRemaining: cfg.maxActions,
  }
}

