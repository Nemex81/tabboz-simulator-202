import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DiaryPanel } from './DiaryPanel'
import { useGameLog } from '@/hooks/useGameLog'

vi.mock('@/hooks/useHydratedKV', async () => {
  const React = await vi.importActual<typeof import('react')>('react')
  const kvStore = new Map<string, unknown>()

  return {
    useKV: <T,>(key: string, initialValue?: T) => {
      const [value, setValue] = React.useState<T | undefined>(() => {
        return kvStore.has(key) ? kvStore.get(key) as T : initialValue
      })

      const setPersistedValue = (newValue: T | ((oldValue?: T) => T)) => {
        setValue((currentValue) => {
          const nextValue = typeof newValue === 'function'
            ? (newValue as (oldValue?: T) => T)(currentValue)
            : newValue

          kvStore.set(key, nextValue)
          return nextValue
        })
      }

      const deleteValue = () => {
        kvStore.delete(key)
        setValue(undefined)
      }

      return [value, setPersistedValue, deleteValue] as const
    },
    __resetKVStore: () => kvStore.clear(),
  }
})

function DiaryHarness() {
  const { gameLog, addLogEntry } = useGameLog()

  return (
    <>
      <button
        type="button"
        onClick={() => addLogEntry(
          'social',
          'Chiacchierata con qualcuno',
          'Hai chiacchierato con qualcuno! +5 Carisma, +3 Reputazione',
          'positive',
          { day: 15, month: 9, year: 2026 },
          'pomeriggio',
        )}
      >
        Aggiungi evento diario
      </button>
      <DiaryPanel gameLog={gameLog} previewOnly={false} />
    </>
  )
}

describe('DiaryPanel', () => {
  beforeEach(async () => {
    const hydrationModule = await import('@/hooks/useHydratedKV') as typeof import('@/hooks/useHydratedKV') & {
      __resetKVStore?: () => void
    }
    hydrationModule.__resetKVStore?.()
  })

  it('mantiene gli eventi del diario dopo un remount del componente', () => {
    const firstRender = render(<DiaryHarness />)

    fireEvent.click(screen.getByRole('button', { name: 'Aggiungi evento diario' }))

    expect(screen.getByText('Chiacchierata con qualcuno')).toBeInTheDocument()
    expect(screen.queryByText('Nessun evento registrato. Inizia a giocare per riempire il diario!')).not.toBeInTheDocument()

    firstRender.unmount()

    render(<DiaryHarness />)

    expect(screen.getByText('Chiacchierata con qualcuno')).toBeInTheDocument()
    expect(screen.getByText(/DIARIO — 1 eventi registrati/i)).toBeInTheDocument()
    expect(screen.queryByText('Nessun evento registrato. Inizia a giocare per riempire il diario!')).not.toBeInTheDocument()
  })
})
