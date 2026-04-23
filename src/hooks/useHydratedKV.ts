import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const KV_BASE_URL = '/_spark/kv'
const BOOTSTRAP_CACHE_KEY = 'tabboz-kv-bootstrap-cache'
const BOOTSTRAP_STATE_KEY = 'tabboz-bootstrap-state'
const HYDRATION_DELAY_MS = 40
const BOOTSTRAP_SYNC_DELAY_MS = 120
const REMOTE_WRITE_COALESCE_MS = 90
const BOOTSTRAP_FETCH_MAX_RETRIES = 3
const BOOTSTRAP_FETCH_BASE_DELAY_MS = 180

type Snapshot = Record<string, unknown>
type Updater<T> = T | ((oldValue?: T) => T)
type PendingMutation =
  | { kind: 'set'; value: unknown }
  | { kind: 'delete' }
type KVProfileStats = {
  bootstrapSnapshotFetches: number
  bootstrapSnapshotRetries: number
  bootstrapSnapshotFailures: number
  bootstrapSnapshotHits: number
  bootstrapCachedHits: number
  bootstrapInitialFallbacks: number
  nonBootstrapRemoteFetches: number
  remoteWriteFlushes: number
  remoteWriteCoalesced: number
}

let snapshotLoaded = false
let snapshotCache: Snapshot = {}
let kvQueue: Promise<void> = Promise.resolve()
let hydrationSlot = 0
let remoteBootstrapState: Snapshot | null = null
let remoteBootstrapPromise: Promise<Snapshot> | null = null
let bootstrapSyncTimer: number | null = null
let remoteKVUnauthorized = false
const bootstrapSeedValues: Snapshot = {}
const pendingRemoteMutations = new Map<string, PendingMutation>()
const pendingRemoteMutationTimers = new Map<string, number>()
const kvProfileStats: KVProfileStats = {
  bootstrapSnapshotFetches: 0,
  bootstrapSnapshotRetries: 0,
  bootstrapSnapshotFailures: 0,
  bootstrapSnapshotHits: 0,
  bootstrapCachedHits: 0,
  bootstrapInitialFallbacks: 0,
  nonBootstrapRemoteFetches: 0,
  remoteWriteFlushes: 0,
  remoteWriteCoalesced: 0,
}

const BOOTSTRAP_KEYS = new Set<string>([
  'tabboz-school-type',
  'tabboz-player-profile',
  'tabboz-grades',
  'tabboz-friends',
  'tabboz-relationships',
  'tabboz-active-partners',
  'tabboz-girlfriend',
  'tabboz-theme',
  'tabboz-school-record',
  'tabboz-grades-history',
  'tabboz-stats',
  'tabboz-time',
  'tabboz-exams',
  'tabboz-phase',
  'tabboz-day-type',
  'tabboz-phase-actions',
  'tabboz-phase-actions-max',
  'tabboz-interazioni',
  'tabboz-max-interazioni',
  'tabboz-health-record',
  'tabboz-teachers',
  'tabboz-class-roster',
  'tabboz-weekly-timetable',
  'tabboz-school-day-state',
])

function isBrowserAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function isRetryableBootstrapError(status: number): boolean {
  return status === 403 || status === 429 || status >= 500
}

function isUnauthorizedKVResponse(status: number): boolean {
  return status === 401
}

function markRemoteKVUnauthorized(): void {
  remoteKVUnauthorized = true
}

function isRemoteKVAvailable(): boolean {
  return !remoteKVUnauthorized
}

function wait(delayMs: number): Promise<void> {
  return new Promise(resolve => {
    window.setTimeout(resolve, delayMs)
  })
}

function recordProfileStat(stat: keyof KVProfileStats): void {
  kvProfileStats[stat] += 1
  if (import.meta.env.DEV && isBrowserAvailable()) {
    ;(window as Window & { __tabbozKVProfileStats?: KVProfileStats }).__tabbozKVProfileStats = kvProfileStats
  }
}

function loadSnapshot(): Snapshot {
  if (!isBrowserAvailable()) return {}
  if (snapshotLoaded) return snapshotCache

  snapshotLoaded = true
  try {
    const raw = window.localStorage.getItem(BOOTSTRAP_CACHE_KEY)
    snapshotCache = raw ? JSON.parse(raw) as Snapshot : {}
  } catch {
    snapshotCache = {}
  }

  return snapshotCache
}

