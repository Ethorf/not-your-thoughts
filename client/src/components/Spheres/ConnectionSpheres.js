import React, { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as THREE from 'three'

// Constants
import { CONNECTION_TYPES } from '@constants/connectionTypes'
import {
  SPHERE_TYPES,
  LOCAL_SPHERE_SIZES,
  LOCAL_EXPLORE_MAX_SUB_CONNECTION_DEPTH,
  LOCAL_EXPLORE_SECOND_ORDER_DISTANCE,
  LOCAL_EXPLORE_SUB_CONNECTION_SIZE_SCALE,
} from '@constants/spheres'

// Redux
import { fetchConnectionsDirect } from '@redux/reducers/connectionsReducer'

// Utils
import { transformConnection } from '@utils/transformConnection'
import { transformBackendToFrontendConnectionType } from '@utils/connectionTypeHelpers'
import { getLocalSecondOrderSiblingOrbitalOffset } from '@utils/positionLocalSecondOrderSibling'

// Components
import SphereWithEffects from './SphereWithEffects'
import LocalOffscreenParentLine from './LocalOffscreenParentLine'

const {
  FRONTEND: { EXTERNAL, PARENT, SIBLING },
} = CONNECTION_TYPES

const ConnectionSpheres = ({
  conn,
  connId,
  handleConnectionSphereClick,
  position = [0, 0, 0],
  rotation = [0, 4.7, 0],
  size = LOCAL_SPHERE_SIZES[SPHERE_TYPES.FIRST_ORDER_CONNECTION],
  verticalOffset = 0,
  horizontalOffset = 0,
  currentEntryId = null,
  excludedNodeIds = [],
  graphCenter = null,
  layoutScale = 1,
  depth = 1,
  maxDepth = LOCAL_EXPLORE_MAX_SUB_CONNECTION_DEPTH,
}) => {
  const dispatch = useDispatch()
  const [subConnections, setSubConnections] = useState(null)
  const [fetchError, setFetchError] = useState(null)

  const reduxState = useSelector(
    (state) => state?.currentEntry,
    () => false
  )
  const reduxEntryId = reduxState?.entryId || null

  const effectiveEntryId = currentEntryId || reduxEntryId

  useEffect(() => {
    const fetchSubs = async () => {
      if (!connId) return

      try {
        setFetchError(null)
        const result = await dispatch(fetchConnectionsDirect(connId)).unwrap()
        setSubConnections(result)
      } catch (err) {
        console.error('Error fetching sub-connections:', err)
        setFetchError(err)
        setSubConnections([])
      }
    }
    fetchSubs()
  }, [connId, dispatch])

  const orbitalRadius = LOCAL_EXPLORE_SECOND_ORDER_DISTANCE
  const subSphereSize = size * LOCAL_EXPLORE_SUB_CONNECTION_SIZE_SCALE
  const excludedNodeIdSet = useMemo(
    () => new Set((excludedNodeIds || []).filter((id) => id != null).map((id) => String(id))),
    [excludedNodeIds]
  )
  const visibleSubConnections = useMemo(() => {
    if (conn?.connection_type === EXTERNAL || fetchError || !subConnections?.length) return []

    const seenNodeKeys = new Set()
    const visible = []

    for (const sub of subConnections) {
      if (
        effectiveEntryId &&
        (sub.foreign_entry_id === effectiveEntryId || sub.primary_entry_id === effectiveEntryId)
      ) {
        continue
      }

      const transformed = transformConnection(connId, sub)
      const nodeId = transformed?.id
      const isExternalSub = sub.connection_type === EXTERNAL
      const dedupeKey = isExternalSub ? `external-${sub.id}` : nodeId != null ? String(nodeId) : `sub-${sub.id}`

      if (!isExternalSub && nodeId != null && excludedNodeIdSet.has(String(nodeId))) continue
      if (seenNodeKeys.has(dedupeKey)) continue
      seenNodeKeys.add(dedupeKey)

      visible.push({ sub, transformed })
    }

    return visible
  }, [conn, fetchError, subConnections, effectiveEntryId, connId, excludedNodeIdSet])
  const visibleSiblingSubConnections = useMemo(
    () =>
      visibleSubConnections.filter(
        ({ sub }) => transformBackendToFrontendConnectionType(sub.connection_type, connId, sub) === SIBLING
      ),
    [visibleSubConnections, connId]
  )

  const parentToParentSubId = useMemo(() => {
    if (conn?.connection_type !== PARENT) return null

    const match = visibleSubConnections.find(
      ({ sub }) => transformBackendToFrontendConnectionType(sub.connection_type, connId, sub) === PARENT
    )

    return match?.sub?.id ?? null
  }, [conn, visibleSubConnections, connId])

  const parentPosition = useMemo(() => {
    if (position instanceof THREE.Vector3) return position
    return new THREE.Vector3(...position)
  }, [position])

  return (
    <>
      {visibleSubConnections.map(({ sub, transformed }, i) => {
        const subConnectionType = transformBackendToFrontendConnectionType(sub.connection_type, connId, sub)
        const isParentToParent = conn?.connection_type === PARENT && subConnectionType === PARENT

        if (isParentToParent) {
          if (sub.id !== parentToParentSubId) return null

          return (
            <LocalOffscreenParentLine
              key={`offscreen-parent-${connId}`}
              start={parentPosition}
              layoutScale={layoutScale}
            />
          )
        }

        const angle = (i / Math.max(visibleSubConnections.length, 1)) * Math.PI * 2
        const direction = parentPosition.clone().normalize()
        const up = new THREE.Vector3(0, 1, 0)
        const right = new THREE.Vector3().crossVectors(direction, up).normalize()
        const forward = new THREE.Vector3().crossVectors(right, direction).normalize()
        const siblingIndex = visibleSiblingSubConnections.findIndex((candidate) => candidate.sub.id === sub.id)
        const isSiblingConnection = subConnectionType === SIBLING

        let orbitalOffset
        if (isSiblingConnection) {
          const nonNegativeSiblingIndex = siblingIndex >= 0 ? siblingIndex : i
          orbitalOffset = getLocalSecondOrderSiblingOrbitalOffset(
            parentPosition,
            nonNegativeSiblingIndex,
            orbitalRadius,
            graphCenter,
            depth
          )
        } else {
          orbitalOffset = new THREE.Vector3()
            .addScaledVector(right, Math.cos(angle) * orbitalRadius)
            .addScaledVector(forward, Math.sin(angle) * orbitalRadius)
            .addScaledVector(direction, orbitalRadius * 0.3)
            .addScaledVector(up, verticalOffset)
        }

        if (horizontalOffset !== 0 && !isSiblingConnection) {
          const worldRight = new THREE.Vector3(1, 0, 0)
          orbitalOffset.addScaledVector(worldRight, horizontalOffset * layoutScale)
        }

        const newPos = parentPosition.clone().add(orbitalOffset)
        const newPosArray = newPos.toArray()
        const points = [parentPosition.clone(), newPos.clone()]
        const curve = new THREE.CatmullRomCurve3(points)
        const lineRadius = 0.008
        const geometry = new THREE.TubeGeometry(curve, 8, lineRadius, 4, false)
        const childExcludedNodeIds =
          transformed?.id != null ? [...excludedNodeIds, String(transformed.id)] : excludedNodeIds
        const shouldRecurse = depth < maxDepth && subConnectionType !== EXTERNAL && transformed?.id != null

        return (
          <group key={`${sub.id}-${depth}`}>
            <mesh geometry={geometry} renderOrder={0}>
              <meshBasicMaterial color={'gray'} depthWrite={false} depthTest={false} />
            </mesh>
            <SphereWithEffects
              id={sub.id}
              pos={newPosArray}
              title={transformed.title}
              size={subSphereSize}
              conn={sub}
              onClick={() => handleConnectionSphereClick(transformed.id, conn)}
              rotation={rotation}
            />
            {shouldRecurse && (
              <ConnectionSpheres
                conn={sub}
                connId={transformed.id}
                position={newPosArray}
                size={subSphereSize}
                rotation={rotation}
                verticalOffset={0}
                horizontalOffset={0}
                depth={depth + 1}
                maxDepth={maxDepth}
                graphCenter={graphCenter}
                layoutScale={layoutScale}
                excludedNodeIds={childExcludedNodeIds}
                handleConnectionSphereClick={handleConnectionSphereClick}
                currentEntryId={effectiveEntryId}
              />
            )}
          </group>
        )
      })}
    </>
  )
}

export default ConnectionSpheres
