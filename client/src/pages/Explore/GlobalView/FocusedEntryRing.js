import React, { useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const FOCUS_RING_BASE_OPACITY = 0.7
const FOCUS_RING_FADE_SPEED = 2.2
const FOCUS_RING_HALO_SCALE = 1.15

const FocusRingMesh = ({ entryId, isFading, onFadeComplete }) => {
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

      const geoRadius = sphereMesh.geometry?.parameters?.radius ?? 1
      const worldRadius = geoRadius * sphereMesh.scale.x * FOCUS_RING_HALO_SCALE
      meshRef.current.scale.set(worldRadius, worldRadius, worldRadius)
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
      <sphereGeometry args={[1, 64, 64]} />
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

const FocusedEntryRing = ({ entryId, dismissSignal = 0 }) => {
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

  if (!entryId || (!showFocusedRing && !isFadingFocusedRing)) return null

  return (
    <FocusRingMesh
      entryId={entryId}
      isFading={isFadingFocusedRing}
      onFadeComplete={() => setIsFadingFocusedRing(false)}
    />
  )
}

export default FocusedEntryRing
