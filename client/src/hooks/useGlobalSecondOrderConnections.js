import { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import axiosInstance from '@utils/axiosInstance'
import { fetchConnectionsDirect } from '@redux/reducers/connectionsReducer'
import { transformConnection } from '@utils/transformConnection'
import { transformBackendToFrontendConnectionType } from '@utils/connectionTypeHelpers'
import useNodeEntriesInfo from './useNodeEntriesInfo'

const cachedNodeEntries = new Map()
const inflightNodeEntryRequests = new Map()

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

const useGlobalSecondOrderConnections = (nodes) => {
  const dispatch = useDispatch()
  const nodeEntriesInfo = useNodeEntriesInfo()
  const [connectionsById, setConnectionsById] = useState(new Map())

  const entriesById = useMemo(() => {
    return new Map((nodeEntriesInfo || []).map((entry) => [entry.id, entry]))
  }, [nodeEntriesInfo])

  useEffect(() => {
    let isActive = true

    const fetchConnections = async () => {
      if (!nodes?.length) {
        if (isActive) {
          setConnectionsById(new Map())
        }
        return
      }

      const results = await Promise.all(
        nodes.map(async (entry) => {
          const nodeId = entry?.node?.id
          if (!nodeId) return [nodeId, []]

          const rawConnections = await dispatch(fetchConnectionsDirect(nodeId))
            .unwrap()
            .catch(() => [])

          const normalizedConnections = rawConnections
            .map((conn) => ({
              ...conn,
              connection_type: transformBackendToFrontendConnectionType(conn.connection_type, nodeId, conn),
            }))
            .filter((conn) => conn.connection_type)

          const connectedEntries = await Promise.all(
            normalizedConnections.map(async (conn) => {
              const transformed = transformConnection(nodeId, conn)
              const entryInfo = entriesById.get(transformed.id) || (await fetchNodeEntryById(transformed.id))
              if (!entryInfo) return null
              return {
                node: entryInfo,
                connectionType: conn.connection_type,
              }
            })
          )

          return [nodeId, connectedEntries.filter(Boolean)]
        })
      )

      if (!isActive) return

      const nextMap = new Map()
      results.forEach(([nodeId, connectedEntries]) => {
        if (nodeId && connectedEntries?.length) {
          nextMap.set(nodeId, connectedEntries)
        }
      })
      setConnectionsById(nextMap)
    }

    fetchConnections()

    return () => {
      isActive = false
    }
  }, [dispatch, entriesById, nodes])

  return connectionsById
}

export default useGlobalSecondOrderConnections
