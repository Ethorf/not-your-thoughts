import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { CONNECTION_TYPES } from '@constants/connectionTypes'
import { SPHERE_TYPES, GLOBAL_SPHERE_SIZES, getGlobalConnectionSphereSize } from '@constants/spheres'

const {
  FRONTEND: { PARENT },
} = CONNECTION_TYPES

const FOCUS_RING_BASE_OPACITY = 0.7
const FOCUS_RING_FADE_SPEED = 2.2
const FOCUS_RING_SCALE = 0.4

const FocusRingMesh = ({ entryId, size, isFading, onFadeComplete }) => {
  const materialRef = useRef(null)
  const meshRef = useRef(null)
  const opacityRef = useRef(FOCUS_RING_BASE_OPACITY)
  const completedRef = useRef(false)
  const { scene } = useThree()

  useEffect(() => {
    if (!isFading) {
      opacityRef.current = FOCUS_RING_BASE_OPACITY
      completedRef.current = false
      if (materialRef.current) {
        materialRef.current.opacity = FOCUS_RING_BASE_OPACITY
      }
    }
  }, [isFading])

  useFrame((_, delta) => {
    if (!meshRef.current) return

    const sphereMesh = scene.getObjectByName(`node-sphere-${entryId}`)
    if (sphereMesh) {
      const wp = new THREE.Vector3()
      sphereMesh.getWorldPosition(wp)
      meshRef.current.position.copy(wp)
    }

    if (!materialRef.current || !isFading || completedRef.current) return

    const nextOpacity = Math.max(0, opacityRef.current - delta * FOCUS_RING_FADE_SPEED)
    opacityRef.current = nextOpacity
    materialRef.current.opacity = nextOpacity

    if (nextOpacity <= 0) {
      completedRef.current = true
      onFadeComplete?.()
    }
  })

  return (
    <mesh ref={meshRef} renderOrder={4}>
      <sphereGeometry args={[size * FOCUS_RING_SCALE, 64, 64]} />
      <meshBasicMaterial
        ref={materialRef}
        color="white"
        transparent
        opacity={FOCUS_RING_BASE_OPACITY}
        side={THREE.BackSide}
      />
    </mesh>
  )
}

const FocusedEntryRing = ({ entryId, clusterViews, dismissSignal = 0 }) => {
  const [showFocusedRing, setShowFocusedRing] = useState(true)
  const [isFadingFocusedRing, setIsFadingFocusedRing] = useState(false)

  useEffect(() => {
    setShowFocusedRing(true)
    setIsFadingFocusedRing(false)
  }, [entryId])

  useEffect(() => {
    if (!showFocusedRing || isFadingFocusedRing) return
    if (dismissSignal <= 0) return
    setShowFocusedRing(false)
    setIsFadingFocusedRing(true)
  }, [dismissSignal, showFocusedRing, isFadingFocusedRing])

  const focusedNodeSize = useMemo(() => {
    if (!entryId || !clusterViews?.length || (!showFocusedRing && !isFadingFocusedRing)) return null

    const entryIdString = String(entryId)
    for (const view of clusterViews) {
      if (view?.mainNode?.node?.id != null && String(view.mainNode.node.id) === entryIdString) {
        return GLOBAL_SPHERE_SIZES[SPHERE_TYPES.MAIN]
      }

      const firstOrderMatch = (view?.firstOrderNodes || []).find(
        (entry) => entry?.node?.id != null && String(entry.node.id) === entryIdString
      )
      if (firstOrderMatch) {
        const baseSize =
          firstOrderMatch?.connectionType === PARENT
            ? GLOBAL_SPHERE_SIZES[SPHERE_TYPES.FIRST_ORDER_PARENT]
            : GLOBAL_SPHERE_SIZES[SPHERE_TYPES.FIRST_ORDER_CONNECTION]
        return getGlobalConnectionSphereSize(
          firstOrderMatch.totalConnectionCount ?? firstOrderMatch.connectedNodes?.length ?? 0,
          baseSize
        )
      }

      const secondOrderMatch = (view?.secondOrderNodes || []).find(
        (entry) => entry?.node?.id != null && String(entry.node.id) === entryIdString
      )
      if (secondOrderMatch) {
        return getGlobalConnectionSphereSize(
          secondOrderMatch.totalConnectionCount ?? secondOrderMatch.connectedNodes?.length ?? 0,
          GLOBAL_SPHERE_SIZES[SPHERE_TYPES.SECOND_ORDER_CONNECTION]
        )
      }
    }

    return null
  }, [entryId, clusterViews, showFocusedRing, isFadingFocusedRing])

  if (!focusedNodeSize) return null

  return (
    <FocusRingMesh
      entryId={entryId}
      size={focusedNodeSize}
      isFading={isFadingFocusedRing}
      onFadeComplete={() => setIsFadingFocusedRing(false)}
    />
  )
}

export default FocusedEntryRing