function persistSnapshot(): void {
  if (!isBrowserAvailable()) return
  window.localStorage.setItem(BOOTSTRAP_CACHE_KEY, JSON.stringify(snapshotCache))
}

function isBootstrappedKey(key: string): boolean {
  return BOOTSTRAP_KEYS.has(key)
}

function registerBootstrapSeed<T>(key: string, value: T | undefined): void {
  if (!isBootstrappedKey(key) || value === undefined) return
  if (!(key in bootstrapSeedValues)) {
    bootstrapSeedValues[key] = value
  }
}

function getBootstrapPayload(): Snapshot {
  const payload: Snapshot = { ...(remoteBootstrapState ?? {}), ...bootstrapSeedValues }
  for (const key of BOOTSTRAP_KEYS) {
    if (key in snapshotCache) {
      payload[key] = snapshotCache[key]
    }
  }
  return payload
}

function syncRemoteBootstrapSnapshot(): void {
  if (!isBrowserAvailable()) return
  if (!isRemoteKVAvailable()) {
    remoteBootstrapState = getBootstrapPayload()
    return
  }
  if (bootstrapSyncTimer !== null) {
    window.clearTimeout(bootstrapSyncTimer)
  }

  bootstrapSyncTimer = window.setTimeout(() => {
    const payload = getBootstrapPayload()
    remoteBootstrapState = payload
    void enqueueKVTask(() => setRemoteValue(BOOTSTRAP_STATE_KEY, payload))
    bootstrapSyncTimer = null
  }, BOOTSTRAP_SYNC_DELAY_MS)
}

function readCachedValue<T>(key: string, initialValue?: T): T | undefined {
  const snapshot = loadSnapshot()
  if (key in snapshot) {
    return snapshot[key] as T
  }
  return initialValue
}

function cacheValue<T>(key: string, value: T | undefined): void {
  loadSnapshot()
  if (value === undefined) {
    delete snapshotCache[key]
  } else {
    snapshotCache[key] = value
  }
  if (isBootstrappedKey(key)) {
    if (value === undefined) {
      delete bootstrapSeedValues[key]
      if (remoteBootstrapState) {
        delete remoteBootstrapState[key]
      }
    } else {
      bootstrapSeedValues[key] = value
      remoteBootstrapState = { ...(remoteBootstrapState ?? {}), [key]: value }
    }
  }
  persistSnapshot()
}

function enqueueKVTask<T>(task: () => Promise<T>): Promise<T> {
  const nextTask = kvQueue.then(task, task)
  kvQueue = nextTask.then(() => undefined, () => undefined)
  return nextTask
}

async function getOrSetRemoteValue<T>(key: string, initialValue?: T): Promise<T | undefined> {
  if (!isRemoteKVAvailable()) {
    return readCachedValue(key, initialValue)
  }

  recordProfileStat('nonBootstrapRemoteFetches')
  const getResponse = await fetch(`${KV_BASE_URL}/${encodeURIComponent(key)}`, {
    method: 'GET',
    headers: { 'Content-Type': 'text/plain' },
  })

  if (getResponse.ok) {
    return JSON.parse(await getResponse.text()) as T
  }

  if (isUnauthorizedKVResponse(getResponse.status)) {
    markRemoteKVUnauthorized()
    return readCachedValue(key, initialValue)
  }

  if (getResponse.status !== 404) {
    throw new Error(`Failed to fetch KV key: ${getResponse.statusText}`)
  }

  if (initialValue === undefined) {
    return undefined
  }

  const setResponse = await fetch(`${KV_BASE_URL}/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
      'X-Spark-Initial': 'true',
    },
    body: JSON.stringify(initialValue),
  })

  if (isUnauthorizedKVResponse(setResponse.status)) {
    markRemoteKVUnauthorized()
    return initialValue
  }

  if (!setResponse.ok) {
    throw new Error(`Failed to set default value for key: ${setResponse.statusText}`)
  }

  return initialValue
}

async function setRemoteValue<T>(key: string, value: T): Promise<void> {
  if (!isRemoteKVAvailable()) {
    return
  }

  const response = await fetch(`${KV_BASE_URL}/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
      'X-Spark-Initial': 'false',
    },
    body: JSON.stringify(value),
  })

  if (isUnauthorizedKVResponse(response.status)) {
    markRemoteKVUnauthorized()
    return
  }

  if (!response.ok) {
    throw new Error(`Failed to set key: ${response.statusText}`)
  }
}

