import { useEffect } from 'react'
import { SchoolType } from '@/lib/types'

interface UseKeyboardShortcutsParams {
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
  handleProvarciConAtipa: () => void
  handleDisco: () => void
  handleCinema: () => void
  handleShoppingMall: () => void
  setShowResetDialog: (show: boolean) => void
  advancePhaseOnly: () => void
  setShowKeyboardHelp: (show: boolean) => void
  setActiveTab: (tab: string) => void
  announce: (message: string) => void
}

export function useKeyboardShortcuts(params: UseKeyboardShortcutsParams) {
  const {
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
    handleProvarciConAtipa,
    handleDisco,
    handleCinema,
    handleShoppingMall,
    setShowResetDialog,
    advancePhaseOnly,
    setShowKeyboardHelp,
    setActiveTab,
    announce
  } = params

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.altKey) return
      if (gameOver || showResetDialog || showMetallariEvent || showAtipaEvent || showPoliceEvent || showStreetRaceEvent || showBulliEvent || showReportCard) return
      if (!schoolType) return

      const key = e.key.toLowerCase()

      if (e.altKey && key === 'h') {
        e.preventDefault()
        setShowKeyboardHelp(true)
        announce('Aiuto scorciatoie da tastiera aperto')
        return
      }
      if (e.altKey && key === 's') {
        e.preventDefault()
        setActiveTab('school')
        announce('Tab Scuola aperto')
        return
      }

      if (!e.ctrlKey) return

      switch (key) {
        case '1':
          e.preventDefault()
          handlePalestra()
          break
        case '2':
          e.preventDefault()
          handleLampada()
          break
        case '3':
          e.preventDefault()
          handleLavoro()
          break
        case '4':
          e.preventDefault()
          handleMotorino()
          break
        case '5':
          e.preventDefault()
          handleStudia()
          break
        case '6':
          e.preventDefault()
          handleOpenCorrompiDialog()
          break
        case '7':
          e.preventDefault()
          handleOpenMinacciaDialog()
          break
        case '8':
          e.preventDefault()
          handleRiposa()
          break
        case '9':
          e.preventDefault()
          handleProvarciConAtipa()
          break
        case 'd':
          e.preventDefault()
          handleDisco()
          break
        case 'c':
          e.preventDefault()
          handleCinema()
          break
        case 's':
          e.preventDefault()
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
        case 'n':
          e.preventDefault()
          if (phaseActionsRemaining === 0) {
            advancePhaseOnly()
          } else {
            announce(`Devi consumare prima le ${phaseActionsRemaining} azioni rimaste!`)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [
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
    handleProvarciConAtipa,
    handleDisco,
    handleCinema,
    handleShoppingMall,
    setShowResetDialog,
    advancePhaseOnly,
    setShowKeyboardHelp,
    setActiveTab,
    announce
  ])
}
