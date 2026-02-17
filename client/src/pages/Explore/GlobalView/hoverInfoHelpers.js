const getNodeDateCreated = (node) =>
  node?.date_created || node?.date_created_at || node?.date_created_on || node?.created_at || null

const getNodeDateUpdated = (node) => node?.date_last_modified || node?.date_last_updated || node?.updated_at || null

const getConnectionCount = (entry, connectionType, parentTitle, clusterCenterTitle) => {
  if (typeof entry?.directConnectionCount === 'number') {
    return Math.max(0, entry.directConnectionCount)
  }

  const connectedNodes = entry?.connectedNodes
  if (Array.isArray(connectedNodes) && connectedNodes.length) {
    const uniqueConnectedIds = new Set(
      connectedNodes.map((nodeEntry) => nodeEntry?.node?.id ?? nodeEntry?.id).filter(Boolean)
    )
    return uniqueConnectedIds.size
  }

  if (typeof entry?.totalConnectionCount === 'number') {
    return Math.max(0, entry.totalConnectionCount)
  }

  return connectionType || parentTitle || clusterCenterTitle ? 1 : 0
}

export const buildGlobalHoverInfo = ({ entry, clusterCenterTitle, connectionType, parentTitle = null }) => ({
  nodeTitle: entry?.node?.title || 'Untitled',
  clusterCenterTitle: clusterCenterTitle || null,
  connectionType: connectionType || null,
  parentTitle: parentTitle || null,
  connectionCount: getConnectionCount(entry, connectionType, parentTitle, clusterCenterTitle),
  dateCreated: getNodeDateCreated(entry?.node),
  dateUpdated: getNodeDateUpdated(entry?.node),
  content: entry?.node?.content ?? '',
})
