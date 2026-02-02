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
  parentNode,
  nodes,
  depth = 1,
  maxDepth = 2,
  nodeTextures,
  onNodeClick,
  getSphereRotation,
  onNodeHover,
  clusterCenterTitle,
}) => {
  const { externalNodes, siblingNodes, parentNodes, childNodes } = useMemo(() => {
    const external = []
    const sibling = []
    const parent = []
    const child = []

    nodes?.forEach((entry) => {
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
  }, [nodes])

  const positionedSiblingNodes = useMemo(() => {
    if (!parentNode || !siblingNodes?.length) return []
    return positionSecondOrderSiblings(parentNode, siblingNodes)
  }, [parentNode, siblingNodes])

  const positionedParentNodes = useMemo(() => {
    if (!parentNode || !parentNodes?.length) return []
    return positionSecondOrderParents(parentNode, parentNodes)
  }, [parentNode, parentNodes])

  const positionedChildNodes = useMemo(() => {
    if (!parentNode || !childNodes?.length) return []
    return positionSecondOrderChildren(parentNode, childNodes)
  }, [parentNode, childNodes])

  const positionedExternalNodes = useMemo(() => {
    if (!parentNode || !externalNodes?.length) return []
    return positionSecondOrderExternals(parentNode, externalNodes)
  }, [parentNode, externalNodes])

  if (!nodes?.length) return null

  return (
    <>
      <GlobalSecondOrderParentNodes
        parentNode={parentNode}
        nodes={parentNodes}
        positionedNodes={positionedParentNodes}
        nodeTextures={nodeTextures}
        onNodeClick={onNodeClick}
        getSphereRotation={getSphereRotation}
        depth={depth}
        maxDepth={maxDepth}
        onNodeHover={onNodeHover}
        clusterCenterTitle={clusterCenterTitle}
      />

      <GlobalSecondOrderExternalNodes
        parentNode={parentNode}
        nodes={externalNodes}
        positionedNodes={positionedExternalNodes}
        nodeTextures={nodeTextures}
        onNodeClick={onNodeClick}
        getSphereRotation={getSphereRotation}
        depth={depth}
        maxDepth={maxDepth}
        onNodeHover={onNodeHover}
        clusterCenterTitle={clusterCenterTitle}
      />

      <GlobalSecondOrderSiblingNodes
        parentNode={parentNode}
        nodes={siblingNodes}
        positionedNodes={positionedSiblingNodes}
        nodeTextures={nodeTextures}
        onNodeClick={onNodeClick}
        getSphereRotation={getSphereRotation}
        depth={depth}
        maxDepth={maxDepth}
        onNodeHover={onNodeHover}
        clusterCenterTitle={clusterCenterTitle}
      />

      <GlobalSecondOrderChildNodes
        parentNode={parentNode}
        nodes={childNodes}
        positionedNodes={positionedChildNodes}
        nodeTextures={nodeTextures}
        onNodeClick={onNodeClick}
        getSphereRotation={getSphereRotation}
        depth={depth}
        maxDepth={maxDepth}
        onNodeHover={onNodeHover}
        clusterCenterTitle={clusterCenterTitle}
      />
    </>
  )
}

export default GlobalSecondOrderNodes
