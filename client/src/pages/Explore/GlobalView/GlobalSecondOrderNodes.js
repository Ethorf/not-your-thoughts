import React, { useMemo } from 'react'
import { CONNECTION_TYPES } from '@constants/connectionTypes'
import GlobalSecondOrderSiblingNodes from './GlobalSecondOrderSiblingNodes'
import GlobalSecondOrderParentNodes from './GlobalSecondOrderParentNodes'
import GlobalSecondOrderChildNodes from './GlobalSecondOrderChildNodes'
import GlobalSecondOrderExternalNodes from './GlobalSecondOrderExternalNodes'

/**
 * Renders second-order nodes grouped by connection type for a given parent.
 */
const GlobalSecondOrderNodes = ({ parentNode, nodes, nodeTextures, onNodeClick, getSphereRotation }) => {
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

  if (!nodes?.length) return null

  return (
    <>
      <GlobalSecondOrderParentNodes
        parentNode={parentNode}
        nodes={parentNodes}
        nodeTextures={nodeTextures}
        onNodeClick={onNodeClick}
        getSphereRotation={getSphereRotation}
      />

      <GlobalSecondOrderExternalNodes
        parentNode={parentNode}
        nodes={externalNodes}
        nodeTextures={nodeTextures}
        onNodeClick={onNodeClick}
        getSphereRotation={getSphereRotation}
      />

      <GlobalSecondOrderSiblingNodes
        parentNode={parentNode}
        nodes={siblingNodes}
        nodeTextures={nodeTextures}
        onNodeClick={onNodeClick}
        getSphereRotation={getSphereRotation}
      />

      <GlobalSecondOrderChildNodes
        parentNode={parentNode}
        nodes={childNodes}
        nodeTextures={nodeTextures}
        onNodeClick={onNodeClick}
        getSphereRotation={getSphereRotation}
      />
    </>
  )
}

export default GlobalSecondOrderNodes
