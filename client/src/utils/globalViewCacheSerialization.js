import * as THREE from 'three'

const toConnEndpoint = (value) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

/**
 * Generate a cache key from node and connection data to detect when cache is stale.
 * Includes sorted edge list (not just counts) so different graphs with the same node count
 * or same edge count do not incorrectly reuse cached cluster layouts.
 */
export const getGlobalViewCacheKey = (nodeEntriesInfo, graphConnections, graphOwnerKey = '') => {
  if (!nodeEntriesInfo?.length && !(graphConnections || []).length) return ''
  const nodeIds = (nodeEntriesInfo || [])
    .map((n) => n.id)
    .filter((id) => id != null)
    .sort((a, b) => a - b)
    .join(',')
  const edges = (graphConnections || [])
    .map((c) => {
      const a = toConnEndpoint(c?.entry_id)
      const b = toConnEndpoint(c?.foreign_entry_id)
      if (a == null || b == null) return null
      return a < b ? `${a}-${b}` : `${b}-${a}`
    })
    .filter(Boolean)
    .sort()
    .join(';')
  return `${graphOwnerKey}|${nodeIds}|${edges}`
}

const posToArr = (p) =>
  p && typeof p.toArray === 'function' ? p.toArray() : [p?.x ?? 0, p?.y ?? 0, p?.z ?? 0]

const arrToPos = (arr) =>
  Array.isArray(arr) && arr.length >= 3 ? new THREE.Vector3(arr[0], arr[1], arr[2]) : new THREE.Vector3(0, 0, 0)

/**
 * Serialize a cluster view for storage (Vector3 -> [x,y,z], Map/Set -> arrays)
 */
export const serializeClusterView = (view) => {
  const serializeNodeEntry = (entry) =>
    entry
      ? {
          ...entry,
          position: posToArr(entry.position),
        }
      : null

  const serializeConnectionsMap = (map) => {
    if (!map || !(map instanceof Map)) return []
    return Array.from(map.entries()).map(([k, v]) => [k, Array.from(v || [])])
  }

  return {
    mainNode: serializeNodeEntry(view.mainNode),
    firstOrderNodes: (view.firstOrderNodes || []).map(serializeNodeEntry),
    secondOrderNodes: (view.secondOrderNodes || []).map(serializeNodeEntry),
    firstOrderConnectionsMap: serializeConnectionsMap(view.firstOrderConnectionsMap),
  }
}

/**
 * Deserialize a cluster view from storage ([x,y,z] -> Vector3, arrays -> Map/Set)
 */
export const deserializeClusterView = (serialized) => {
  if (!serialized) return null

  const deserializeNodeEntry = (entry) =>
    entry
      ? {
          ...entry,
          position: arrToPos(entry.position),
        }
      : null

  const deserializeConnectionsMap = (arr) => {
    const map = new Map()
    ;(arr || []).forEach(([k, ids]) => {
      map.set(k, new Set(ids || []))
    })
    return map
  }

  return {
    mainNode: deserializeNodeEntry(serialized.mainNode),
    firstOrderNodes: (serialized.firstOrderNodes || []).map(deserializeNodeEntry),
    secondOrderNodes: (serialized.secondOrderNodes || []).map(deserializeNodeEntry),
    firstOrderConnectionsMap: deserializeConnectionsMap(serialized.firstOrderConnectionsMap),
  }
}
