import { SchoolType, GameStats } from '@/lib/types'
import { randomChance } from '@/lib/game-utils'

export interface SchoolEvent {
  type: 'teacher' | 'parent' | 'schoolSpecific'
  title: string
  description: string
  choices: EventChoice[]
}

export interface EventChoice {
  label: string
  action: () => EventOutcome
}

export interface EventOutcome {
  message: string
  statChanges?: Partial<GameStats>
  gradeChanges?: { subject: string; change: number }
}

export const getParentEventByMedia = (media: number, stats: GameStats): SchoolEvent | null => {
  if (media < 7) {
    const events = [
      {
        type: 'parent' as const,
        title: 'I TUOI GENITORI SONO FURIOSI!',
        description: `La media è ${media.toFixed(1)}! I tuoi non ti danno la PAGHETTA e ti hanno punito!`,
        choices: [
          {
            label: 'Accetta la punizione',
            action: () => ({
              message: 'Stai a casa tutto il weekend! -20 Figosità, -15 Coattaggine',
              statChanges: { figosita: -20, coattaggine: -15 }
            })
          },
          {
            label: 'Rispondi male',
            action: () => {
              if (randomChance(50)) {
                return {
                  message: 'Ti hanno TOLTO il motorino! -30 Coattaggine, -20 Figosità, -50 Soldi',
                  statChanges: { coattaggine: -30, figosita: -20, soldi: -50 }
                }
              } else {
                return {
                  message: 'Ti hanno messo in castigo! Niente uscite! -25 Figosità',
                  statChanges: { figosita: -25 }
                }
              }
            }
          }
        ]
      },
      {
        type: 'parent' as const,
        title: 'COLLOQUIO CON I PROFESSORI!',
        description: 'I tuoi genitori sono andati a scuola e hanno parlato con i prof! Non sono contenti!',
        choices: [
          {
            label: 'Prometti di studiare',
            action: () => ({
              message: 'Devi studiare di più! Ti hanno dato solo 20€. +20 Soldi',
              statChanges: { soldi: 20 }
            })
          },
          {
            label: 'Dai la colpa ai prof',
            action: () => ({
              message: 'I tuoi non ci credono! Ti hanno tolto la Playstation! -30 Figosità, -10 Coattaggine',
              statChanges: { figosita: -30, coattaggine: -10 }
            })
          }
        ]
      },
      {
        type: 'parent' as const,
        title: 'RIPETIZIONI FORZATE!',
        description: 'I tuoi genitori ti hanno iscritto a ripetizioni! Devi andare ogni giorno!',
        choices: [
          {
            label: 'Vai alle ripetizioni',
            action: () => ({
              message: 'Hai studiato tanto! +1 voto casuale, -50 Soldi (costo ripetizioni), +30 Stanchezza',
              statChanges: { soldi: -50, stanchezza: 30 }
            })
          },
          {
            label: 'Salta le ripetizioni',
            action: () => ({
              message: 'Il prof ha chiamato i tuoi! SGAMATO! -100 Soldi, -20 Coattaggine',
              statChanges: { soldi: -100, coattaggine: -20 }
            })
          }
        ]
      }
    ]
    return events[Math.floor(Math.random() * events.length)]
  }
  return null
}

