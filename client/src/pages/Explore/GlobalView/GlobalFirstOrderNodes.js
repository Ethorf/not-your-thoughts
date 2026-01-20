import React, { useMemo } from 'react'
import { CONNECTION_TYPES } from '@constants/connectionTypes'
import { buildFirstOrderConnectionLines } from '@utils/globalViewHelpers'
import GlobalExternalNodes from './GlobalExternalNodes'
import GlobalSiblingNodes from './GlobalSiblingNodes'
import GlobalParentNodes from './GlobalParentNodes'
import GlobalChildNodes from './GlobalChildNodes'

const {
  FRONTEND: { EXTERNAL, SIBLING, PARENT, CHILD },
} = CONNECTION_TYPES

/**
 * Renders first-order connection lines and their corresponding node spheres
 * categorized by connection type (external, sibling, parent) in the Global View.
 */
const GlobalFirstOrderNodes = ({
  mainNode,
  firstOrderNodes,
  firstOrderConnectionsMap,
  nodeTextures,
  onNodeClick,
  getSphereRotation,
}) => {
  // Build connection lines between main node and first-order nodes
  const firstOrderConnectionLines = useMemo(
    () => buildFirstOrderConnectionLines(mainNode, firstOrderNodes, firstOrderConnectionsMap),
    [mainNode, firstOrderNodes, firstOrderConnectionsMap]
  )

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
      {/* Lines between main node and first-order nodes */}
      {firstOrderConnectionLines}

      {/* External nodes */}
      <GlobalExternalNodes
        nodes={externalNodes}
        nodeTextures={nodeTextures}
        onNodeClick={onNodeClick}
        getSphereRotation={getSphereRotation}
      />

      {/* Sibling nodes */}
      <GlobalSiblingNodes
        nodes={siblingNodes}
        nodeTextures={nodeTextures}
        onNodeClick={onNodeClick}
        getSphereRotation={getSphereRotation}
      />

      {/* Parent nodes */}
      <GlobalParentNodes
        nodes={parentNodes}
        nodeTextures={nodeTextures}
        onNodeClick={onNodeClick}
        getSphereRotation={getSphereRotation}
      />

      {/* Child nodes */}
      <GlobalChildNodes
        nodes={childNodes}
        nodeTextures={nodeTextures}
        onNodeClick={onNodeClick}
        getSphereRotation={getSphereRotation}
      />
    </>
  )
}

export default GlobalFirstOrderNodes

