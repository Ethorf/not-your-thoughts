import { CONNECTION_TYPES } from '@constants/connectionTypes'

const {
  FRONTEND: { CHILD },
} = CONNECTION_TYPES

/**
 * When expanding a discovered parent, its other children share the same cohort depth
 * as the path anchor. Split them so layout uses the path anchor while graph edges
 * still point at the parent.
 */
export const partitionImplicitParentChildren = (connectedNodes, pathAnchorNodeId) => {
  if (!connectedNodes?.length || pathAnchorNodeId == null) {
    return { implicitCohortNodes: [], remainingNodes: connectedNodes || [] }
  }

  const implicitCohortNodes = []
  const remainingNodes = []

  connectedNodes.forEach((entry) => {
    if (entry.connectionType === CHILD && entry?.node?.id !== pathAnchorNodeId) {
      implicitCohortNodes.push(entry)
    } else {
      remainingNodes.push(entry)
    }
  })

  return { implicitCohortNodes, remainingNodes }
}
