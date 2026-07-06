import React, { useMemo } from 'react'
import * as THREE from 'three'

import { LOCAL_EXPLORE_OFFSCREEN_PARENT_LINE_LENGTH } from '@constants/spheres'

const LocalOffscreenParentLine = ({ start, length, color = 'gray', layoutScale = 1 }) => {
  const lineLength = (length ?? LOCAL_EXPLORE_OFFSCREEN_PARENT_LINE_LENGTH) * layoutScale

  const geometry = useMemo(() => {
    const startVec = start instanceof THREE.Vector3 ? start.clone() : new THREE.Vector3(...start)
    const endVec = startVec.clone().add(new THREE.Vector3(0, lineLength, 0))
    const curve = new THREE.CatmullRomCurve3([startVec, endVec])
    return new THREE.TubeGeometry(curve, 8, 0.008, 4, false)
  }, [start, lineLength])

  return (
    <mesh geometry={geometry} renderOrder={0}>
      <meshBasicMaterial color={color} depthWrite={false} depthTest={false} />
    </mesh>
  )
}

export default LocalOffscreenParentLine
