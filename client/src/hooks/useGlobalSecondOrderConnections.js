import { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axiosInstance from '@utils/axiosInstance'
import { fetchConnectionsDirect } from '@redux/reducers/connectionsReducer'
import { transformConnection } from '@utils/transformConnection'
import { transformBackendToFrontendConnectionType } from '@utils/connectionTypeHelpers'
import { CONNECTION_TYPES } from '@constants/connectionTypes'

const cachedNodeEntries = new Map()
const inflightNodeEntryRequests = new Map()
const cachedConnectionsByNodeId = new Map()
const inflightConnectionsByNodeId = new Map()
const {
  FRONTEND: { EXTERNAL },
} = CONNECTION_TYPES

const fetchNodeEntryById = async (entryId) => {
  if (!entryId) return null
  if (cachedNodeEntries.has(entryId)) return cachedNodeEntries.get(entryId)
  if (inflightNodeEntryRequests.has(entryId)) return inflightNodeEntryRequests.get(entryId)

  const request = axiosInstance
    .get(`api/entries/entry/${entryId}`)
    .then((response) => {
      const entry = response.data || {}
      const normalizedEntry = {
        id: entry.id ?? entryId,
        title: entry.title || 'Untitled',
        content: Array.isArray(entry.content) ? entry.content : entry.content ? [entry.content] : [],
        date_last_modified: entry.date_last_updated || entry.date_last_modified || new Date(),
      }
      cachedNodeEntries.set(entryId, normalizedEntry)
      inflightNodeEntryRequests.delete(entryId)
      return normalizedEntry
    })
    .catch(() => {
      inflightNodeEntryRequests.delete(entryId)
      return null
    })

  inflightNodeEntryRequests.set(entryId, request)
  return request
}

const fetchConnectionsForNode = async (dispatch, nodeId) => {
  if (cachedConnectionsByNodeId.has(nodeId)) {
    return cachedConnectionsByNodeId.get(nodeId)
  }

  if (inflightConnectionsByNodeId.has(nodeId)) {
    return inflightConnectionsByNodeId.get(nodeId)
  }

  const request = dispatch(fetchConnectionsDirect(nodeId))
    .unwrap()
    .then((connections) => {
      const normalized = Array.isArray(connections) ? connections : []
      cachedConnectionsByNodeId.set(nodeId, normalized)
      inflightConnectionsByNodeId.delete(nodeId)
      return normalized
    })
    .catch(() => {
      inflightConnectionsByNodeId.delete(nodeId)
      return []
    })

  inflightConnectionsByNodeId.set(nodeId, request)
  return request
}

const useGlobalSecondOrderConnections = (nodes) => {
  const dispatch = useDispatch()
  const nodeEntriesInfo = useSelector((state) => state.currentEntry.nodeEntriesInfo)
  const { allConnections } = useSelector((state) => state.connections)
  const [connectionsById, setConnectionsById] = useState(new Map())
  const fetchedNodeIdsRef = useRef(new Set())

  const entriesById = useMemo(() => {
    return new Map((nodeEntriesInfo || []).map((entry) => [entry.id, entry]))
  }, [nodeEntriesInfo])

  const directConnectionCountMap = useMemo(() => {
    const neighborSets = new Map()
    if (!allConnections?.length) return new Map()

    const ensureSet = (id) => {
      if (!neighborSets.has(id)) neighborSets.set(id, new Set())
      return neighborSets.get(id)
    }

    allConnections.forEach((conn) => {
      const a = conn.entry_id
      const b = conn.foreign_entry_id
      if (a == null || b == null) return
      ensureSet(a).add(b)
      ensureSet(b).add(a)
    })

    const counts = new Map()
    neighborSets.forEach((set, id) => {
      counts.set(id, set.size)
    })
    return counts
  }, [allConnections])

  useEffect(() => {
    let isActive = true

    const fetchConnections = async () => {
      if (!nodes?.length) {
        if (isActive) {
          setConnectionsById(new Map())
        }
        return
      }

      const targetNodeIds = nodes
        .map((entry) => entry?.node?.id)
        .filter((nodeId) => typeof nodeId === 'number' && Number.isFinite(nodeId))
      const nextTargetIdSet = new Set(targetNodeIds)

      // Prune stale ids so we only retain/fetch what this render tree needs.
      fetchedNodeIdsRef.current.forEach((existingId) => {
        if (!nextTargetIdSet.has(existingId)) {
          fetchedNodeIdsRef.current.delete(existingId)
        }
      })

      const idsToFetch = targetNodeIds.filter((nodeId) => !fetchedNodeIdsRef.current.has(nodeId))
      if (!idsToFetch.length) {
        return
      }

      const results = await Promise.all(
        idsToFetch.map(async (nodeId) => {
          const entry = nodes.find((candidate) => candidate?.node?.id === nodeId)
          if (!entry) return [nodeId, []]

          const rawConnections = await fetchConnectionsForNode(dispatch, nodeId)

          const normalizedConnections = rawConnections
            .map((conn) => ({
              ...conn,
              connection_type: transformBackendToFrontendConnectionType(conn.connection_type, nodeId, conn),
            }))
            .filter((conn) => conn.connection_type)

          const connectedEntries = await Promise.all(
            normalizedConnections.map(async (conn) => {
              if (conn.connection_type === EXTERNAL) {
                const externalId = `external-${conn.id}`
                const title = conn.primary_source || conn.foreign_source || 'External Link'
                return {
                  node: {
                    id: externalId,
                    title,
                    content: title,
                    url: conn.foreign_source,
                    date_last_modified: new Date(),
                  },
                  connectionType: conn.connection_type,
                  totalConnectionCount: 0,
                }
              }
              const transformed = transformConnection(nodeId, conn)
              const entryInfo = entriesById.get(transformed.id) || (await fetchNodeEntryById(transformed.id))
              if (!entryInfo) return null
              const directConnectionCount =
                typeof entryInfo.id === 'number' ? (directConnectionCountMap.get(entryInfo.id) ?? 0) : 0
              return {
                node: entryInfo,
                connectionType: conn.connection_type,
                totalConnectionCount: directConnectionCount,
                directConnectionCount,
              }
            })
          )

          return [nodeId, connectedEntries.filter(Boolean)]
        })
      )

      if (!isActive) return

      setConnectionsById((prevMap) => {
        const nextMap = new Map(prevMap)
        results.forEach(([nodeId, connectedEntries]) => {
          fetchedNodeIdsRef.current.add(nodeId)
          if (nodeId && connectedEntries?.length) {
            nextMap.set(nodeId, connectedEntries)
          } else {
            nextMap.delete(nodeId)
          }
        })
        return nextMap
      })
    }

    fetchConnections()

    return () => {
      isActive = false
    }
  }, [dispatch, entriesById, nodes, directConnectionCountMap])

  return connectionsById
}

export default useGlobalSecondOrderConnections
