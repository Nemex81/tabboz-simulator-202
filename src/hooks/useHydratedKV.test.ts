import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { __resetHydratedKVStateForTests, useKV } from './useHydratedKV'

async function flushHydration(): Promise<void> {
  await act(async () => {
    vi.advanceTimersByTime(500)
    await Promise.resolve()
    await Promise.resolve()
  })
}

describe('useHydratedKV', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
    __resetHydratedKVStateForTests()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('mantiene locale una chiave bootstrap dopo il primo 401 della sessione e smette di ritentare il backend', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response('Unauthorized', {
      status: 401,
      statusText: 'Unauthorized',
    }))
    vi.stubGlobal('fetch', fetchMock)

    const triggerMount = renderHook(() => useKV('tabboz-custom-trigger', 'seed'))

    await flushHydration()

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(triggerMount.result.current[0]).toBe('seed')

    triggerMount.unmount()

    const firstMount = renderHook(() => useKV<string | undefined>('tabboz-theme', undefined))

    await flushHydration()

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(firstMount.result.current[0]).toBeUndefined()

    act(() => {
      firstMount.result.current[1]('green')
    })

    expect(firstMount.result.current[0]).toBe('green')
    expect(JSON.parse(localStorage.getItem('tabboz-kv-bootstrap-cache') ?? '{}')).toMatchObject({
      'tabboz-theme': 'green',
    })

    firstMount.unmount()

    const secondMount = renderHook(() => useKV<string | undefined>('tabboz-theme', undefined))

    await flushHydration()

    expect(secondMount.result.current[0]).toBe('green')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('entra in fallback locale dopo 401 su una chiave non-bootstrap e conserva il valore aggiornato', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response('Unauthorized', {
      status: 401,
      statusText: 'Unauthorized',
    }))
    vi.stubGlobal('fetch', fetchMock)

    const firstMount = renderHook(() => useKV('tabboz-custom-local-only', 'seed'))

    await flushHydration()

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(firstMount.result.current[0]).toBe('seed')

    act(() => {
      firstMount.result.current[1]('persisted-local')
    })

    expect(firstMount.result.current[0]).toBe('persisted-local')
    expect(JSON.parse(localStorage.getItem('tabboz-kv-bootstrap-cache') ?? '{}')).toMatchObject({
      'tabboz-custom-local-only': 'persisted-local',
    })

    firstMount.unmount()

    const secondMount = renderHook(() => useKV('tabboz-custom-local-only', 'seed'))

    await flushHydration()

    expect(secondMount.result.current[0]).toBe('persisted-local')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})