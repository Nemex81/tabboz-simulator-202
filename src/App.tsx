import { useEffect, useRef, useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { 
  Lightning, 
  Barbell, 
  CurrencyDollar, 
  GraduationCap, 
  Battery,
  Sun,
  Briefcase,
  Motorcycle,
  Brain,
  HandCoins,
  Fist,
  Running,
  Heart,
  Sparkle,
  SirenLight,
  Flag,
  ShieldWarning,
  MusicNotes,
  FilmSlate,
  ShoppingCart,
  Crown
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { StatDisplay } from '@/components/StatDisplay'
import { ActionButton } from '@/components/ActionButton'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { GameStats, SubjectGrades, DEFAULT_GAME_STATE } from '@/lib/types'
import { 
  clampStat, 
  calculateMedia, 
  randomChance, 
  checkGameOver,
  calculateReputationFromStats,
  getReputationLevel,
  getReputationEventModifier
} from '@/lib/game-utils'

function App() {
  const [stats, setStats] = useKV<GameStats>('tabboz-stats', DEFAULT_GAME_STATE.stats)
  const [grades, setGrades] = useKV<SubjectGrades>('tabboz-grades', DEFAULT_GAME_STATE.grades)
  const [gameOver, setGameOver] = useState(false)
  const [gameOverReason, setGameOverReason] = useState('')
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [currentEvent, setCurrentEvent] = useState<string>('')
  const [showMetallariEvent, setShowMetallariEvent] = useState(false)
  const [showAtipaEvent, setShowAtipaEvent] = useState(false)
  const [atipaName, setAtipaName] = useState('')
  const [atipaSuccessChance, setAtipaSuccessChance] = useState(0)
  const [showPoliceEvent, setShowPoliceEvent] = useState(false)
  const [showStreetRaceEvent, setShowStreetRaceEvent] = useState(false)
  const [showBulliEvent, setShowBulliEvent] = useState(false)
  const [raceWinChance, setRaceWinChance] = useState(0)
  
  const ariaLiveRef = useRef<HTMLDivElement>(null)
  const prevReputationRef = useRef<number>(stats.reputazione)

  const announce = (message: string) => {
    if (ariaLiveRef.current) {
      ariaLiveRef.current.textContent = message
    }
    toast(message)
  }

  useEffect(() => {
    const newReputation = calculateReputationFromStats(stats)
    const oldLevel = getReputationLevel(prevReputationRef.current)
    const newLevel = getReputationLevel(newReputation)
    
    if (Math.abs(newReputation - stats.reputazione) > 2) {
      setStats((current) => ({ ...current, reputazione: newReputation }))
      
      if (oldLevel !== newLevel) {
        announce(`CAMBIO DI REPUTAZIONE! Ora sei: ${newLevel}`)
      }
    }
    
    prevReputationRef.current = newReputation
  }, [stats.coattaggine, stats.muscoli, stats.figosita, stats.soldi, stats.media])

  useEffect(() => {
    const checkStatus = checkGameOver({ ...stats, media: calculateMedia(grades) })
    if (checkStatus.isOver) {
      setGameOver(true)
      setGameOverReason(checkStatus.reason)
      announce(checkStatus.reason)
    }
  }, [stats, grades])

  const triggerRandomEvent = () => {
    const reputationModifier = getReputationEventModifier(stats.reputazione)
    const baseRoll = Math.random() * 100
    const adjustedRoll = baseRoll * reputationModifier.encounterChanceMultiplier
    
    if (adjustedRoll < 12) {
      const respectBonus = reputationModifier.respectBonus
      if (respectBonus >= 15) {
        announce('I METALLARI ti riconoscono e ti salutano con rispetto! La tua REPUTAZIONE ti precede!')
        return
      }
      setShowMetallariEvent(true)
      setCurrentEvent('Incontro con i METALLARI! Vogliono la tua grana!')
      announce('Evento casuale: Incontro con i METALLARI! Vogliono la tua grana!')
    } else if (adjustedRoll < 22) {
      if (reputationModifier.respectBonus >= 15) {
        announce('I POLIZIOTTI ti hanno fermato ma ti lasciano andare! Sei troppo RISPETTATO nel quartiere!')
        return
      }
      setShowPoliceEvent(true)
      setCurrentEvent('I POLIZIOTTI ti hanno fermato! Controllo documenti!')
      announce('Evento casuale: Controllo della POLIZIA!')
    } else if (adjustedRoll < 30) {
      const winChance = Math.min(85, Math.max(15, 
        (stats.coattaggine * 0.5) + 
        (stats.figosita * 0.3) + 
        (stats.muscoli * 0.2) +
        reputationModifier.positiveOutcomeBonus
      ))
      setRaceWinChance(Math.round(winChance))
      setShowStreetRaceEvent(true)
      setCurrentEvent('Un TAMARRO ti sfida ad una GARA con il motorino!')
      announce(`Evento casuale: GARA di motorini! Possibilità di vincita: ${Math.round(winChance)}%`)
    } else if (adjustedRoll < 36) {
      if (reputationModifier.respectBonus >= 10) {
        announce('I BULLI della scuola ti vedono e si allontanano! Hanno PAURA della tua REPUTAZIONE!')
        return
      }
      setShowBulliEvent(true)
      setCurrentEvent('I BULLI della scuola ti vogliono rubare la merenda!')
      announce('Evento casuale: Incontro con i BULLI!')
    }
  }

  const handleMetallariScappa = () => {
    setShowMetallariEvent(false)
    setStats((current) => ({ ...current, coattaggine: clampStat(current.coattaggine - 10) }))
    announce('Sei scappato come un CONIGLIO! -10 Coattaggine')
  }

  const handleMetallariCombatti = () => {
    setShowMetallariEvent(false)
    if (stats.muscoli > 60) {
      setStats((current) => ({
        ...current,
        coattaggine: clampStat(current.coattaggine + 15),
        soldi: clampStat(current.soldi + 30, 0, 1000)
      }))
      announce('Li hai STESI! +15 Coattaggine, +30 Soldi rubati')
    } else {
      setStats((current) => ({
        ...current,
        soldi: clampStat(current.soldi - 50, 0, 1000),
        muscoli: clampStat(current.muscoli - 5)
      }))
      announce('Ti hanno FATTO IL CULO! -50 Soldi, -5 Muscoli')
    }
  }

  const handlePoliceScappa = () => {
    setShowPoliceEvent(false)
    if (stats.coattaggine > 70) {
      setStats((current) => ({
        ...current,
        coattaggine: clampStat(current.coattaggine + 10)
      }))
      announce('Sei SCAPPATO dai poliziotti! Che COATTO! +10 Coattaggine')
    } else {
      setStats((current) => ({
        ...current,
        soldi: clampStat(current.soldi - 100, 0, 1000),
        coattaggine: clampStat(current.coattaggine - 15)
      }))
      announce('Ti hanno BECCATO! Multa di 100€! -100 Soldi, -15 Coattaggine')
    }
  }

  const handlePoliceCollabora = () => {
    setShowPoliceEvent(false)
    if (stats.soldi >= 50) {
      setStats((current) => ({
        ...current,
        soldi: clampStat(current.soldi - 50, 0, 1000)
      }))
      announce('Hai dato una MAZZETTA! Ti lasciano andare. -50 Soldi')
    } else {
      setStats((current) => ({
        ...current,
        soldi: 0,
        coattaggine: clampStat(current.coattaggine - 20)
      }))
      announce('Non hai GRANA per la mazzetta! Ti hanno portato in questura! -Tutti i Soldi, -20 Coattaggine')
    }
  }

  const handleStreetRaceAccetta = () => {
    setShowStreetRaceEvent(false)
    
    if (randomChance(raceWinChance)) {
      setStats((current) => ({
        ...current,
        coattaggine: clampStat(current.coattaggine + 25),
        figosita: clampStat(current.figosita + 20),
        soldi: clampStat(current.soldi + 150, 0, 1000)
      }))
      announce('Hai VINTO la gara! Sei una LEGGENDA! +25 Coattaggine, +20 Figosità, +150 Soldi')
    } else {
      setStats((current) => ({
        ...current,
        figosita: clampStat(current.figosita - 20),
        coattaggine: clampStat(current.coattaggine - 15),
        soldi: clampStat(current.soldi - 80, 0, 1000)
      }))
      announce('Hai PERSO la gara! Che SCHIFO! -20 Figosità, -15 Coattaggine, -80 Soldi (scommessa)')
    }
  }

  const handleStreetRaceRifiuta = () => {
    setShowStreetRaceEvent(false)
    setStats((current) => ({
      ...current,
      coattaggine: clampStat(current.coattaggine - 15),
      figosita: clampStat(current.figosita - 10)
    }))
    announce('Hai RIFIUTATO la sfida! Sei un FIFONE! -15 Coattaggine, -10 Figosità')
  }

  const handleBulliResisti = () => {
    setShowBulliEvent(false)
    if (stats.muscoli > 50) {
      setStats((current) => ({
        ...current,
        coattaggine: clampStat(current.coattaggine + 20),
        muscoli: clampStat(current.muscoli + 5)
      }))
      announce('Li hai MENATI! Ora ti RISPETTANO! +20 Coattaggine, +5 Muscoli')
    } else {
      setStats((current) => ({
        ...current,
        soldi: clampStat(current.soldi - 30, 0, 1000),
        coattaggine: clampStat(current.coattaggine - 10),
        muscoli: clampStat(current.muscoli - 5)
      }))
      announce('Ti hanno PESTATO! -30 Soldi, -10 Coattaggine, -5 Muscoli')
    }
  }

  const handleBulliCedi = () => {
    setShowBulliEvent(false)
    setStats((current) => ({
      ...current,
      soldi: clampStat(current.soldi - 20, 0, 1000),
      coattaggine: clampStat(current.coattaggine - 15)
    }))
    announce('Hai CEDUTO alla loro prepotenza! Sei un PERDENTE! -20 Soldi, -15 Coattaggine')
  }

  const handlePalestra = () => {
    if (stats.soldi < 20) {
      announce('Non hai abbastanza GRANA per la palestra! Servono 20€')
      return
    }
    setStats((current) => ({
      ...current,
      muscoli: clampStat(current.muscoli + 10),
      figosita: clampStat(current.figosita + 5),
      soldi: clampStat(current.soldi - 20, 0, 1000),
      stanchezza: clampStat(current.stanchezza + 15)
    }))
    announce('Hai pompato FERRO! +10 Muscoli, +5 Figosità, -20 Soldi, +15 Stanchezza')
    triggerRandomEvent()
  }

  const handleLampada = () => {
    if (stats.soldi < 30) {
      announce('Non hai abbastanza GRANA per la lampada! Servono 30€')
      return
    }
    setStats((current) => ({
      ...current,
      coattaggine: clampStat(current.coattaggine + 15),
      figosita: clampStat(current.figosita + 10),
      soldi: clampStat(current.soldi - 30, 0, 1000)
    }))
    announce('Ora sei ABBRONZATISSIMO! +15 Coattaggine, +10 Figosità, -30 Soldi')
    triggerRandomEvent()
  }

  const handleLavoro = () => {
    if (stats.muscoli < 40) {
      announce('Sei troppo SMILZO per fare il buttadifuori! Servono 40 Muscoli')
      return
    }
    if (stats.stanchezza > 80) {
      announce('Sei troppo DISTRUTTO per lavorare! Riposa!')
      return
    }
    setStats((current) => ({
      ...current,
      soldi: clampStat(current.soldi + 80, 0, 1000),
      stanchezza: clampStat(current.stanchezza + 20),
      coattaggine: clampStat(current.coattaggine + 5)
    }))
    announce('Hai lavorato come BUTTADIFUORI! +80 Soldi, +5 Coattaggine, +20 Stanchezza')
    triggerRandomEvent()
  }

  const handleMotorino = () => {
    if (stats.soldi < 50) {
      announce('Non hai abbastanza GRANA per truccare il motorino! Servono 50€')
      return
    }
    setStats((current) => ({
      ...current,
      coattaggine: clampStat(current.coattaggine + 20),
      figosita: clampStat(current.figosita + 15),
      soldi: clampStat(current.soldi - 50, 0, 1000)
    }))
    announce('Motorino TRUCCATO! Ora SGASA di brutto! +20 Coattaggine, +15 Figosità, -50 Soldi')
    triggerRandomEvent()
  }

  const handleStudia = () => {
    if (stats.stanchezza > 80) {
      announce('Sei troppo DISTRUTTO per studiare! Riposa!')
      return
    }
    const subjects = Object.keys(grades) as Array<keyof SubjectGrades>
    const randomSubject = subjects[Math.floor(Math.random() * subjects.length)]
    
    setGrades((current) => ({
      ...current,
      [randomSubject]: clampStat(current[randomSubject] + 1, 0, 10)
    }))
    setStats((current) => ({
      ...current,
      stanchezza: clampStat(current.stanchezza + 20),
      coattaggine: clampStat(current.coattaggine - 5)
    }))
    announce(`Hai studiato ${randomSubject.toUpperCase()}! +1 al voto, +20 Stanchezza, -5 Coattaggine`)
  }

  const handleCorrompi = () => {
    if (stats.soldi < 100) {
      announce('Non hai abbastanza GRANA per la MAZZETTA! Servono 100€')
      return
    }
    const subjects = Object.keys(grades) as Array<keyof SubjectGrades>
    const randomSubject = subjects[Math.floor(Math.random() * subjects.length)]
    
    setGrades((current) => ({
      ...current,
      [randomSubject]: clampStat(current[randomSubject] + 2, 0, 10)
    }))
    setStats((current) => ({
      ...current,
      soldi: clampStat(current.soldi - 100, 0, 1000)
    }))
    announce(`MAZZETTA al prof di ${randomSubject.toUpperCase()}! +2 al voto, -100 Soldi. EZPZ!`)
  }

  const handleMinaccia = () => {
    if (randomChance(30)) {
      setGameOver(true)
      setGameOverReason('Hai PESTATO il prof ma ti hanno ESPULSO! Torna a settembre, violento!')
      announce('ESPULSO dalla scuola per violenza!')
      return
    }
    
    const subjects = Object.keys(grades) as Array<keyof SubjectGrades>
    const randomSubject = subjects[Math.floor(Math.random() * subjects.length)]
    
    setGrades((current) => ({
      ...current,
      [randomSubject]: clampStat(current[randomSubject] + 3, 0, 10)
    }))
    setStats((current) => ({
      ...current,
      coattaggine: clampStat(current.coattaggine + 15)
    }))
    announce(`Hai MINACCIATO il prof di ${randomSubject.toUpperCase()}! +3 al voto, +15 Coattaggine. Rischiosa ma ha funzionato!`)
  }

  const handleRiposa = () => {
    setStats((current) => ({
      ...current,
      stanchezza: clampStat(current.stanchezza - 40)
    }))
    announce('Hai riposato un po\'! -40 Stanchezza')
  }

  const handleDisco = () => {
    if (stats.soldi < 60) {
      announce('Non hai abbastanza GRANA per entrare in discoteca! Servono 60€')
      return
    }
    if (stats.stanchezza > 70) {
      announce('Sei troppo DISTRUTTO per andare in disco! Riposa!')
      return
    }
    
    const reputationModifier = getReputationEventModifier(stats.reputazione)
    
    const successChance = Math.min(85, Math.max(20, 
      (stats.figosita * 0.4) + 
      (stats.coattaggine * 0.3) + 
      (stats.muscoli * 0.2) +
      reputationModifier.positiveOutcomeBonus
    ))
    
    if (randomChance(successChance)) {
      setStats((current) => ({
        ...current,
        figosita: clampStat(current.figosita + 25),
        coattaggine: clampStat(current.coattaggine + 15),
        soldi: clampStat(current.soldi - 60, 0, 1000),
        stanchezza: clampStat(current.stanchezza + 25)
      }))
      announce('Serata EPICA in disco! Hai fatto STRAGE! +25 Figosità, +15 Coattaggine, -60 Soldi, +25 Stanchezza')
    } else {
      setStats((current) => ({
        ...current,
        figosita: clampStat(current.figosita - 10),
        soldi: clampStat(current.soldi - 60, 0, 1000),
        stanchezza: clampStat(current.stanchezza + 20)
      }))
      announce('Serata SCARSA in disco! Nessuno ti ha filato! -10 Figosità, -60 Soldi, +20 Stanchezza')
    }
    triggerRandomEvent()
  }

  const handleCinema = () => {
    if (stats.soldi < 40) {
      announce('Non hai abbastanza GRANA per il cinema! Servono 40€')
      return
    }
    
    const roll = Math.random()
    if (roll < 0.4) {
      const names = ['Jessica', 'Samantha', 'Deborah', 'Vanessa', 'Sabrina', 'Jennifer']
      const randomName = names[Math.floor(Math.random() * names.length)]
      setStats((current) => ({
        ...current,
        figosita: clampStat(current.figosita + 15),
        soldi: clampStat(current.soldi - 80, 0, 1000),
        stanchezza: clampStat(current.stanchezza - 10)
      }))
      announce(`Hai incontrato ${randomName} al cinema! Avete visto il film INSIEME! +15 Figosità, -80 Soldi (biglietti + popcorn), -10 Stanchezza`)
    } else {
      setStats((current) => ({
        ...current,
        soldi: clampStat(current.soldi - 40, 0, 1000),
        stanchezza: clampStat(current.stanchezza - 15)
      }))
      announce('Hai visto un bel film! Serata tranquilla. -40 Soldi, -15 Stanchezza')
    }
    triggerRandomEvent()
  }

  const handleShoppingMall = () => {
    if (stats.soldi < 100) {
      announce('Non hai abbastanza GRANA per fare shopping! Servono 100€')
      return
    }
    
    setStats((current) => ({
      ...current,
      figosita: clampStat(current.figosita + 20),
      coattaggine: clampStat(current.coattaggine + 10),
      soldi: clampStat(current.soldi - 100, 0, 1000)
    }))
    announce('Hai comprato VESTITI FICHISSIMI! Ora sei una BOMBA! +20 Figosità, +10 Coattaggine, -100 Soldi')
    triggerRandomEvent()
  }

  const handleProvarciConAtipa = () => {
    const names = ['Jessica', 'Samantha', 'Deborah', 'Vanessa', 'Sabrina', 'Jennifer']
    const randomName = names[Math.floor(Math.random() * names.length)]
    setAtipaName(randomName)
    
    const reputationModifier = getReputationEventModifier(stats.reputazione)
    
    const successChance = Math.min(90, Math.max(10, 
      (stats.figosita * 0.4) + 
      (stats.coattaggine * 0.3) + 
      (stats.muscoli * 0.2) + 
      (stats.soldi / 10) +
      reputationModifier.positiveOutcomeBonus
    ))
    
    setAtipaSuccessChance(Math.round(successChance))
    setCurrentEvent(`Hai adocchiato ${randomName} al centro commerciale! Ti vuoi provare?`)
    setShowAtipaEvent(true)
    announce(`Evento: Hai incontrato ${randomName}! Possibilità di successo: ${Math.round(successChance)}% (bonus reputazione: +${reputationModifier.positiveOutcomeBonus})`)
  }

  const handleAtipaRinuncia = () => {
    setShowAtipaEvent(false)
    setStats((current) => ({ ...current, coattaggine: clampStat(current.coattaggine - 5) }))
    announce(`Hai CAGATO sotto! -5 Coattaggine`)
  }

  const handleAtipaProva = () => {
    setShowAtipaEvent(false)
    
    if (randomChance(atipaSuccessChance)) {
      setStats((current) => ({
        ...current,
        figosita: clampStat(current.figosita + 20),
        coattaggine: clampStat(current.coattaggine + 10),
        soldi: clampStat(current.soldi - 80, 0, 1000)
      }))
      announce(`${atipaName} ha detto SÌ! Uscita EPICA! +20 Figosità, +10 Coattaggine, -80 Soldi (cinema + pizza)`)
    } else {
      setStats((current) => ({
        ...current,
        figosita: clampStat(current.figosita - 15),
        coattaggine: clampStat(current.coattaggine - 10)
      }))
      announce(`${atipaName} ti ha dato il PALO! Bruciata DEVASTANTE! -15 Figosità, -10 Coattaggine`)
    }
  }

  const handleReset = () => {
    setStats(DEFAULT_GAME_STATE.stats)
    setGrades(DEFAULT_GAME_STATE.grades)
    setGameOver(false)
    setGameOverReason('')
    setShowResetDialog(false)
    announce('Gioco RESETTATO! Ricominci da capo!')
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver || showResetDialog || showMetallariEvent || showAtipaEvent || showPoliceEvent || showStreetRaceEvent || showBulliEvent) return
      
      if (!e.ctrlKey && !e.altKey) return
      
      const key = e.key.toLowerCase()
      
      if (e.ctrlKey && !e.altKey && !e.shiftKey) {
        e.preventDefault()
        switch(key) {
          case '1': handlePalestra(); break
          case '2': handleLampada(); break
          case '3': handleLavoro(); break
          case '4': handleMotorino(); break
          case '5': handleStudia(); break
          case '6': handleCorrompi(); break
          case '7': handleMinaccia(); break
          case '8': handleRiposa(); break
          case '9': handleProvarciConAtipa(); break
          case 'd': handleDisco(); break
          case 'c': handleCinema(); break
          case 's': handleShoppingMall(); break
          case 'r': setShowResetDialog(true); break
        }
      }
      
      if (e.altKey && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault()
        if (key === 'h' || key === '?') {
          announce('Tasti rapidi: Ctrl+1=Palestra, Ctrl+2=Lampada, Ctrl+3=Lavoro, Ctrl+4=Motorino, Ctrl+5=Studia, Ctrl+6=Corrompi, Ctrl+7=Minaccia, Ctrl+8=Riposa, Ctrl+9=Atipa, Ctrl+D=Disco, Ctrl+C=Cinema, Ctrl+S=Shopping, Ctrl+R=Reset')
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameOver, showResetDialog, showMetallariEvent, showAtipaEvent, showPoliceEvent, showStreetRaceEvent, showBulliEvent, stats, grades])

  const currentMedia = calculateMedia(grades)

  return (
    <main className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div 
        ref={ariaLiveRef}
        role="status" 
        aria-live="assertive" 
        aria-atomic="true"
        className="sr-only"
      />

      <div className="max-w-6xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-4xl md:text-6xl font-black text-primary neon-text-glow mb-2 tracking-wider">
            TABBOZ SIMULATOR
          </h1>
          <p className="text-xl md:text-2xl text-secondary font-bold">2026 EDITION - VITA DA COATTO</p>
          <p className="text-sm text-muted-foreground mt-4">
            Usa <kbd className="px-2 py-1 bg-muted rounded text-primary">Ctrl+numero</kbd> o <kbd className="px-2 py-1 bg-muted rounded text-primary">Ctrl+lettera</kbd> per le scorciatoie. <kbd className="px-2 py-1 bg-muted rounded text-primary">Alt+H</kbd> per la lista completa
          </p>
        </header>

        <section aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="text-2xl font-bold mb-4 text-secondary">
            LE TUE STATISTICHE
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatDisplay 
              icon={<Lightning size={32} weight="fill" />}
              label="Coattaggine"
              value={stats.coattaggine}
            />
            <StatDisplay 
              icon={<Barbell size={32} weight="fill" />}
              label="Muscoli"
              value={stats.muscoli}
            />
            <StatDisplay 
              icon={<Sparkle size={32} weight="fill" />}
              label="Figosità"
              value={stats.figosita}
            />
            <StatDisplay 
              icon={<CurrencyDollar size={32} weight="fill" />}
              label="Soldi"
              value={stats.soldi}
              max={1000}
            />
            <StatDisplay 
              icon={<GraduationCap size={32} weight="fill" />}
              label="Media"
              value={currentMedia}
              max={10}
            />
            <StatDisplay 
              icon={<Battery size={32} weight="fill" />}
              label="Stanchezza"
              value={stats.stanchezza}
            />
          </div>
          <div className="mt-6">
            <Card className="p-4 border-2 border-primary bg-card/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Crown size={40} weight="fill" className="text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground uppercase font-semibold">
                      REPUTAZIONE
                    </div>
                    <div className="text-2xl font-bold text-primary neon-text-glow">
                      {getReputationLevel(stats.reputazione)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black text-primary">
                    {Math.round(stats.reputazione)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    / 100
                  </div>
                </div>
              </div>
              <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 neon-glow"
                  style={{ width: `${stats.reputazione}%` }}
                />
              </div>
            </Card>
          </div>
        </section>

        <section aria-labelledby="grades-heading">
          <h2 id="grades-heading" className="text-2xl font-bold mb-4 text-secondary">
            VOTI SCOLASTICI
          </h2>
          <Card className="p-6 border-2 border-secondary bg-card">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(grades).map(([subject, grade]) => (
                <div key={subject} className="text-center">
                  <div className="text-sm text-muted-foreground uppercase font-semibold mb-1">
                    {subject}
                  </div>
                  <div className={`text-3xl font-bold ${grade < 6 ? 'text-destructive' : 'text-secondary'}`}>
                    {grade}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border text-center">
              <span className="text-muted-foreground">Media totale: </span>
              <span className={`text-2xl font-bold ${currentMedia < 6 ? 'text-destructive' : 'text-accent'}`}>
                {currentMedia.toFixed(1)}
              </span>
              {currentMedia < 4 && (
                <span className="ml-3 text-destructive font-bold animate-pulse">BOCCIATO!</span>
              )}
            </div>
          </Card>
        </section>

        <section aria-labelledby="school-heading">
          <h2 id="school-heading" className="text-2xl font-bold mb-4 text-secondary">
            AZIONI SCUOLA
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ActionButton
              icon={<Brain size={48} />}
              label="Studia"
              shortcut="Ctrl+5"
              onClick={handleStudia}
              disabled={stats.stanchezza > 80}
              variant="secondary"
              ariaLabel="Studia per aumentare i voti. Costa stanchezza, riduce coattaggine. Tasto rapido: Ctrl+5"
            />
            <ActionButton
              icon={<HandCoins size={48} />}
              label="Corrompi"
              shortcut="Ctrl+6"
              onClick={handleCorrompi}
              disabled={stats.soldi < 100}
              variant="default"
              ariaLabel="Corrompi un professore con una mazzetta da 100 euro. Aumenta i voti. Tasto rapido: Ctrl+6"
            />
            <ActionButton
              icon={<Fist size={48} />}
              label="Minaccia"
              shortcut="Ctrl+7"
              onClick={handleMinaccia}
              variant="destructive"
              ariaLabel="Minaccia un professore. Rischio 30% di espulsione! Aumenta molto i voti e la coattaggine. Tasto rapido: Ctrl+7"
            />
            <ActionButton
              icon={<Battery size={48} />}
              label="Riposa"
              shortcut="Ctrl+8"
              onClick={handleRiposa}
              variant="secondary"
              ariaLabel="Riposa per ridurre la stanchezza. Tasto rapido: Ctrl+8"
            />
          </div>
        </section>

        <section aria-labelledby="actions-heading">
          <h2 id="actions-heading" className="text-2xl font-bold mb-4 text-secondary">
            AZIONI VITA SOCIALE
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
            <ActionButton
              icon={<Barbell size={48} />}
              label="Palestra"
              shortcut="Ctrl+1"
              onClick={handlePalestra}
              disabled={stats.soldi < 20}
              ariaLabel="Vai in palestra per pompare muscoli. Costa 20 euro e aumenta la stanchezza. Tasto rapido: Ctrl+1"
            />
            <ActionButton
              icon={<Sun size={48} />}
              label="Lampada"
              shortcut="Ctrl+2"
              onClick={handleLampada}
              disabled={stats.soldi < 30}
              ariaLabel="Vai alla lampada abbronzante per aumentare la coattaggine. Costa 30 euro. Tasto rapido: Ctrl+2"
            />
            <ActionButton
              icon={<Briefcase size={48} />}
              label="Lavoro"
              shortcut="Ctrl+3"
              onClick={handleLavoro}
              disabled={stats.muscoli < 40 || stats.stanchezza > 80}
              ariaLabel="Lavora come buttadifuori. Richiede 40 muscoli. Guadagni soldi e coattaggine. Tasto rapido: Ctrl+3"
            />
            <ActionButton
              icon={<Motorcycle size={48} />}
              label="Motorino"
              shortcut="Ctrl+4"
              onClick={handleMotorino}
              disabled={stats.soldi < 50}
              ariaLabel="Trucca il motorino per aumentare molto la coattaggine. Costa 50 euro. Tasto rapido: Ctrl+4"
            />
            <ActionButton
              icon={<Heart size={48} />}
              label="Atipa"
              shortcut="Ctrl+9"
              onClick={handleProvarciConAtipa}
              disabled={stats.soldi < 80}
              variant="default"
              ariaLabel="Prova a rimorchiare un'atipa. Richiede 80 euro per l'uscita. Dipende da Figosità, Coattaggine e Muscoli. Tasto rapido: Ctrl+9"
            />
            <ActionButton
              icon={<MusicNotes size={48} />}
              label="Discoteca"
              shortcut="Ctrl+D"
              onClick={handleDisco}
              disabled={stats.soldi < 60 || stats.stanchezza > 70}
              variant="default"
              ariaLabel="Vai in discoteca per ballare e fare colpo. Costa 60 euro. Tasto rapido: Ctrl+D"
            />
            <ActionButton
              icon={<FilmSlate size={48} />}
              label="Cinema"
              shortcut="Ctrl+C"
              onClick={handleCinema}
              disabled={stats.soldi < 40}
              variant="secondary"
              ariaLabel="Vai al cinema per rilassarti e magari incontrare qualcuno. Costa 40 euro. Tasto rapido: Ctrl+C"
            />
            <ActionButton
              icon={<ShoppingCart size={48} />}
              label="Shopping"
              shortcut="Ctrl+S"
              onClick={handleShoppingMall}
              disabled={stats.soldi < 100}
              variant="default"
              ariaLabel="Fai shopping per comprare vestiti nuovi. Costa 100 euro. Tasto rapido: Ctrl+S"
            />
          </div>
        </section>

        <footer className="text-center">
          <Button
            onClick={() => setShowResetDialog(true)}
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            Reset Gioco (Ctrl+R)
          </Button>
        </footer>
      </div>

      <AlertDialog open={showMetallariEvent} onOpenChange={setShowMetallariEvent}>
        <AlertDialogContent className="border-2 border-destructive">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-destructive">
              ⚠️ EVENTO CASUALE ⚠️
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg">
              {currentEvent}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleMetallariScappa} className="border-2">
              <Running size={24} className="mr-2" />
              Scappa (-10 Coattaggine)
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleMetallariCombatti} className="bg-destructive border-2">
              <Fist size={24} className="mr-2" />
              Combatti (Serve Muscoli &gt; 60)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showAtipaEvent} onOpenChange={setShowAtipaEvent}>
        <AlertDialogContent className="border-2 border-accent">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-accent flex items-center gap-2">
              <Heart size={32} weight="fill" className="text-accent" />
              RIMORCHIO TIME!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg space-y-2">
              <p>{currentEvent}</p>
              <p className="text-primary font-bold">
                Probabilità di successo: {atipaSuccessChance}%
              </p>
              <p className="text-sm text-muted-foreground">
                (Basato su Figosità, Coattaggine, Muscoli e Soldi)
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleAtipaRinuncia} className="border-2">
              <Running size={24} className="mr-2" />
              Lascia stare (-5 Coattaggine)
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleAtipaProva} className="bg-accent border-2">
              <Heart size={24} weight="fill" className="mr-2" />
              PROVA! (Costa 80€)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showPoliceEvent} onOpenChange={setShowPoliceEvent}>
        <AlertDialogContent className="border-2 border-secondary">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-secondary flex items-center gap-2">
              <SirenLight size={32} weight="fill" className="text-secondary animate-pulse" />
              CONTROLLO POLIZIA!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg">
              {currentEvent}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handlePoliceScappa} className="border-2 border-destructive">
              <Running size={24} className="mr-2" />
              Scappa! (Serve Coattaggine &gt; 70)
            </AlertDialogCancel>
            <AlertDialogAction onClick={handlePoliceCollabora} className="bg-secondary border-2">
              <HandCoins size={24} className="mr-2" />
              Dai Mazzetta (50€)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showStreetRaceEvent} onOpenChange={setShowStreetRaceEvent}>
        <AlertDialogContent className="border-2 border-primary">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-primary flex items-center gap-2">
              <Flag size={32} weight="fill" className="text-primary" />
              GARA DI MOTORINI!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg space-y-2">
              <p>{currentEvent}</p>
              <p className="text-primary font-bold">
                Probabilità di vincita: {raceWinChance}%
              </p>
              <p className="text-sm text-muted-foreground">
                (Basato su Coattaggine, Figosità e Muscoli)
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleStreetRaceRifiuta} className="border-2">
              <Running size={24} className="mr-2" />
              Rifiuta (-15 Coattaggine)
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleStreetRaceAccetta} className="bg-primary border-2">
              <Flag size={24} weight="fill" className="mr-2" />
              ACCETTA LA SFIDA!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showBulliEvent} onOpenChange={setShowBulliEvent}>
        <AlertDialogContent className="border-2 border-destructive">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-destructive flex items-center gap-2">
              <ShieldWarning size={32} weight="fill" className="text-destructive" />
              INCONTRO CON I BULLI!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg">
              {currentEvent}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleBulliCedi} className="border-2">
              <HandCoins size={24} className="mr-2" />
              Cedi (-20 Soldi, -15 Coattaggine)
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleBulliResisti} className="bg-destructive border-2">
              <Fist size={24} className="mr-2" />
              Resisti! (Serve Muscoli &gt; 50)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={gameOver} onOpenChange={() => {}}>
        <AlertDialogContent className="border-2 border-destructive">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-3xl text-destructive text-center">
              GAME OVER!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xl text-center font-bold py-4">
              {gameOverReason}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleReset} className="w-full">
              Ricomincia da Capo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Perderai TUTTA la progressione e ricomincerai da capo. Sicuro di voler resettare?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset} className="bg-destructive">
              Sì, Resetta Tutto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}

export default App
