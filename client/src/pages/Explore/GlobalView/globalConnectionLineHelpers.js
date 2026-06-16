import React, { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

export const DashedLine = ({ lineKey, points, color = 'white', dashSize = 0.03, gapSize = 0.02 }) => {
  const lineRef = useRef(null)

  const geometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [points])

  useEffect(() => {
    if (lineRef.current) {
      lineRef.current.computeLineDistances()
    }
  }, [geometry])

  return (
    <line ref={lineRef} key={lineKey} geometry={geometry}>
      <lineDashedMaterial color={color} dashSize={dashSize} gapSize={gapSize} />
    </line>
  )
}

export const buildDashedLinesBetween = (sourceNode, targetNodes, { color = 'white', dashSize = 0.03, gapSize = 0.02 } = {}) => {
  if (!sourceNode || !targetNodes?.length) return []

  const sourcePosition =
    sourceNode.position instanceof THREE.Vector3 ? sourceNode.position : new THREE.Vector3(...sourceNode.position)

  return targetNodes.map((entry) => {
    const targetPosition =
      entry.position instanceof THREE.Vector3 ? entry.position : new THREE.Vector3(...entry.position)
    const connectionKey = [sourceNode.node.id, entry.node.id].sort().join('-')
    const points = [sourcePosition.clone(), targetPosition.clone()]

    return (
      <DashedLine
        key={connectionKey}
        lineKey={connectionKey}
        points={points}
        color={color}
        dashSize={dashSize}
        gapSize={gapSize}
      />
    )
  })
}
