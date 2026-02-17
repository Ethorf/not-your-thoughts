import React from 'react'
import SphereWithEffects from '@components/Spheres/SphereWithEffects'
import GlobalFirstOrderNodes from './GlobalFirstOrderNodes'
import { SPHERE_TYPES, GLOBAL_SPHERE_SIZES } from '@constants/spheres'
import { buildGlobalHoverInfo } from './hoverInfoHelpers'

/**
 * Renders a single cluster in Global View: the main (hub) node and its first-order connections.
 */
const GlobalClusterView = ({
  mainNode,
  firstOrderNodes,
  firstOrderConnectionsMap,
  nodeTextures,
  onNodeClick,
  onNodeHover,
  getSphereRotation,
}) => {
  const clusterCenterTitle = mainNode?.node?.title || 'Unknown'

  return (
    <>
      {mainNode && (
        <SphereWithEffects
          key={mainNode.node.id}
          id={mainNode.node.id}
          pos={mainNode.position.toArray()}
          title={mainNode.node.title}
          size={GLOBAL_SPHERE_SIZES[SPHERE_TYPES.MAIN]}
          mainTexture={nodeTextures.get(mainNode.node.id)}
          onClick={() => onNodeClick(mainNode.node.id)}
          onHover={onNodeHover}
          hoverInfo={buildGlobalHoverInfo({
            entry: mainNode,
            clusterCenterTitle,
            connectionType: 'main',
            parentTitle: null,
          })}
          rotation={getSphereRotation(mainNode.position)}
        />
      )}

      <GlobalFirstOrderNodes
        mainNode={mainNode}
        firstOrderNodes={firstOrderNodes}
        firstOrderConnectionsMap={firstOrderConnectionsMap}
        nodeTextures={nodeTextures}
        onNodeClick={onNodeClick}
        getSphereRotation={getSphereRotation}
        onNodeHover={onNodeHover}
        clusterCenterTitle={clusterCenterTitle}
      />
    </>
  )
}

export default GlobalClusterView