export const getTeacherEvent = (schoolType: SchoolType): SchoolEvent => {
  const commonEvents = [
    {
      type: 'teacher' as const,
      title: 'INTERROGAZIONE A SORPRESA!',
      description: 'Il prof ti ha chiamato alla cattedra! Non hai studiato!',
      choices: [
        {
          label: 'Prova a rispondere',
          action: () => {
            if (randomChance(30)) {
              return {
                message: 'Per MIRACOLO hai risposto bene! +1 al voto',
                gradeChanges: { subject: 'random', change: 1 }
              }
            } else {
              return {
                message: 'Hai fatto SCENA MUTA! -1 al voto, -10 Coattaggine',
                statChanges: { coattaggine: -10 },
                gradeChanges: { subject: 'random', change: -1 }
              }
            }
          }
        },
        {
          label: 'Copia dal compagno',
          action: () => {
            if (randomChance(40)) {
              return {
                message: 'Sei riuscito a copiare! +1 al voto, +5 Coattaggine',
                statChanges: { coattaggine: 5 },
                gradeChanges: { subject: 'random', change: 1 }
              }
            } else {
              return {
                message: 'Il prof ti ha BECCATO! -2 al voto, -15 Coattaggine',
                statChanges: { coattaggine: -15 },
                gradeChanges: { subject: 'random', change: -2 }
              }
            }
          }
        }
      ]
    },
    {
      type: 'teacher' as const,
      title: 'COMPITO IN CLASSE!',
      description: 'Oggi c\'è il compito! Sei preparato?',
      choices: [
        {
          label: 'Studia all\'ultimo minuto',
          action: () => ({
            message: 'Hai studiato come un PAZZO! +1 al voto, +20 Stanchezza',
            statChanges: { stanchezza: 20 },
            gradeChanges: { subject: 'random', change: 1 }
          })
        },
        {
          label: 'Copia tutto',
          action: () => {
            if (randomChance(50)) {
              return {
                message: 'Hai copiato TUTTO! +2 al voto, +10 Coattaggine',
                statChanges: { coattaggine: 10 },
                gradeChanges: { subject: 'random', change: 2 }
              }
            } else {
              return {
                message: 'SGAMATO! Il prof ti ha dato ZERO! -3 al voto, -20 Coattaggine',
                statChanges: { coattaggine: -20 },
                gradeChanges: { subject: 'random', change: -3 }
              }
            }
          }
        }
      ]
    },
    {
      type: 'teacher' as const,
      title: 'IL PROF È ASSENTE!',
      description: 'Il prof non c\'è! Ora supplente!',
      choices: [
        {
          label: 'Fai casino',
          action: () => ({
            message: 'Hai fatto CASINO in classe! +15 Coattaggine, -5 al voto',
            statChanges: { coattaggine: 15 },
            gradeChanges: { subject: 'random', change: -1 }
          })
        },
        {
          label: 'Studia da solo',
          action: () => ({
            message: 'Hai studiato per i fatti tuoi! +1 al voto, -5 Coattaggine',
            statChanges: { coattaggine: -5 },
            gradeChanges: { subject: 'random', change: 1 }
          })
        }
      ]
    }
  ]

  const specificEvents: { [key in SchoolType]: SchoolEvent[] } = {
    tecnico: [
      {
        type: 'schoolSpecific',
        title: 'PROGETTO DI INFORMATICA!',
        description: 'Devi fare un progetto di programmazione! Hai tempo fino a domani!',
        choices: [
          {
            label: 'Fai il progetto',
            action: () => ({
              message: 'Hai fatto un progetto FIGO! +2 Informatica, +10 Figosità',
              statChanges: { figosita: 10 },
              gradeChanges: { subject: 'informatica', change: 2 }
            })
          },
          {
            label: 'Copia da GitHub',
            action: () => {
              if (randomChance(60)) {
                return {
                  message: 'Hai copiato e modificato! Il prof non se ne è accorto! +1 Informatica, +15 Coattaggine',
                  statChanges: { coattaggine: 15 },
                  gradeChanges: { subject: 'informatica', change: 1 }
                }
              } else {
                return {
                  message: 'Il prof ha riconosciuto il codice! SGAMATO! -2 Informatica, -15 Coattaggine',
                  statChanges: { coattaggine: -15 },
                  gradeChanges: { subject: 'informatica', change: -2 }
                }
              }
            }
          }
        ]
      },
      {
        type: 'schoolSpecific',
        title: 'LABORATORIO DI ELETTRONICA!',
        description: 'Devi montare un circuito! Le resistenze sono tutte mescolate!',
        choices: [
          {
            label: 'Monta con calma',
            action: () => ({
              message: 'Circuito PERFETTO! +2 Elettronica, +5 Figosità',
              statChanges: { figosita: 5 },
              gradeChanges: { subject: 'elettronica', change: 2 }
            })
          },
          {
            label: 'Vai a caso',
            action: () => {
              if (randomChance(30)) {
                return {
                  message: 'Per miracolo funziona! +1 Elettronica',
                  gradeChanges: { subject: 'elettronica', change: 1 }
                }
              } else {
                return {
                  message: 'Hai fatto ESPLODERE il circuito! -2 Elettronica, -10 Coattaggine, -20 Soldi (danni)',
                  statChanges: { coattaggine: -10, soldi: -20 },
                  gradeChanges: { subject: 'elettronica', change: -2 }
                }
              }
            }
          }
        ]
      }
    ],
    agraria: [
      {
        type: 'schoolSpecific',
        title: 'LAVORO IN SERRA!',
        description: 'Devi piantare i pomodori nella serra della scuola!',
        choices: [
          {
            label: 'Lavora bene',
            action: () => ({
              message: 'Hai piantato TUTTO alla perfezione! +2 Agronomia, +10 Muscoli',
              statChanges: { muscoli: 10 },
              gradeChanges: { subject: 'agronomia', change: 2 }
            })
          },
          {
            label: 'Fai il minimo',
            action: () => ({
              message: 'Hai fatto il minimo sindacale! +1 Agronomia, -5 Coattaggine',
              statChanges: { coattaggine: -5 },
              gradeChanges: { subject: 'agronomia', change: 1 }
            })
          }
        ]
      },
      {
        type: 'schoolSpecific',
        title: 'GESTIONE ANIMALI!',
        description: 'Devi occuparti delle mucche! Bisogna mungerle!',
        choices: [
          {
            label: 'Mungi le mucche',
            action: () => ({
              message: 'Hai munto TUTTO! +2 Zootecnia, +10 Muscoli, +20 Stanchezza',
              statChanges: { muscoli: 10, stanchezza: 20 },
              gradeChanges: { subject: 'zootecnia', change: 2 }
            })
          },
          {
            label: 'Scappa dalle mucche',
            action: () => ({
              message: 'Hai CAGATO sotto davanti alle mucche! -15 Coattaggine, -1 Zootecnia',
              statChanges: { coattaggine: -15 },
              gradeChanges: { subject: 'zootecnia', change: -1 }
            })
          }
        ]
      }
    ],
    artistico: [
      {
        type: 'schoolSpecific',
        title: 'ESAME DI DISEGNO!',
        description: 'Devi disegnare un nudo artistico! Il modello è davanti a te!',
        choices: [
          {
            label: 'Disegna con impegno',
            action: () => ({
              message: 'Hai fatto un CAPOLAVORO! +2 Disegno, +15 Figosità',
              statChanges: { figosita: 15 },
              gradeChanges: { subject: 'disegno', change: 2 }
            })
          },
          {
            label: 'Disegna un pupazzo',
            action: () => ({
              message: 'Il prof si è INCAZZATO! -2 Disegno, +10 Coattaggine (hai fatto ridere tutti)',
              statChanges: { coattaggine: 10 },
              gradeChanges: { subject: 'disegno', change: -2 }
            })
          }
        ]
      },
      {
        type: 'schoolSpecific',
        title: 'PROGETTO DI SCULTURA!',
        description: 'Devi scolpire l\'argilla! Cosa fai?',
        choices: [
          {
            label: 'Scultura classica',
            action: () => ({
              message: 'Opera BELLISSIMA! +2 Scultura, +10 Figosità',
              statChanges: { figosita: 10 },
              gradeChanges: { subject: 'scultura', change: 2 }
            })
          },
          {
            label: 'Scultura moderna',
            action: () => {
              if (randomChance(50)) {
                return {
                  message: 'Il prof ha apprezzato la CREATIVITÀ! +3 Scultura, +20 Figosità',
                  statChanges: { figosita: 20 },
                  gradeChanges: { subject: 'scultura', change: 3 }
                }
              } else {
                return {
                  message: 'Il prof ha detto che è BRUTTA! -1 Scultura, -10 Figosità',
                  statChanges: { figosita: -10 },
                  gradeChanges: { subject: 'scultura', change: -1 }
                }
              }
            }
          }
        ]
      }
    ]
  }

  const allEvents = [...commonEvents, ...specificEvents[schoolType]]
  return allEvents[Math.floor(Math.random() * allEvents.length)]
}
