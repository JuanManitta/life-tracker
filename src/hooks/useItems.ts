import { useCallback, useEffect, useState } from 'react'
import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { TrackedItem } from '@/types'

const LOCAL_KEY = 'ocio-tracker-items-v1'

function loadLocal(): TrackedItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? (JSON.parse(raw) as TrackedItem[]) : []
  } catch {
    return []
  }
}

function saveLocal(items: TrackedItem[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(items))
}

/**
 * Firestore rejects `undefined` field values outright. When a form field is
 * cleared we represent it as `undefined` in the TrackedItem, so before
 * writing to Firestore we translate those into `deleteField()` sentinels
 * (removing the field) instead of throwing or leaving stale data behind.
 */
function toFirestorePayload(item: TrackedItem): Record<string, unknown> {
  const payload: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(item)) {
    payload[key] = value === undefined ? deleteField() : value
  }
  return payload
}

/**
 * @param userId - Firebase uid when signed in with Google, or null to use
 * the local-only (localStorage) fallback mode.
 */
export function useItems(userId: string | null) {
  const [items, setItems] = useState<TrackedItem[]>([])
  const [loading, setLoading] = useState(true)
  const usingCloud = Boolean(db && userId)

  useEffect(() => {
    let unsubscribe: (() => void) | undefined
    setLoading(true)

    if (db && userId) {
      const itemsRef = collection(db, 'users', userId, 'items')
      const q = query(itemsRef, orderBy('updatedAt', 'desc'))
      unsubscribe = onSnapshot(q, (snapshot) => {
        const next = snapshot.docs.map((d) => d.data() as TrackedItem)
        setItems(next)
        setLoading(false)
      })
    } else {
      setItems(loadLocal().sort((a, b) => b.updatedAt - a.updatedAt))
      setLoading(false)
    }

    return () => unsubscribe?.()
  }, [userId])

  const upsertItem = useCallback(
    async (item: TrackedItem) => {
      if (usingCloud && db && userId) {
        const ref = doc(db, 'users', userId, 'items', item.id)
        await setDoc(ref, toFirestorePayload(item), { merge: true })
      } else {
        setItems((prev) => {
          const exists = prev.some((i) => i.id === item.id)
          const next = exists
            ? prev.map((i) => (i.id === item.id ? item : i))
            : [item, ...prev]
          next.sort((a, b) => b.updatedAt - a.updatedAt)
          saveLocal(next)
          return next
        })
      }
    },
    [usingCloud, userId]
  )

  const updateStatus = useCallback(
    async (id: string, status: TrackedItem['status']) => {
      const updatedAt = Date.now()
      if (usingCloud && db && userId) {
        const ref = doc(db, 'users', userId, 'items', id)
        await updateDoc(ref, { status, updatedAt })
      } else {
        setItems((prev) => {
          const next = prev.map((i) =>
            i.id === id ? { ...i, status, updatedAt } : i
          )
          next.sort((a, b) => b.updatedAt - a.updatedAt)
          saveLocal(next)
          return next
        })
      }
    },
    [usingCloud, userId]
  )

  const deleteItem = useCallback(
    async (id: string) => {
      if (usingCloud && db && userId) {
        const ref = doc(db, 'users', userId, 'items', id)
        await deleteDoc(ref)
      } else {
        setItems((prev) => {
          const next = prev.filter((i) => i.id !== id)
          saveLocal(next)
          return next
        })
      }
    },
    [usingCloud, userId]
  )

  return { items, loading, usingCloud, upsertItem, updateStatus, deleteItem }
}
