import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useAppDialogs } from './useAppDialogs'

describe('useAppDialogs', () => {
  it('inizializza i dialog principali chiusi e morningDisplay a null', () => {
    const { result } = renderHook(() => useAppDialogs())

    expect(result.current.gameOver).toBe(false)
    expect(result.current.showResetDialog).toBe(false)
    expect(result.current.showJobSelectionDialog).toBe(false)
    expect(result.current.showTeacherDialog).toBe(false)
    expect(result.current.morningDisplay).toBeNull()
    expect(result.current.availableJobsForDialog).toEqual([])
  })

  it('aggiorna lo stato dei dialog e del morning display', () => {
    const { result } = renderHook(() => useAppDialogs())

    act(() => {
      result.current.setGameOver(true)
      result.current.setShowJobSelectionDialog(true)
      result.current.setTeacherActionType('minaccia')
      result.current.setMorningDisplay('school')
    })

    expect(result.current.gameOver).toBe(true)
    expect(result.current.showJobSelectionDialog).toBe(true)
    expect(result.current.teacherActionType).toBe('minaccia')
    expect(result.current.morningDisplay).toBe('school')
  })
})