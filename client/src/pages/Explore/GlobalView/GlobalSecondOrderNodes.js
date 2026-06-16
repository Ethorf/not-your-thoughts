import React, { useMemo } from 'react'
import { CONNECTION_TYPES } from '@constants/connectionTypes'
import GlobalSecondOrderSiblingNodes, { positionSecondOrderSiblings } from './GlobalSecondOrderSiblingNodes'
import GlobalSecondOrderParentNodes, { positionSecondOrderParents } from './GlobalSecondOrderParentNodes'
import GlobalSecondOrderChildNodes, { positionSecondOrderChildren } from './GlobalSecondOrderChildNodes'
import GlobalSecondOrderExternalNodes, { positionSecondOrderExternals } from './GlobalSecondOrderExternalNodes'

/**
 * Renders second-order nodes grouped by connection type for a given parent.
 */
const GlobalSecondOrderNodes = ({
  anchorNode,
  nodes,
  depth = 1,
  maxDepth = Number.POSITIVE_INFINITY,
  visitedNodeIds = [],
  nodeTextures,
  onNodeClick,
  getSphereRotation,
  onNodeHover,
  clusterCenterTitle,
}) => {
  const visitedNodeIdSet = useMemo(() => {
    const next = new Set(visitedNodeIds)
    const anchorId = anchorNode?.node?.id
    if (anchorId != null) {
      next.add(anchorId)
    }
    return next
  }, [visitedNodeIds, anchorNode])

  const unvisitedNodes = useMemo(
    () => (nodes || []).filter((entry) => !visitedNodeIdSet.has(entry?.node?.id)),
    [nodes, visitedNodeIdSet]
  )

  const { externalNodes, siblingNodes, parentNodes, childNodes } = useMemo(() => {
    const external = []
    const sibling = []
    const parent = []
    const child = []

    unvisitedNodes.forEach((entry) => {
      const { connectionType } = entry

      if (connectionType === CONNECTION_TYPES.FRONTEND.EXTERNAL) {
        external.push(entry)
      } else if (connectionType === CONNECTION_TYPES.FRONTEND.SIBLING) {
        sibling.push(entry)
      } else if (connectionType === CONNECTION_TYPES.FRONTEND.PARENT) {
        parent.push(entry)
      } else if (connectionType === CONNECTION_TYPES.FRONTEND.CHILD) {
        child.push(entry)
      }
    })

    return {
      externalNodes: external,
      siblingNodes: sibling,
      parentNodes: parent,
      childNodes: child,
    }
  }, [unvisitedNodes])

  const positionedSiblingNodes = useMemo(() => {
    if (!anchorNode || !siblingNodes?.length) return []
    return positionSecondOrderSiblings(anchorNode, siblingNodes, depth)
  }, [anchorNode, siblingNodes, depth])

  const positionedParentNodes = useMemo(() => {
    if (!anchorNode || !parentNodes?.length) return []
    return positionSecondOrderParents(anchorNode, parentNodes, depth)
  }, [anchorNode, parentNodes, depth])

  const positionedChildNodes = useMemo(() => {
    if (!anchorNode || !childNodes?.length) return []
    return positionSecondOrderChildren(anchorNode, childNodes, depth)
  }, [anchorNode, childNodes, depth])

  const positionedExternalNodes = useMemo(() => {
    if (!anchorNode || !externalNodes?.length) return []
    return positionSecondOrderExternals(anchorNode, externalNodes, depth)
  }, [anchorNode, externalNodes, depth])

  if (!nodes?.length) return null

  return (
    <>
      <GlobalSecondOrderParentNodes
        anchorNode={anchorNode}
        nodes={parentNodes}
        positionedNodes={positionedParentNodes}
        nodeTextures={nodeTextures}
        onNodeClick={onNodeClick}
        getSphereRotation={getSphereRotation}
        depth={depth}
        maxDepth={maxDepth}
        visitedNodeIds={[...visitedNodeIdSet]}
        cohortIndexOffset={siblingNodes.length}
        onNodeHover={onNodeHover}
        clusterCenterTitle={clusterCenterTitle}
      />

      <GlobalSecondOrderExternalNodes
        anchorNode={anchorNode}
        nodes={externalNodes}
        positionedNodes={positionedExternalNodes}
        nodeTextures={nodeTextures}
        onNodeClick={onNodeClick}
        getSphereRotation={getSphereRotation}
        depth={depth}
        maxDepth={maxDepth}
        visitedNodeIds={[...visitedNodeIdSet]}
        onNodeHover={onNodeHover}
        clusterCenterTitle={clusterCenterTitle}
      />

      <GlobalSecondOrderSiblingNodes
        anchorNode={anchorNode}
        nodes={siblingNodes}
        positionedNodes={positionedSiblingNodes}
        nodeTextures={nodeTextures}
        onNodeClick={onNodeClick}
        getSphereRotation={getSphereRotation}
        depth={depth}
        maxDepth={maxDepth}
        visitedNodeIds={[...visitedNodeIdSet]}
        onNodeHover={onNodeHover}
        clusterCenterTitle={clusterCenterTitle}
      />

      <GlobalSecondOrderChildNodes
        anchorNode={anchorNode}
        nodes={childNodes}
        positionedNodes={positionedChildNodes}
        nodeTextures={nodeTextures}
        onNodeClick={onNodeClick}
        getSphereRotation={getSphereRotation}
        depth={depth}
        maxDepth={maxDepth}
        visitedNodeIds={[...visitedNodeIdSet]}
        onNodeHover={onNodeHover}
        clusterCenterTitle={clusterCenterTitle}
      />
    </>
  )
}

export default GlobalSecondOrderNodes
