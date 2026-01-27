import React, { useMemo } from 'react'
import { CONNECTION_TYPES } from '@constants/connectionTypes'
import GlobalExternalNodes from './GlobalExternalNodes'
import GlobalSiblingNodes from './GlobalSiblingNodes'
import GlobalParentNodes from './GlobalParentNodes'
import GlobalChildNodes from './GlobalChildNodes'

const {
  FRONTEND: { EXTERNAL, SIBLING, PARENT, CHILD },
} = CONNECTION_TYPES

/**
 * Renders first-order connection lines and their corresponding node spheres
 * categorized by connection type (external, sibling, parent, child) in the Global View.
 * Each connection type component handles its own lines and spheres.
 */
const GlobalFirstOrderNodes = ({
  mainNode,
  firstOrderNodes,
  firstOrderConnectionsMap,
  nodeTextures,
  onNodeClick,
  getSphereRotation,
}) => {
  // Categorize first-order nodes by their connection type.
  // connectionType is attached upstream in positionGlobalNodes to avoid redundant lookups here.
  const { externalNodes, siblingNodes, parentNodes, childNodes } = useMemo(() => {
    const external = []
    const sibling = []
    const parent = []
    const child = []

    firstOrderNodes?.forEach((entry) => {
      const { connectionType } = entry

      if (connectionType === EXTERNAL) {
        external.push(entry)
      } else if (connectionType === SIBLING) {
        sibling.push(entry)
      } else if (connectionType === PARENT) {
        parent.push(entry)
      } else if (connectionType === CHILD) {
        child.push(entry)
      }
    })

    return {
      externalNodes: external,
      siblingNodes: sibling,
      parentNodes: parent,
      childNodes: child,
    }
  }, [firstOrderNodes])

  if (!firstOrderNodes?.length) return null

  return (
    <>
      <GlobalParentNodes
        mainNode={mainNode}
        nodes={parentNodes}
        firstOrderConnectionsMap={firstOrderConnectionsMap}
        nodeTextures={nodeTextures}
        onNodeClick={onNodeClick}
        getSphereRotation={getSphereRotation}
      />

      <GlobalExternalNodes
        mainNode={mainNode}
        nodes={externalNodes}
        firstOrderConnectionsMap={firstOrderConnectionsMap}
        nodeTextures={nodeTextures}
        onNodeClick={onNodeClick}
        getSphereRotation={getSphereRotation}
      />

      <GlobalSiblingNodes
        mainNode={mainNode}
        nodes={siblingNodes}
        firstOrderConnectionsMap={firstOrderConnectionsMap}
        nodeTextures={nodeTextures}
        onNodeClick={onNodeClick}
        getSphereRotation={getSphereRotation}
      />

      <GlobalChildNodes
        mainNode={mainNode}
        nodes={childNodes}
        firstOrderConnectionsMap={firstOrderConnectionsMap}
        nodeTextures={nodeTextures}
        onNodeClick={onNodeClick}
        getSphereRotation={getSphereRotation}
      />
    </>
  )
}

export default GlobalFirstOrderNodes