async function deleteRemoteValue(key: string): Promise<void> {
  if (!isRemoteKVAvailable()) {
    return
  }

  const response = await fetch(`${KV_BASE_URL}/${encodeURIComponent(key)}`, {
    method: 'DELETE',
  })

  if (isUnauthorizedKVResponse(response.status)) {
    markRemoteKVUnauthorized()
    return
  }

  if (!response.ok && response.status !== 404) {
    throw new Error(`Failed to delete key: ${response.statusText}`)
  }
}

function flushRemoteMutation(key: string): void {
  const timerId = pendingRemoteMutationTimers.get(key)
  if (timerId !== undefined) {
    window.clearTimeout(timerId)
    pendingRemoteMutationTimers.delete(key)
  }

  const mutation = pendingRemoteMutations.get(key)
  if (!mutation) {
    return
  }

  pendingRemoteMutations.delete(key)
  recordProfileStat('remoteWriteFlushes')

  void enqueueKVTask(() => {
    if (mutation.kind === 'delete') {
      return deleteRemoteValue(key)
    }

    return setRemoteValue(key, mutation.value)
  })
}

function scheduleRemoteMutation(key: string, mutation: PendingMutation): void {
  if (!isRemoteKVAvailable()) {
    return
  }

  if (!isBrowserAvailable()) {
    void enqueueKVTask(() => {
      if (mutation.kind === 'delete') {
        return deleteRemoteValue(key)
      }

      return setRemoteValue(key, mutation.value)
    })
    return
  }

  if (pendingRemoteMutations.has(key)) {
    recordProfileStat('remoteWriteCoalesced')
  }

  pendingRemoteMutations.set(key, mutation)

  const existingTimer = pendingRemoteMutationTimers.get(key)
  if (existingTimer !== undefined) {
    window.clearTimeout(existingTimer)
  }

  const timerId = window.setTimeout(() => {
    flushRemoteMutation(key)
  }, REMOTE_WRITE_COALESCE_MS)

  pendingRemoteMutationTimers.set(key, timerId)
}

