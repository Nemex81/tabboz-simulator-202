import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { __resetHydratedKVStateForTests, useKV, useRemoteKVFallbackActive } from './useHydratedKV'

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

  it('espone uno stato osservabile quando il fallback locale viene attivato', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response('Unauthorized', {
      status: 401,
      statusText: 'Unauthorized',
    }))
    vi.stubGlobal('fetch', fetchMock)

    const statusHook = renderHook(() => useRemoteKVFallbackActive())
    const triggerHook = renderHook(() => useKV('tabboz-indicator-trigger', 'seed'))

    expect(statusHook.result.current).toBe(false)

    await flushHydration()

    expect(triggerHook.result.current[0]).toBe('seed')
    expect(statusHook.result.current).toBe(true)
  })

  it('ripristina il valore locale dopo un remount prima del flush remoto della write pending', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (input, init) => {
      const method = init?.method ?? 'GET'

      if (method === 'GET') {
        return new Response('Not found', { status: 404, statusText: 'Not Found' })
      }

      return new Response(null, { status: 200, statusText: 'OK' })
    })
    vi.stubGlobal('fetch', fetchMock)

    const firstMount = renderHook(() => useKV('tabboz-reload-safe', 'seed'))

    await flushHydration()

    expect(firstMount.result.current[0]).toBe('seed')

    act(() => {
      firstMount.result.current[1]('updated-before-reload')
    })

    expect(firstMount.result.current[0]).toBe('updated-before-reload')
    expect(JSON.parse(localStorage.getItem('tabboz-kv-bootstrap-cache') ?? '{}')).toMatchObject({
      'tabboz-reload-safe': 'updated-before-reload',
    })

    firstMount.unmount()
    __resetHydratedKVStateForTests()

    const secondMount = renderHook(() => useKV('tabboz-reload-safe', 'seed'))

    expect(secondMount.result.current[0]).toBe('updated-before-reload')

    await flushHydration()

    expect(secondMount.result.current[0]).toBe('updated-before-reload')

    const postBodies = fetchMock.mock.calls
      .filter(([, init]) => (init?.method ?? 'GET') === 'POST')
      .map(([, init]) => String(init?.body ?? ''))

    expect(postBodies).toContain(JSON.stringify('updated-before-reload'))
  })
})