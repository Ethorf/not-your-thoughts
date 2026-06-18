import React, { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

const LocalDashedConnectionLine = ({ start, end, color = 'white' }) => {
  const lineRef = useRef(null)

  const { geometry, dashSize, gapSize } = useMemo(() => {
    const startVec = start instanceof THREE.Vector3 ? start : new THREE.Vector3(...start)
    const endVec = end instanceof THREE.Vector3 ? end : new THREE.Vector3(...end)
    const points = [startVec, endVec]
    const lineLength = startVec.distanceTo(endVec)
    const size = Math.min(0.22, Math.max(0.08, lineLength / 10))

    return {
      geometry: new THREE.BufferGeometry().setFromPoints(points),
      dashSize: size,
      gapSize: size * 0.45,
    }
  }, [start, end])

  useEffect(() => {
    if (lineRef.current) {
      lineRef.current.computeLineDistances()
    }
  }, [geometry, dashSize, gapSize])

  return (
    <line ref={lineRef} geometry={geometry} renderOrder={0}>
      <lineDashedMaterial
        color={color}
        dashSize={dashSize}
        gapSize={gapSize}
        depthWrite={false}
        depthTest={false}
      />
    </line>
  )
}

export default LocalDashedConnectionLine
