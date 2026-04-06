import { GameStats, Friend, FriendType } from '@/lib/types'
import { randomChance } from '@/lib/game-utils'

// Re-export per compatibilità con componenti che importano da qui
export type { FriendType, Friend as EnhancedFriend }

const ITALIAN_MALE_NAMES = [
  'Davide', 'Mirko', 'Cristian', 'Fabio', 'Luca', 'Kevin', 'Daniele',
  'Marco', 'Simone', 'Andrea', 'Alessandro', 'Matteo', 'Lorenzo',
  'Stefano', 'Giovanni', 'Francesco', 'Riccardo', 'Tommaso', 'Federico', 'Paolo'
]

export const generateRandomEnhancedFriend = (): Friend => {
  const name = ITALIAN_MALE_NAMES[Math.floor(Math.random() * ITALIAN_MALE_NAMES.length)]
  const types: FriendType[] = ['coatto', 'secchione', 'sportivo', 'ribelle']
  const type = types[Math.floor(Math.random() * types.length)]
  
  let intelligenza = Math.floor(Math.random() * 60) + 20
  if (type === 'secchione') {
    intelligenza = Math.floor(Math.random() * 30) + 70
  } else if (type === 'ribelle' || type === 'coatto') {
    intelligenza = Math.floor(Math.random() * 30) + 20
  }
  
  return {
    id: `friend_${Date.now()}_${Math.random()}`,
    name,
    type,
    affinita: 50,
    unlocked: true,
    intelligenza
  }
}

export const getFriendTypeDescription = (type: FriendType): string => {
  switch (type) {
    case 'coatto':
      return 'COATTO DOC - Sa dove si gira e come si fa casino'
    case 'secchione':
      return 'SECCHIONE - Te lo copi sempre, studia tantissimo'
    case 'sportivo':
      return 'SPORTIVO - Pompa ferro e gioca a calcio'
    case 'ribelle':
      return 'RIBELLE - Non segue le regole di nessuno'
    default:
      return ''
  }
}

export interface FriendAction {
  id: string
  name: string
  description: string
  cost: number
  effects: string
  requirements: (stats: GameStats, friend: Friend) => { canDo: boolean; reason?: string }
  compatibleTypes?: FriendType[]
}

export const FRIEND_ACTIONS: FriendAction[] = [
  {
    id: 'esci',
    name: 'Esci con amico',
    description: 'Vai in giro con lui per il quartiere',
    cost: 1,
    effects: '+10 Coattaggine, +5 Affinità, -10 Soldi',
    requirements: (stats, friend) => {
      if (friend.affinita < 30) {
        return { canDo: false, reason: 'Affinità troppo bassa (min 30)' }
      }
      if (stats.soldi < 10) {
        return { canDo: false, reason: 'Servono 10€' }
      }
      return { canDo: true }
    }
  },
  {
    id: 'palestra',
    name: 'Vai in palestra insieme',
    description: 'Pompate ferro insieme come dei campioni',
    cost: 1,
    effects: '+8 Muscoli, +5 Affinità, -10 Stanchezza bonus',
    requirements: (stats, friend) => {
      if (friend.type !== 'sportivo') {
        return { canDo: false, reason: 'Solo con amici SPORTIVI' }
      }
      if (stats.soldi < 20) {
        return { canDo: false, reason: 'Servono 20€' }
      }
      if (stats.stanchezza > 80) {
        return { canDo: false, reason: 'Troppo stanco' }
      }
      return { canDo: true }
    },
    compatibleTypes: ['sportivo']
  },
  {
    id: 'studia',
    name: 'Studia con lui',
    description: 'Fate i compiti insieme, lui ti aiuta',
    cost: 1,
    effects: '+0.3 Media, +5 Affinità, -8 Stanchezza',
    requirements: (stats, friend) => {
      if (friend.type !== 'secchione') {
        return { canDo: false, reason: 'Solo con amici SECCHIONI' }
      }
      if (stats.stanchezza > 80) {
        return { canDo: false, reason: 'Troppo stanco per studiare' }
      }
      return { canDo: true }
    },
    compatibleTypes: ['secchione']
  },
  {
    id: 'casino',
    name: 'Fai casino insieme',
    description: 'Andate a fare baldoria in giro',
    cost: 1,
    effects: '+15 Coattaggine, +5 Affinità, -20 Soldi',
    requirements: (stats, friend) => {
      if (friend.affinita < 50) {
        return { canDo: false, reason: 'Affinità troppo bassa (min 50)' }
      }
      if (stats.soldi < 20) {
        return { canDo: false, reason: 'Servono 20€' }
      }
      return { canDo: true }
    }
  },
  {
    id: 'litiga',
    name: 'Litiga',
    description: 'Litigate pesantemente',
    cost: 0,
    effects: '-20 Affinità, +5 Coattaggine',
    requirements: () => ({ canDo: true })
  },
  {
    id: 'chiedi_soldi',
    name: 'Chiedi soldi',
    description: 'Gli chiedi un prestito',
    cost: 0,
    effects: '+20-50 Soldi random, -15 Affinità',
    requirements: (stats, friend) => {
      if (friend.affinita < 60) {
        return { canDo: false, reason: 'Affinità troppo bassa (min 60)' }
      }
      return { canDo: true }
    }
  }
]

