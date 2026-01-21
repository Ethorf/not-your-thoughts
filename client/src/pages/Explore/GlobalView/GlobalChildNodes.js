import React, { useMemo } from 'react'
import SphereWithEffects from '@components/Spheres/SphereWithEffects.js'
import { SPHERE_TYPES, GLOBAL_SPHERE_SIZES } from '@constants/spheres'
import { buildConnectionLinesForNodes } from '@utils/globalViewHelpers'

/**
 * Renders child first-order nodes and their connection lines in the Global View.
 * Visually they use the same sizing as other first-order connections,
 * but are separated into their own layer for future styling if needed.
 */
const GlobalChildNodes = ({ mainNode, nodes, firstOrderConnectionsMap, nodeTextures, onNodeClick, getSphereRotation }) => {
  // Build connection lines between main node and child nodes
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

      {/* Child node spheres */}
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

export default GlobalChildNodes

