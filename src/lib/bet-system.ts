import { BET } from '@/lib/game-balance.constants'

export interface BetInfo {
  importo: number
  vincitaPotenziale: number
  difficolta: 1 | 2 | 3 | 4
  nomeAvversario: string
  descrizione: string
}

const NOMI_AVVERSARI = [
  'Il Bomber', 'Crazy Tony', 'Flash', 'Il Toro', 'Speedy',
  'Il Falco', 'Thunder', 'Il Lupo', 'Viper', 'Rocket',
  'Il Fenomeno', 'Turbo', 'Il Boss'
]

export const calculateBetAmount = (reputazione: number, difficolta: 1 | 2 | 3 | 4): number => {
  const moltiplicatore = Math.floor(reputazione / BET.REP_DIVISOR) * BET.REP_MULTIPLIER
  const importoCalcolato = BET.BASE_AMOUNT + moltiplicatore + (difficolta * BET.DIFF_MULTIPLIER)
  return Math.min(importoCalcolato, BET.MAX_BET)
}

export const generateStreetRace = (reputazione: number): BetInfo => {
  let difficolta: 1 | 2 | 3 | 4 = 1
  
  if (reputazione < 20) {
    difficolta = 1
  } else if (reputazione < 40) {
    difficolta = Math.random() < 0.7 ? 1 : 2
  } else if (reputazione < 60) {
    difficolta = Math.random() < 0.5 ? 2 : 3
  } else if (reputazione < 80) {
    difficolta = Math.random() < 0.6 ? 3 : 4
  } else {
    difficolta = 4
  }
  
  const importo = calculateBetAmount(reputazione, difficolta)
  const vincitaPotenziale = importo * 2
  
  const nomeAvversario = NOMI_AVVERSARI[Math.floor(Math.random() * NOMI_AVVERSARI.length)]
  
  let descrizione = ''
  switch (difficolta) {
    case 1:
      descrizione = `${nomeAvversario} è uno SFIGATO! Gara FACILE!`
      break
    case 2:
      descrizione = `${nomeAvversario} ha un bel motorino. Gara MEDIA!`
      break
    case 3:
      descrizione = `${nomeAvversario} è TOSTO! Gara DIFFICILE!`
      break
    case 4:
      descrizione = `${nomeAvversario} è il BOSS del quartiere! Gara IMPOSSIBILE!`
      break
  }
  
  return {
    importo,
    vincitaPotenziale,
    difficolta,
    nomeAvversario,
    descrizione
  }
}

export const getDifficoltaText = (difficolta: number): string => {
  switch (difficolta) {
    case 1:
      return 'FACILE'
    case 2:
      return 'MEDIA'
    case 3:
      return 'DIFFICILE'
    case 4:
      return 'BOSS'
    default:
      return 'SCONOSCIUTA'
  }
}

export const getDifficoltaColor = (difficolta: number): string => {
  switch (difficolta) {
    case 1:
      return 'text-primary'
    case 2:
      return 'text-accent'
    case 3:
      return 'text-destructive'
    case 4:
      return 'text-destructive animate-pulse'
    default:
      return 'text-foreground'
  }
}
