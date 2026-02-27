import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { GLOBAL_CENTER_GLOBE_RADIUS } from '@constants/spheres'

const GradientGlobe = ({ isLoading = false }) => {
  const innerRef = useRef()
  const glowRef = useRef()

  useFrame((_, delta) => {
    if (isLoading) {
      if (innerRef.current) innerRef.current.rotation.y += delta * 0.8
      if (glowRef.current) glowRef.current.rotation.y += delta * 0.8
    }
  })

  return (
    <group>
      <mesh ref={innerRef}>
        <sphereGeometry args={[GLOBAL_CENTER_GLOBE_RADIUS, 64, 64]} />
        <meshBasicMaterial
          color={0x888888}
          transparent
          opacity={0.12}
          side={THREE.FrontSide}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={glowRef}>
        <sphereGeometry args={[GLOBAL_CENTER_GLOBE_RADIUS * 1.03, 64, 64]} />
        <meshBasicMaterial
          color={0xaaaaaa}
          transparent
          opacity={0.06}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

export default GradientGlobe
