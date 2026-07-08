import { useEffect } from 'react'
import { SchoolType } from '@/lib/types'

interface UseKeyboardShortcutsParams {
  currentPhase: string | null | undefined
  gameOver: boolean
  showResetDialog: boolean
  showMetallariEvent: boolean
  showAtipaEvent: boolean
  showPoliceEvent: boolean
  showStreetRaceEvent: boolean
  showBulliEvent: boolean
  showReportCard: boolean
  schoolType: SchoolType | null
  phaseActionsRemaining: number
  handlePalestra: () => void
  handleLampada: () => void
  handleLavoro: () => void
  handleMotorino: () => void
  handleStudia: () => void
  handleOpenCorrompiDialog: () => void
  handleOpenMinacciaDialog: () => void
  handleRiposa: () => void
  handleDormi: () => void
  handleProvarciConAtipa: () => void
  handleDisco: () => void
  handleCinema: () => void
  handleShoppingMall: () => void
  setShowResetDialog: (show: boolean) => void
  advancePhaseOnly: () => void
  openKeyboardHelp: () => void
  setActiveTab: (tab: string) => void
  announce: (message: string) => void
  currentLocation: string
  soldi: number
}

export function useKeyboardShortcuts(params: UseKeyboardShortcutsParams) {
  const {
    currentPhase,
    gameOver,
    showResetDialog,
    showMetallariEvent,
    showAtipaEvent,
    showPoliceEvent,
    showStreetRaceEvent,
    showBulliEvent,
    showReportCard,
    schoolType,
    phaseActionsRemaining,
    handlePalestra,
    handleLampada,
    handleLavoro,
    handleMotorino,
    handleStudia,
    handleOpenCorrompiDialog,
    handleOpenMinacciaDialog,
    handleRiposa,
    handleDormi,
    handleProvarciConAtipa,
    handleDisco,
    handleCinema,
    handleShoppingMall,
    setShowResetDialog,
    advancePhaseOnly,
    openKeyboardHelp,
    setActiveTab,
    announce,
    currentLocation,
    soldi
  } = params

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignora se si digita in campi di testo
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return
      }

      const key = e.key.toLowerCase()

      if (!e.ctrlKey && !e.altKey) return
      if (gameOver || showResetDialog || showMetallariEvent || showAtipaEvent || showPoliceEvent || showStreetRaceEvent || showBulliEvent || showReportCard) return
      if (!schoolType) return

      // ALT KEY SHORTCUTS: Navigazione Tab principali
      if (e.altKey) {
        switch (key) {
          case 'k':
            e.preventDefault()
            openKeyboardHelp()
            announce('Aiuto scorciatoie da tastiera aperto')
            return
          case 'h':
            e.preventDefault()
            setActiveTab('home')
            announce('Tab Home aperto')
            return
          case 'l':
            e.preventDefault()
            setActiveTab('location')
            announce('Tab Luogo aperto')
            return
          case 'c':
            e.preventDefault()
            setActiveTab('city')
            announce('Tab Città aperto')
            return
          case 'p':
            e.preventDefault()
            setActiveTab('character')
            announce('Tab Personaggio aperto')
            return
        }
      }

      if (!e.ctrlKey) return

      // CTRL KEY SHORTCUTS: Azioni di gioco (con vincolo di posizione fisica)
      switch (key) {
        case '0':
          e.preventDefault()
          const locationNames: Record<string, string> = {
            cameretta: 'Tua Cameretta',
            scuola: 'Liceo Copernico',
            quartiere: 'Piazza del Quartiere',
            palestra: 'Palestra Fit & Co.',
            lavoro: 'Luogo di Lavoro',
            shopping: 'Centro Commerciale',
            cinema: 'Cinema Multisala',
            disco: 'Discoteca',
            officina: 'Officina Clandestina',
            concessionaria: 'Gennaro Moto',
          }
          const locName = locationNames[currentLocation] || 'Strada'
          announce(`Stato rapido. Soldi in tasca: ${soldi} euro. Ti trovi in: ${locName}. Azioni rimaste in questa fase: ${phaseActionsRemaining}.`)
          break
        case '1':
          e.preventDefault()
          if (currentLocation !== 'palestra') {
            announce('Azione bloccata: devi prima spostarti in Palestra!')
            break
          }
          handlePalestra()
          break
        case '2':
          e.preventDefault()
          if (currentLocation !== 'lampada') {
            announce('Azione bloccata: devi prima spostarti al Centro Abbronzatura!')
            break
          }
          handleLampada()
          break
        case '3':
          e.preventDefault()
          if (currentLocation !== 'lavoro') {
            announce('Azione bloccata: devi prima spostarti sul posto di Lavoro!')
            break
          }
          handleLavoro()
          break
        case '4':
          e.preventDefault()
          if (currentLocation !== 'officina') {
            announce('Azione bloccata: devi prima spostarti in Officina!')
            break
          }
          handleMotorino()
          break
        case '5':
          e.preventDefault()
          if (currentLocation !== 'scuola') {
            announce('Azione bloccata: devi trovarti a Scuola per studiare!')
            break
          }
          handleStudia()
          break
        case '6':
          e.preventDefault()
          if (currentLocation !== 'scuola') {
            announce('Azione bloccata: devi trovarti a Scuola per corrompere i prof!')
            break
          }
          handleOpenCorrompiDialog()
          break
        case '7':
          e.preventDefault()
          if (currentLocation !== 'scuola') {
            announce('Azione bloccata: devi trovarti a Scuola per minacciare i prof!')
            break
          }
          handleOpenMinacciaDialog()
          break
        case '8':
          e.preventDefault()
          if (currentLocation !== 'cameretta') {
            announce('Azione bloccata: puoi riposare solo in Cameretta!')
            break
          }
          handleRiposa()
          break
        case '9':
          e.preventDefault()
          if (currentLocation !== 'quartiere') {
            announce('Azione bloccata: devi trovarti in Piazza nel Quartiere per rimorchiare!')
            break
          }
          handleProvarciConAtipa()
          break
        case 'd':
          e.preventDefault()
          if (currentLocation !== 'disco') {
            announce('Azione bloccata: devi prima spostarti in Discoteca!')
            break
          }
          handleDisco()
          break
        case 'c':
          e.preventDefault()
          if (currentLocation !== 'cinema') {
            announce('Azione bloccata: devi prima spostarti al Cinema!')
            break
          }
          handleCinema()
          break
        case 's':
          e.preventDefault()
          if (currentLocation !== 'shopping') {
            announce('Azione bloccata: devi prima spostarti al Centro Commerciale!')
            break
          }
          handleShoppingMall()
          break
        case 'f':
          e.preventDefault()
          setActiveTab('character')
          announce('Scheda personaggio aperta. Naviga ai tab per trovare Amici e Relazioni.')
          break
        case 't':
          e.preventDefault()
          setActiveTab('character')
          announce('Scheda personaggio aperta. Naviga al tab Relazioni per interesse romantico e partner.')
          break
        case 'r':
          e.preventDefault()
          setShowResetDialog(true)
          announce('Dialogo di reset aperto')
          break
        case 'enter':
          if (!e.altKey) break
          e.preventDefault()
          if (currentPhase === 'notte') {
            if (currentLocation !== 'cameretta') {
              announce('Azione bloccata: devi essere in Cameretta per dormire!')
              break
            }
            handleDormi()
            break
          }
          advancePhaseOnly()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [
    currentPhase,
    gameOver,
    showResetDialog,
    showMetallariEvent,
    showAtipaEvent,
    showPoliceEvent,
    showStreetRaceEvent,
    showBulliEvent,
    showReportCard,
    schoolType,
    phaseActionsRemaining,
    handlePalestra,
    handleLampada,
    handleLavoro,
    handleMotorino,
    handleStudia,
    handleOpenCorrompiDialog,
    handleOpenMinacciaDialog,
    handleRiposa,
    handleDormi,
    handleProvarciConAtipa,
    handleDisco,
    handleCinema,
    handleShoppingMall,
    setShowResetDialog,
    advancePhaseOnly,
    openKeyboardHelp,
    setActiveTab,
    announce,
    currentLocation,
    soldi
  ])
}
