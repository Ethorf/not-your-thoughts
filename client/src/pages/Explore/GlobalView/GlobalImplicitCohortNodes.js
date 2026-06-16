import React, { useMemo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import SphereWithEffects from '@components/Spheres/SphereWithEffects.js'
import {
  SPHERE_TYPES,
  GLOBAL_SPHERE_SIZES,
  getGlobalConnectionSphereSize,
} from '@constants/spheres'
import { CONNECTION_TYPES } from '@constants/connectionTypes'
import useGlobalSecondOrderConnections from '@hooks/useGlobalSecondOrderConnections'
import { claimGlobalRenderOwners } from '@redux/reducers/currentEntryReducer'
import GlobalSecondOrderNodes from './GlobalSecondOrderNodes'
import { buildGlobalHoverInfo } from './hoverInfoHelpers'
import { buildDashedLinesBetween } from './globalConnectionLineHelpers'
import { positionSecondOrderSiblings } from './GlobalSecondOrderSiblingNodes'

/**
 * Renders a parent's non-path children in the same cohort band as the path anchor.
 * Graph edges to the parent use dashed lines; layout uses sibling positioning.
 */
const GlobalImplicitCohortNodes = ({
  layoutAnchorNode,
  graphParentNode,
  nodes,
  cohortIndexOffset = 0,
  depth = 1,
  maxDepth = Number.POSITIVE_INFINITY,
  visitedNodeIds = [],
  nodeTextures,
  onNodeClick,
  getSphereRotation,
  onNodeHover,
  clusterCenterTitle,
}) => {
  const visitedNodeIdSet = useMemo(() => new Set(visitedNodeIds), [visitedNodeIds])
  const positionedNodes = useMemo(() => {
    if (!layoutAnchorNode || !nodes?.length) return []
    return positionSecondOrderSiblings(layoutAnchorNode, nodes, depth, cohortIndexOffset)
  }, [layoutAnchorNode, nodes, depth, cohortIndexOffset])

  const dispatch = useDispatch()
  const globalRenderOwners = useSelector((state) => state.currentEntry.globalRenderOwners || {})
  const ownerId = layoutAnchorNode?.node?.id
  const nodeIds = useMemo(() => positionedNodes.map((entry) => entry?.node?.id).filter(Boolean), [positionedNodes])

  useEffect(() => {
    if (!ownerId || !nodeIds.length) return
    const unowned = nodeIds.filter((id) => !globalRenderOwners[id])
    if (!unowned.length) return
    dispatch(claimGlobalRenderOwners({ ownerId, nodeIds: unowned }))
  }, [dispatch, ownerId, nodeIds, globalRenderOwners])

  const renderableNodes = useMemo(() => {
    if (!positionedNodes?.length || !ownerId) return []
    return positionedNodes.filter((entry) => {
      const nodeId = entry?.node?.id
      if (!nodeId) return false
      const owner = globalRenderOwners[nodeId]
      return !owner || owner === ownerId
    })
  }, [positionedNodes, globalRenderOwners, ownerId])

  const connectionLines = useMemo(
    () => buildDashedLinesBetween(graphParentNode, renderableNodes),
    [graphParentNode, renderableNodes]
  )
  const connectionsByNodeId = useGlobalSecondOrderConnections(renderableNodes)

  if (!renderableNodes?.length) return null

  const graphParentTitle = graphParentNode?.node?.title || null

  return (
    <>
      {connectionLines}
      {renderableNodes.map((entry) => (
        <SphereWithEffects
          key={`implicit-cohort-${entry.node.id}`}
          id={entry.node.id}
          pos={entry.position.toArray()}
          title={entry.node.title}
          size={getGlobalConnectionSphereSize(
            entry.totalConnectionCount ?? entry.connectedNodes?.length ?? 0,
            GLOBAL_SPHERE_SIZES[SPHERE_TYPES.SECOND_ORDER_CONNECTION]
          )}
          mainTexture={nodeTextures.get(entry.node.id)}
          onClick={() => onNodeClick(entry.node.id)}
          onHover={onNodeHover}
          hoverInfo={buildGlobalHoverInfo({
            entry,
            clusterCenterTitle,
            connectionType: entry.connectionType || CONNECTION_TYPES.FRONTEND.CHILD,
            parentTitle: graphParentTitle,
          })}
          rotation={getSphereRotation(entry.position)}
        />
      ))}
      {depth < maxDepth &&
        renderableNodes.map((cohortEntry) => {
          const connectedNodes = (connectionsByNodeId.get(cohortEntry.node.id) || []).filter(
            (entry) => !visitedNodeIdSet.has(entry?.node?.id)
          )
          if (!connectedNodes?.length) return null

          return (
            <GlobalSecondOrderNodes
              key={`implicit-cohort-expand-${cohortEntry.node.id}`}
              anchorNode={cohortEntry}
              nodes={connectedNodes}
              depth={depth + 1}
              maxDepth={maxDepth}
              visitedNodeIds={[...visitedNodeIds, cohortEntry.node.id]}
              nodeTextures={nodeTextures}
              onNodeClick={onNodeClick}
              getSphereRotation={getSphereRotation}
              onNodeHover={onNodeHover}
              clusterCenterTitle={clusterCenterTitle}
            />
          )
        })}
    </>
  )
}

export default GlobalImplicitCohortNodes
