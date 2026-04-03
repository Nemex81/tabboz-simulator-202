import { GameDate, GameTime, SchoolYear } from '@/lib/types'

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
  return (
    isDateAfterOrEqual(date, schoolYear.schoolStartDate) &&
    isDateBefore(date, schoolYear.schoolEndDate)
  )
}

export const shouldShowReportCard = (date: GameDate, reportCardDate: GameDate): boolean => {
  return compareDates(date, reportCardDate) === 0
}

export const calculateNextSchoolYear = (currentSchoolYear: SchoolYear): SchoolYear => {
  const nextYear = currentSchoolYear.currentYear + 1
  const startYear = currentSchoolYear.schoolStartDate.year + 1
  const endYear = currentSchoolYear.schoolEndDate.year + 1

  return {
    currentYear: nextYear,
    isSchoolPeriod: true,
    schoolStartDate: { day: 15, month: 9, year: startYear },
    schoolEndDate: { day: 10, month: 6, year: endYear },
    reportCardDate: { day: 10, month: 6, year: endYear }
  }
}

export const advanceGameTime = (gameTime: GameTime): GameTime => {
  const newDate = advanceDay(gameTime.currentDate)
  let newSchoolYear = gameTime.schoolYear
  let newAge = gameTime.age

  const isInSchoolPeriod = isSchoolPeriod(newDate, newSchoolYear)
  newSchoolYear.isSchoolPeriod = isInSchoolPeriod

  if (compareDates(newDate, { day: 1, month: 1, year: newDate.year }) === 0) {
    const birthdayMonth = 9
    const birthdayDay = 1
    const lastBirthday = { day: birthdayDay, month: birthdayMonth, year: newDate.year - 1 }
    const nextBirthday = { day: birthdayDay, month: birthdayMonth, year: newDate.year }
    
    if (isDateAfterOrEqual(newDate, nextBirthday)) {
      newAge++
    }
  }

  return {
    ...gameTime,
    currentDate: newDate,
    actionsRemaining: gameTime.maxActionsPerDay,
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

export const getDaysUntilReportCard = (currentDate: GameDate, reportCardDate: GameDate): number => {
  let count = 0
  let tempDate = { ...currentDate }
  
  while (isDateBefore(tempDate, reportCardDate) && count < 365) {
    tempDate = advanceDay(tempDate)
    count++
  }
  
  return count
}