export const applyFriendActionEffects = (
  actionId: string,
  stats: GameStats,
  friend: Friend
): {
  newStats: Partial<GameStats>
  newAffinita: number
  message: string
} => {
  const action = FRIEND_ACTIONS.find(a => a.id === actionId)
  if (!action) {
    return { newStats: {}, newAffinita: friend.affinita, message: 'Azione non trovata' }
  }
  
  const newStats: Partial<GameStats> = {}
  let newAffinita = friend.affinita
  let message = ''

  switch (actionId) {
    case 'esci':
      newStats.coattaggine = (stats.coattaggine || 0) + 10
      newStats.soldi = (stats.soldi || 0) - 10
      newAffinita += 5
      message = `Serata EPICA con ${friend.name}! +10 Coattaggine, +5 Affinità, -10 Soldi`
      break
      
    case 'palestra':
      newStats.muscoli = (stats.muscoli || 0) + 8
      newStats.soldi = (stats.soldi || 0) - 20
      newStats.stanchezza = Math.max(0, (stats.stanchezza || 0) + 10)
      newAffinita += 5
      message = `Hai pompato con ${friend.name}! +8 Muscoli, +5 Affinità, -20 Soldi`
      break
      
    case 'studia':
      newStats.stanchezza = (stats.stanchezza || 0) + 8
      newAffinita += 5
      message = `Hai studiato con ${friend.name}! +0.3 Media (applica a caso), +5 Affinità, +8 Stanchezza`
      break
      
    case 'casino':
      newStats.coattaggine = (stats.coattaggine || 0) + 15
      newStats.soldi = (stats.soldi || 0) - 20
      newAffinita += 5
      message = `Avete fatto CASINO con ${friend.name}! +15 Coattaggine, +5 Affinità, -20 Soldi`
      break
      
    case 'litiga':
      newStats.coattaggine = (stats.coattaggine || 0) + 5
      newAffinita -= 20
      message = `Hai LITIGATO con ${friend.name}! -20 Affinità, +5 Coattaggine`
      break
      
    case 'chiedi_soldi':
      const amount = Math.floor(Math.random() * 31) + 20
      newStats.soldi = (stats.soldi || 0) + amount
      newAffinita -= 15
      message = `${friend.name} ti ha prestato ${amount}€! -15 Affinità`
      break
  }
  
  newAffinita = Math.max(0, Math.min(100, newAffinita))
  
  return { newStats, newAffinita, message }
}

export const checkBestFriend = (affinita: number): boolean => {
  return affinita >= 100
}

export const checkFriendshipLost = (affinita: number): boolean => {
  return affinita <= 0
}
