import React, { useMemo } from 'react'
import SphereWithEffects from '@components/Spheres/SphereWithEffects.js'
import { SPHERE_TYPES, GLOBAL_SPHERE_SIZES } from '@constants/spheres'
import { buildConnectionLinesForNodes } from '@utils/globalViewHelpers'

/**
 * Renders parent first-order nodes and their connection lines in the Global View.
 */
const GlobalParentNodes = ({ mainNode, nodes, firstOrderConnectionsMap, nodeTextures, onNodeClick, getSphereRotation }) => {
  // Build connection lines between main node and parent nodes
  // NOTE: React Hooks must be called unconditionally and before any early returns
  const connectionLines = useMemo(
    () => buildConnectionLinesForNodes(mainNode, nodes, firstOrderConnectionsMap),
    [mainNode, nodes, firstOrderConnectionsMap]
  )

  if (!nodes?.length) return null

  return (
    <>
      {/* Connection lines */}
      {connectionLines}

      {/* Parent node spheres */}
      {nodes.map(({ node, position }) => (
        <SphereWithEffects
          key={node.id}
          id={node.id}
          pos={position.toArray()}
          title={node.title}
          size={GLOBAL_SPHERE_SIZES[SPHERE_TYPES.FIRST_ORDER_CONNECTION]}
          mainTexture={nodeTextures.get(node.id)}
          onClick={() => onNodeClick(node.id)}
          rotation={getSphereRotation(position)}
        />
      ))}
    </>
  )
}

export default GlobalParentNodes
