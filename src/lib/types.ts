import type { TraitId } from '@/lib/character-traits'

  soldi: number
  coattaggine: num
  soldi: number
  carisma: number
  coattaggine: number
  media: number
  | 'Invisibile'
  | 'Rispettato'
  | 'Leggenda del Qua
export type SchoolTy
e

export const SUBJECT_WEIGHTS:
    matematica: 1.5,
    fisica: 1.2,
    storia: 1.0,
    filosofia: 1
    edFisica: 
  },

    italiano: 1.0,

    elettronica: 1.3,
    edFisica: 0.7
 

    tecnologia: 1.4,
    ingles
    edFisica: 0.7
  artistico: {
    fisica: 1.2,
    inglese: 1.0,
    storia: 1.0,
    latino: 1.3,
    filosofia: 1.1,
    scienze: 1.0,
    edFisica: 0.7,
    arte: 0.8
  },
  tecnico: {
    matematica: 1.5,
    fisica: 1.3,
    italiano: 1.0,
    storia: 0.8,
    informatica: 1.4,
    scienze: 1.0,
    elettronica: 1.3,
    inglese: 1.0,
    edFisica: 0.7
  },
  professionale: {
    matematica: 1.0,
    italiano: 1.0,
    laboratorio: 1.5,
    tecnologia: 1.4,
    economia: 1.2,
    inglese: 0.9,
    storia: 0.8,
    edFisica: 0.7
  },
  artistico: {
    arte: 1.7,
  name: string
  intelligence?: numb
  lastInteraction?

  id: string
  attractiveness:
  m


  gameTime: GameTime
  gameOverReason: str
  playerProfile?: PlayerP
  scheduledExams?: ScheduledExam[]
}

  soldi: 50,
  coattaggine
  reputazione: 
  stanchezza: 
}

  note: 0,
  sospensioni: 0,


  stats: DEFAULT_STATS,
    matematica: 6,
    storia: 6,
  },
    age: 14,
    schoolYear: {
 

    phaseActionsRemaining: 2

}
export function g
  const subjects: R
    tecnico: ['matema
    artistico: ['arte', 'dis

 



    italiano: 'Italiano',
    inglese: '
    latino: 'Latino',
    scienze: 'Scienz
 

    tecnologia: 'Tecnologia',

  }
}
export interfa
}





















































































    artistico: ['arte', 'disegno', 'storia_arte', 'italiano', 'matematica', 'inglese', 'edFisica']


  return subjects[schoolType].reduce((acc, subject) => {
    acc[subject] = baseGrade
    return acc
  }, {} as SubjectGrades)


export function getSubjectDisplayName(subject: string): string {
  const names: Record<string, string> = {

    italiano: 'Italiano',
    fisica: 'Fisica',
    inglese: 'Inglese',

    latino: 'Latino',
    filosofia: 'Filosofia',
    scienze: 'Scienze',
    edFisica: 'Ed. Fisica',
    arte: 'Arte',
    informatica: 'Informatica',
    elettronica: 'Elettronica',

    tecnologia: 'Tecnologia',
    economia: 'Economia',
    disegno: 'Disegno',
    storia_arte: 'Storia dell\'Arte'
  }
  return names[subject] || subject
}

export interface GamePreferences {
  theme: ThemeVariant
}
