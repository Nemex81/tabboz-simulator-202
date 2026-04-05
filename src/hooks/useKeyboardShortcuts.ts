import { useEffect } from 'react'
import { SchoolType } from '@/lib/types'

interface UseKeyboardShortcutsParams {
  gameOver: boolean
  showResetDialog: boolean
  schoolType: SchoolType | nu
  handlePalestra: () => v
  handleLavoro: () => void
  handleStudia: () => void
  handleOpenMinacciaDialo
  handleProvarciConAtipa:
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
    handleStudia,
    handleOpenMinacciaDialog,
    handleProvarciConAtipa,
    handleCinema,
    setShowResetDialog,
    setShowKeyboardHelp,
 

      if (gameOver || showResetDialog || showMetallariEvent || showAtipaEv
      if 
      const k
      if (e.ctrlKey 
        switch(key) {
          case '2':
          case '4': 
          case '6': hand
          case '8':
          case 'd':
          case 
          case 'n': 
              advan
            break
      }
      if (e.altKey 
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
    announce
  } = params

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver || showResetDialog || showMetallariEvent || showAtipaEvent || showPoliceEvent || showStreetRaceEvent || showBulliEvent || !schoolType) return
      
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
          case '6': handleOpenCorrompiDialog(); break
          case '7': handleOpenMinacciaDialog(); break
          case '8': handleRiposa(); break
          case '9': handleProvarciConAtipa(); break
          case 'd': handleDisco(); break
          case 'c': handleCinema(); break
          case 's': handleShoppingMall(); break
          case 'r': setShowResetDialog(true); break
          case 'n': 
            if (phaseActionsRemaining === 0) {
              advancePhaseOnly()
            }
            break
        }

      
      if (e.altKey && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault()
        if (key === 'h' || key === '?') {
          setShowKeyboardHelp(true)
          announce('Aiuto scorciatoie da tastiera aperto')
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameOver, showResetDialog, showMetallariEvent, showAtipaEvent, showPoliceEvent, showStreetRaceEvent, showBulliEvent, showReportCard, schoolType, phaseActionsRemaining, handlePalestra, handleLampada, handleLavoro, handleMotorino, handleStudia, handleOpenCorrompiDialog, handleOpenMinacciaDialog, handleRiposa, handleProvarciConAtipa, handleDisco, handleCinema, handleShoppingMall, setShowResetDialog, advancePhaseOnly, setShowKeyboardHelp, announce])

