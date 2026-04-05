import { useEffect } from 'react'
import { SchoolType } from '@/lib/types'

  showMetallariEvent: boolean
  showPoliceEvent: 
  showBulliEvent: boolean
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
  handleCinema: () => void
  handleMotorino: () => void
  advancePhaseOnly: () => 
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
 

      if (!e.ctrlKey && !e.altKey) return
      if 
      const k
      if (e.altKey &
        setShowKeyboard
        return



        announce('H
      }
      switch (key) {
          handlePal
        case '2':
          break
          handleLav
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
      if (!e.ctrlKey && !e.altKey) return
      if (gameOver || showResetDialog || showMetallariEvent || showAtipaEvent || showPoliceEvent || showStreetRaceEvent || showBulliEvent || showReportCard) return
      if (!schoolType) return

      const key = e.key.toLowerCase()

      if (e.altKey && key === 'h') {
        e.preventDefault()
        setShowKeyboardHelp(true)
        announce('Aiuto scorciatoie da tastiera aperto')
        return






























































