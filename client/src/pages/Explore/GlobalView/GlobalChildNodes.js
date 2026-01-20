import React from 'react'
import SphereWithEffects from '@components/Spheres/SphereWithEffects.js'
import { SPHERE_TYPES, GLOBAL_SPHERE_SIZES } from '@constants/spheres'

/**
 * Renders child first-order nodes in the Global View.
 * Visually they use the same sizing as other first-order connections,
 * but are separated into their own layer for future styling if needed.
 */
const GlobalChildNodes = ({ nodes, nodeTextures, onNodeClick, getSphereRotation }) => {
  if (!nodes?.length) return null

  return (
    <>
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

