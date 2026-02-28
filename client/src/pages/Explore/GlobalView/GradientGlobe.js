import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { GLOBAL_CENTER_GLOBE_RADIUS } from '@constants/spheres'

const seededRandom = (seed) => {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

const createBrainTexture = () => {
  const canvas = document.createElement('canvas')
  canvas.width = 2048
  canvas.height = 1024
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#2a2a2a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const rand = seededRandom(42)
  const w = canvas.width
  const h = canvas.height

  const drawWrap = (startY, baseAngle, lineWidth, alpha) => {
    ctx.beginPath()
    ctx.strokeStyle = `rgba(95, 95, 95, ${alpha})`
    ctx.lineWidth = lineWidth
    ctx.lineCap = 'round'

    let x = 0
    let y = startY
    ctx.moveTo(x, y)

    while (x < w) {
      const wobble = (rand() - 0.5) * 0.7
      const angle = baseAngle + wobble
      const len = 8 + rand() * 18

      const cx1 = x + Math.cos(angle + (rand() - 0.5) * 0.6) * len * 0.6
      const cy1 = y + Math.sin(angle + (rand() - 0.5) * 0.6) * len * 0.6
      x += Math.abs(Math.cos(angle)) * len + 4
      y += Math.sin(angle) * len

      y = Math.max(2, Math.min(h - 2, y))
      ctx.quadraticCurveTo(cx1, cy1, x, y)
    }
    ctx.stroke()
  }

  for (let i = 0; i < 700; i++) {
    const startY = rand() * h
    const drift = (rand() - 0.5) * 0.4
    drawWrap(startY, drift, 0.4 + rand() * 0.8, 0.25 + rand() * 0.3)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  return tex
}

const GradientGlobe = ({ isLoading = false }) => {
  const innerRef = useRef()
  const glowRef = useRef()

  const brainTexture = useMemo(() => createBrainTexture(), [])

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
          map={brainTexture}
          transparent
          opacity={0.35}
          side={THREE.FrontSide}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={glowRef}>
        <sphereGeometry args={[GLOBAL_CENTER_GLOBE_RADIUS * 1.04, 64, 64]} />
        <meshBasicMaterial
          color={0x999999}
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