async function loadRemoteBootstrapSnapshot(): Promise<Snapshot> {
  if (!isRemoteKVAvailable()) {
    const payload = getBootstrapPayload()
    remoteBootstrapState = payload
    Object.assign(snapshotCache, payload)
    persistSnapshot()
    return payload
  }

  if (remoteBootstrapState) {
    return remoteBootstrapState
  }

  if (remoteBootstrapPromise) {
    return remoteBootstrapPromise
  }

  remoteBootstrapPromise = enqueueKVTask(async () => {
    for (let attempt = 0; attempt <= BOOTSTRAP_FETCH_MAX_RETRIES; attempt += 1) {
      recordProfileStat('bootstrapSnapshotFetches')

      const response = await fetch(`${KV_BASE_URL}/${encodeURIComponent(BOOTSTRAP_STATE_KEY)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'text/plain' },
      })

      if (response.ok) {
        const payload = JSON.parse(await response.text()) as Snapshot
        remoteBootstrapState = payload
        Object.assign(snapshotCache, payload)
        persistSnapshot()
        return payload
      }

      if (isUnauthorizedKVResponse(response.status)) {
        markRemoteKVUnauthorized()
        const payload = getBootstrapPayload()
        remoteBootstrapState = payload
        Object.assign(snapshotCache, payload)
        persistSnapshot()
        return payload
      }

      if (response.status === 404) {
        const payload = getBootstrapPayload()
        if (Object.keys(payload).length > 0) {
          await setRemoteValue(BOOTSTRAP_STATE_KEY, payload)
        }
        remoteBootstrapState = payload
        Object.assign(snapshotCache, payload)
        persistSnapshot()
        return payload
      }

      if (attempt < BOOTSTRAP_FETCH_MAX_RETRIES && isRetryableBootstrapError(response.status)) {
        recordProfileStat('bootstrapSnapshotRetries')
        const backoffDelay = BOOTSTRAP_FETCH_BASE_DELAY_MS * (2 ** attempt)
        const jitter = Math.floor(Math.random() * 90)
        await wait(backoffDelay + jitter)
        continue
      }

      recordProfileStat('bootstrapSnapshotFailures')
      throw new Error(`Failed to fetch bootstrap snapshot: ${response.statusText}`)
    }

    recordProfileStat('bootstrapSnapshotFailures')
    throw new Error('Failed to fetch bootstrap snapshot: retry budget exhausted')
  }).finally(() => {
    remoteBootstrapPromise = null
  })

  return remoteBootstrapPromise
}

export function __resetHydratedKVStateForTests(): void {
  snapshotLoaded = false
  snapshotCache = {}
  kvQueue = Promise.resolve()
  hydrationSlot = 0
  remoteBootstrapState = null
  remoteBootstrapPromise = null
  bootstrapSyncTimer = null
  remoteKVUnauthorized = false
  pendingRemoteMutations.clear()
  pendingRemoteMutationTimers.clear()

  for (const key of Object.keys(bootstrapSeedValues)) {
    delete bootstrapSeedValues[key]
  }

  for (const stat of Object.keys(kvProfileStats) as Array<keyof KVProfileStats>) {
    kvProfileStats[stat] = 0
  }
}

export function useKV<T = string>(key: string, initialValue?: T): readonly [T | undefined, (newValue: Updater<T>) => void, () => void] {
  const initialValueRef = useRef(initialValue)

  useEffect(() => {
    initialValueRef.current = initialValue
  }, [initialValue, key])

  useEffect(() => {
    registerBootstrapSeed(key, initialValueRef.current)
  }, [key])

  const cachedInitialValue = useMemo(() => readCachedValue(key, initialValueRef.current), [key])
  const [value, setValue] = useState<T | undefined>(cachedInitialValue)

  useEffect(() => {
    setValue(readCachedValue(key, initialValueRef.current))
  }, [key])

  useEffect(() => {
    let cancelled = false
    const hasCachedValue = loadSnapshot()[key] !== undefined
    const delay = hasCachedValue ? hydrationSlot++ * HYDRATION_DELAY_MS : (hydrationSlot++ + 1) * HYDRATION_DELAY_MS

    const timer = window.setTimeout(() => {
      void enqueueKVTask(async () => {
        try {
          let hydratedValue: T | undefined
          const isBootstrapKey = isBootstrappedKey(key)

          if (isBootstrapKey) {
            try {
              const bootstrapState = await loadRemoteBootstrapSnapshot()
              if (key in bootstrapState) {
                recordProfileStat('bootstrapSnapshotHits')
                hydratedValue = bootstrapState[key] as T
              }
            } catch (error) {
              if (import.meta.env.DEV) {
                console.warn(`KV hydration fallback for ${key}:`, error)
              }
              if (hasCachedValue) {
                recordProfileStat('bootstrapCachedHits')
                return
              }
              recordProfileStat('bootstrapInitialFallbacks')
              hydratedValue = initialValueRef.current
            }
          }

          if (hydratedValue === undefined && !isBootstrapKey) {
            hydratedValue = await getOrSetRemoteValue<T>(key, initialValueRef.current)
          }

          cacheValue(key, hydratedValue)
          if (!cancelled) {
            setValue(hydratedValue)
          }
        } catch (error) {
          if (import.meta.env.DEV && !isBootstrappedKey(key)) {
            console.warn(`KV hydration fallback for ${key}:`, error)
          }
        }
      })
    }, delay)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [key])

  const setPersistedValue = useCallback((newValue: Updater<T>) => {
    setValue((currentValue) => {
      const nextValue = typeof newValue === 'function'
        ? (newValue as (oldValue?: T) => T)(currentValue)
        : newValue

      cacheValue(key, nextValue)
      scheduleRemoteMutation(key, { kind: 'set', value: nextValue })
      if (isBootstrappedKey(key)) {
        syncRemoteBootstrapSnapshot()
      }
      return nextValue
    })
  }, [key])

  const deleteValue = useCallback(() => {
    cacheValue(key, undefined)
    setValue(undefined)
    scheduleRemoteMutation(key, { kind: 'delete' })
    if (isBootstrappedKey(key)) {
      syncRemoteBootstrapSnapshot()
    }
  }, [key])

  return [value, setPersistedValue, deleteValue] as const
}