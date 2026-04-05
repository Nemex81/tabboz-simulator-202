import { SchoolType, GameStats, EventConstraint } from '@/lib/types'
import { randomChance } from '@/lib/game-utils'

export interface SchoolEvent {
  type: 'teacher' | 'parent' | 'schoolSpecific'
  title: string
  description: string
  choices: EventChoice[]
  tier?: 1 | 2 | 3   // 1=piccolo, 2=medio (con preavviso), 3=boss
}

export interface EventChoice {
  label: string
  action: () => EventOutcome
}

export interface EventOutcome {
  message: string
  statChanges?: Partial<GameStats>
  gradeChanges?: { subject: string; change: number }
  conductChange?: number
  noteChange?: number
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
              statChanges: { soldi: -50, stanchezza: 30 },
              gradeChanges: { subject: 'random', change: 1 }
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
      tier: 1 as const,
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
                message: 'Hai fatto SCENA MUTA! -1.5 al voto, -10 Coattaggine',
                statChanges: { coattaggine: -10 },
                gradeChanges: { subject: 'random', change: -1.5 }
              }
            }
          }
        },
        {
          label: 'Copia dal compagno',
          action: () => {
            if (randomChance(40)) {
              return {
                message: 'Sei riuscito a copiare! +1 al voto, +5 Coattaggine, -0.3 Condotta',
                statChanges: { coattaggine: 5 },
                gradeChanges: { subject: 'random', change: 1 },
                conductChange: -0.3
              }
            } else {
              return {
                message: 'Il prof ti ha BECCATO! -2 al voto, -15 Coattaggine, -1 Condotta, +1 Nota',
                statChanges: { coattaggine: -15 },
                gradeChanges: { subject: 'random', change: -2 },
                conductChange: -1,
                noteChange: 1
              }
            }
          }
        }
      ]
    },
    {
      type: 'teacher' as const,
      tier: 2 as const,
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
                message: 'Hai copiato TUTTO! +2 al voto, +10 Coattaggine, -0.5 Condotta',
                statChanges: { coattaggine: 10 },
                gradeChanges: { subject: 'random', change: 2 },
                conductChange: -0.5
              }
            } else {
              return {
                message: 'SGAMATO! Il prof ti ha dato ZERO! -2.5 al voto, -20 Coattaggine, -1.5 Condotta, +1 Nota',
                statChanges: { coattaggine: -20 },
                gradeChanges: { subject: 'random', change: -2.5 },
                conductChange: -1.5,
                noteChange: 1
              }
            }
          }
        }
      ]
    },
    {
      type: 'teacher' as const,
      tier: 1 as const,
      title: 'IL PROF È ASSENTE!',
      description: 'Il prof non c\'è! Ora supplente!',
      choices: [
        {
          label: 'Fai casino',
          action: () => ({
            message: 'Hai fatto CASINO in classe! +15 Coattaggine, -1 al voto, -0.8 Condotta',
            statChanges: { coattaggine: 15 },
            gradeChanges: { subject: 'random', change: -1 },
            conductChange: -0.8
          })
        },
        {
          label: 'Studia da solo',
          action: () => ({
            message: 'Hai studiato per i fatti tuoi! +1 al voto, -5 Coattaggine, +0.3 Condotta',
            statChanges: { coattaggine: -5 },
            gradeChanges: { subject: 'random', change: 1 },
            conductChange: 0.3
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

// ─── Eventi Condotta (STEP 4) ─────────────────────────────────────────────────

export const getConductEvent = (condotta: number, note: number = 0): SchoolEvent | null => {
  // Condizione più specifica prima: rischio sospensione
  if (condotta < 4 && note >= 5) {
    return {
      type: 'teacher' as const,
      title: 'RISCHIO SOSPENSIONE!',
      description: `Condotta ${condotta.toFixed(1)} e già ${note} note sul registro! Il consiglio di classe ha discusso il tuo caso...`,
      choices: [
        {
          label: 'Ti scusi pubblicamente',
          action: () => ({
            message: 'Ti sei scusato davanti a tutta la classe. I prof apprezzano il gesto. +0.3 Condotta',
            conductChange: 0.3,
          }),
        },
        {
          label: 'Ti sospendono',
          action: () => ({
            message: 'SOSPESO per 2 giorni! Perdi tempo prezioso e i tuoi pagheranno tutto. -70 Soldi, +1 Sospensione',
            statChanges: { soldi: -70 },
            noteChange: 0,
          }),
        },
      ],
    }
  }

  // Convocazione genitori: condotta critica
  if (condotta < 4) {
    return {
      type: 'teacher' as const,
      title: 'CONVOCAZIONE GENITORI!',
      description: `La tua condotta è crollata a ${condotta.toFixed(1)}! La scuola ha convocato i tuoi genitori d'urgenza...`,
      choices: [
        {
          label: 'Prometti di migliorare',
          action: () => ({
            message: 'Hai promesso solennemente di migliorare. I tuoi ci credono... per ora. +0.5 Condotta, -30 Soldi',
            statChanges: { soldi: -30 },
            conductChange: 0.5,
          }),
        },
        {
          label: 'Fai lo strafottente',
          action: () => ({
            message: 'Hai fatto lo STRAFOTTENTE davanti ai tuoi! Figuraccia cosmica. -0.5 Condotta, -50 Soldi, +10 Coattaggine',
            statChanges: { soldi: -50, coattaggine: 10 },
            conductChange: -0.5,
          }),
        },
      ],
    }
  }

  // Nota sul registro: condotta bassa ma non critica
  if (condotta >= 4 && condotta < 6) {
    return {
      type: 'teacher' as const,
      title: 'NOTA SUL REGISTRO!',
      description: `Il prof ha messo una nota per il tuo comportamento. Condotta attuale: ${condotta.toFixed(1)}`,
      choices: [
        {
          label: 'Accetti la nota',
          action: () => ({
            message: 'Hai accettato la nota in silenzio. Almeno non hai peggiorato... -0.3 Condotta',
            conductChange: -0.3,
          }),
        },
        {
          label: 'Protesti con il prof',
          action: () => ({
            message: 'Hai protestato animatamente! Il prof ne ha messa un\'altra! -0.6 Condotta, +5 Coattaggine',
            statChanges: { coattaggine: 5 },
            conductChange: -0.6,
          }),
        },
      ],
    }
  }

  return null
}

// ─── Tier Eventi Scolastici Scalati (STEP 5) ──────────────────────────────────

export const getScaledTeacherEvent = (schoolType: SchoolType, media: number, condotta: number): SchoolEvent => {
  // Tier POSITIVO — media >= 8
  if (media >= 8) {
    const positiveEvents: SchoolEvent[] = [
      {
        type: 'teacher' as const,
        tier: 1 as const,
        title: 'LODE DEL PROFESSORE!',
        description: `Media ${media.toFixed(1)}! Il prof ti elogia davanti a tutta la classe! Sei il punto di riferimento!`,
        choices: [
          {
            label: 'Ringrazia con umiltà',
            action: () => ({
              message: 'Ti sei comportato da vero studente modello. +0.3 al voto, +0.2 Condotta',
              gradeChanges: { subject: 'random', change: 0.3 },
              conductChange: 0.2,
            }),
          },
          {
            label: 'Fai il modesto',
            action: () => ({
              message: 'La tua umiltà conquista tutti! +0.5 al voto, +0.2 Condotta, +5 Figosità',
              statChanges: { figosita: 5 },
              gradeChanges: { subject: 'random', change: 0.5 },
              conductChange: 0.2,
            }),
          },
        ],
      },
      {
        type: 'teacher' as const,
        tier: 1 as const,
        title: 'COMPITO MODELLO!',
        description: `Il tuo compito è stato scelto come ESEMPIO per tutta la classe! Media: ${media.toFixed(1)}`,
        choices: [
          {
            label: 'Sei orgoglioso',
            action: () => ({
              message: 'Il prof legge il tuo compito ad alta voce! +0.5 al voto, +0.2 Condotta, +10 Figosità',
              statChanges: { figosita: 10 },
              gradeChanges: { subject: 'random', change: 0.5 },
              conductChange: 0.2,
            }),
          },
          {
            label: 'Minimizzi',
            action: () => ({
              message: 'Il prof apprezza la tua modestia! +0.3 al voto, +0.2 Condotta',
              gradeChanges: { subject: 'random', change: 0.3 },
              conductChange: 0.2,
            }),
          },
        ],
      },
      {
        type: 'teacher' as const,
        tier: 2 as const,
        title: 'ELOGIO PUBBLICO!',
        description: `Il preside ti ha citato nell'assemblea come studente modello! Media: ${media.toFixed(1)}`,
        choices: [
          {
            label: 'Accetti il riconoscimento',
            action: () => ({
              message: 'Tutti ti applaudono in assemblea! +0.5 al voto random, +0.2 Condotta, +15 Figosità',
              statChanges: { figosita: 15 },
              gradeChanges: { subject: 'random', change: 0.5 },
              conductChange: 0.2,
            }),
          },
          {
            label: 'Ti imbarazzi davanti a tutti',
            action: () => ({
              message: 'Sei diventato rosso ma i compagni ti supportano! +0.3 al voto, +0.2 Condotta',
              gradeChanges: { subject: 'random', change: 0.3 },
              conductChange: 0.2,
            }),
          },
        ],
      },
    ]
    return positiveEvents[Math.floor(Math.random() * positiveEvents.length)]
  }

  // Tier NEUTRO — media >= 6 e < 8
  if (media >= 6) {
    const neutralEvents: SchoolEvent[] = [
      {
        type: 'teacher' as const,
        tier: 1 as const,
        title: 'INTERROGAZIONE STANDARD!',
        description: `Il prof ti interroga. Media: ${media.toFixed(1)}. Sei abbastanza preparato?`,
        choices: [
          {
            label: 'Rispondi con sicurezza',
            action: () => {
              if (randomChance(55)) {
                return {
                  message: 'Risposta decente! Il prof annuisce. +0.2 al voto',
                  gradeChanges: { subject: 'random', change: 0.2 },
                }
              } else {
                return {
                  message: 'Risposta incompleta. Il prof è deluso. -0.2 al voto',
                  gradeChanges: { subject: 'random', change: -0.2 },
                }
              }
            },
          },
          {
            label: 'Chiedi di parlare dopo',
            action: () => ({
              message: 'Ti rimanda al pomeriggio. Nessuna variazione significativa. ±0 voto',
              gradeChanges: { subject: 'random', change: 0 },
            }),
          },
        ],
      },
      {
        type: 'teacher' as const,
        tier: 1 as const,
        title: 'TEST A SORPRESA!',
        description: `Quiz lampo a risposta multipla! La tua media è ${media.toFixed(1)} — ce la fai?`,
        choices: [
          {
            label: 'Prova a ricordare gli appunti',
            action: () => {
              if (randomChance(60)) {
                return {
                  message: 'Hai risposto abbastanza bene! +0.3 al voto',
                  gradeChanges: { subject: 'random', change: 0.3 },
                }
              } else {
                return {
                  message: 'Hai sbagliato metà risposte. -0.2 al voto',
                  gradeChanges: { subject: 'random', change: -0.2 },
                }
              }
            },
          },
          {
            label: 'Copia dal compagno',
            action: () => {
              if (randomChance(40)) {
                return {
                  message: 'Copiato senza farsi vedere! +0.3 al voto, +5 Coattaggine, -0.2 Condotta',
                  statChanges: { coattaggine: 5 },
                  gradeChanges: { subject: 'random', change: 0.3 },
                  conductChange: -0.2,
                }
              } else {
                return {
                  message: 'SGAMATO! -0.5 al voto, -0.5 Condotta, +1 Nota',
                  gradeChanges: { subject: 'random', change: -0.5 },
                  conductChange: -0.5,
                  noteChange: 1,
                }
              }
            },
          },
        ],
      },
      {
        type: 'teacher' as const,
        tier: 1 as const,
        title: 'DISCUSSIONE IN CLASSE!',
        description: `Il prof apre un dibattito. Media: ${media.toFixed(1)}. Vuoi partecipare?`,
        choices: [
          {
            label: 'Intervieni con una buona idea',
            action: () => ({
              message: 'Contributo apprezzato! +0.2 al voto, +0.2 Condotta',
              gradeChanges: { subject: 'random', change: 0.2 },
              conductChange: 0.2,
            }),
          },
          {
            label: 'Resta in silenzio',
            action: () => ({
              message: 'Nessuna variazione. Il prof non ti nota oggi.',
              gradeChanges: { subject: 'random', change: 0 },
            }),
          },
        ],
      },
    ]
    return neutralEvents[Math.floor(Math.random() * neutralEvents.length)]
  }

  // Tier NEGATIVO — media < 6
  const negativeEvents: SchoolEvent[] = [
    {
      type: 'teacher' as const,
      tier: 2 as const,
      title: 'RECUPERO OBBLIGATORIO!',
      description: `Media ${media.toFixed(1)}! Il prof ti manda al recupero pomeridiano obbligatorio. Devi andarci!`,
      choices: [
        {
          label: 'Vai al recupero',
          action: () => ({
            message: 'Hai fatto il recupero per bene. -0.3 al voto (oggi) ma salvi la situazione. +20 Stanchezza',
            statChanges: { stanchezza: 20 },
            gradeChanges: { subject: 'random', change: -0.3 },
          }),
        },
        {
          label: 'Salta il recupero',
          action: () => ({
            message: 'Il prof ti ha sgamato! -0.5 al voto, -0.5 Condotta, +1 Nota',
            gradeChanges: { subject: 'random', change: -0.5 },
            conductChange: -0.5,
            noteChange: 1,
          }),
        },
      ],
    },
    {
      type: 'teacher' as const,
      tier: 2 as const,
      title: 'CONVOCAZIONE URGENTE!',
      description: `Media ${media.toFixed(1)}! Il coordinatore ti convoca. La situazione è seria!`,
      choices: [
        {
          label: 'Prometti di studiare di più',
          action: () => ({
            message: 'Ti impegni davanti al coordinatore. -0.3 al voto, +0.2 Condotta (buona impressione)',
            gradeChanges: { subject: 'random', change: -0.3 },
            conductChange: 0.2,
          }),
        },
        {
          label: 'Dai la colpa ai prof',
          action: () => ({
            message: 'Il coordinatore non ci crede! -0.5 al voto, -0.5 Condotta, +10 Coattaggine',
            statChanges: { coattaggine: 10 },
            gradeChanges: { subject: 'random', change: -0.5 },
            conductChange: -0.5,
          }),
        },
      ],
    },
    {
      type: 'teacher' as const,
      tier: 1 as const,
      title: 'NOTA DI CLASSE!',
      description: `Comportamento inaccettabile! Media ${media.toFixed(1)} e il prof perde la pazienza!`,
      choices: [
        {
          label: 'Accetti la nota',
          action: () => ({
            message: 'Prendi la nota in silenzio. -0.3 al voto, -0.2 Condotta, +1 Nota',
            gradeChanges: { subject: 'random', change: -0.3 },
            conductChange: -0.2,
            noteChange: 1,
          }),
        },
        {
          label: 'Protesti con veemenza',
          action: () => ({
            message: 'Altra nota! Sei fuori di testa! -0.5 al voto, -0.5 Condotta, +2 Note, +10 Coattaggine',
            statChanges: { coattaggine: 10 },
            gradeChanges: { subject: 'random', change: -0.5 },
            conductChange: -0.5,
            noteChange: 2,
          }),
        },
      ],
    },
  ]

  // Seleziona evento negativo con leggera variazione condotta se bassa
  const _ = condotta // usato per possibili estensioni future
  void _
  return negativeEvents[Math.floor(Math.random() * negativeEvents.length)]
}

// ─── Vincoli Evento ───────────────────────────────────────────────────────────

export const SCHOOL_EVENT_CONSTRAINTS: Record<string, EventConstraint> = {
  interrogazione: {
    allowedPhases: ['mattina'],
    allowedDayTypes: ['feriale'],
    requiresSchoolPeriod: true,
  },
  studioConAmico: {
    allowedPhases: ['pomeriggio'],
    allowedDayTypes: ['feriale'],
    requiresSchoolPeriod: true,
  },
  lavoro: {
    allowedPhases: ['pomeriggio'],
    allowedDayTypes: ['feriale', 'sabato'],
    minSchoolYear: 3,
  },
  uscitaAmici: {
    allowedPhases: ['sera'],
    allowedDayTypes: ['feriale', 'sabato'],
  },
  garaMotorini: {
    allowedPhases: ['pomeriggio', 'sera'],
    allowedDayTypes: ['sabato'],
  },
  discoteca: {
    allowedPhases: ['sera'],
    allowedDayTypes: ['sabato'],
  },
  rissaMetallari: {
    allowedPhases: ['notte'],
    allowedDayTypes: ['sabato'],
    blockedWhenExhausted: false,
  },
  pranzoFamiglia: {
    allowedPhases: ['mattina'],
    allowedDayTypes: ['domenica'],
  },
  studioPrelunedi: {
    allowedPhases: ['pomeriggio', 'sera'],
    allowedDayTypes: ['domenica'],
    requiresSchoolPeriod: true,
  },
}

// ─── Evento Speciale: Domenica Sera — Ansia del Lunedì ───────────────────────

export interface AnsiaDelLunediOutcome {
  level: 'sereno' | 'preoccupato' | 'panico'
  message: string
  choices: Array<{
    label: string
    action: () => EventOutcome
  }>
}

export const getAnsiaDelLunediEvent = (media: number): AnsiaDelLunediOutcome => {
  if (media >= 7.0) {
    return {
      level: 'sereno',
      message: `Media ${media.toFixed(1)} — Sei a posto, lunedì si spacca! 💪`,
      choices: [
        {
          label: 'Rilassati serenamente',
          action: () => ({
            message: 'Sei tranquillo! +5 Carisma, nessuna penalità.',
            statChanges: { carisma: 5 },
          }),
        },
      ],
    }
  }

  if (media >= 5.0) {
    return {
      level: 'preoccupato',
      message: `Media ${media.toFixed(1)} — Hmm, qualche materia fa un po' schifo...`,
      choices: [
        {
          label: 'Studia ancora un po\'',
          action: () => ({
            message: 'Hai studiato! +0.2 media, +15 Stanchezza.',
            statChanges: { stanchezza: 15 },
            gradeChanges: { subject: 'random', change: 0.2 },
          }),
        },
        {
          label: 'Lascia perdere',
          action: () => ({
            message: 'Bah, domani si vede...',
          }),
        },
      ],
    }
  }

  return {
    level: 'panico',
    message: `Media ${media.toFixed(1)} — PANICO TOTALE! Sei a rischio bocciatura! 😱`,
    choices: [
      {
        label: 'Studia ADESSO',
        action: () => ({
          message: 'Notte sui libri! +0.4 media, +25 Stanchezza.',
          statChanges: { stanchezza: 25 },
          gradeChanges: { subject: 'random', change: 0.4 },
        }),
      },
      {
        label: 'Crolla dal sonno',
        action: () => ({
          message: 'Troppo stanco per studiare! -0.1 media.',
          gradeChanges: { subject: 'random', change: -0.1 },
        }),
      },
    ],
  }
}
