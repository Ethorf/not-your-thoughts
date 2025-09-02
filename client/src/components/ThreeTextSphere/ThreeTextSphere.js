import React, { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

// Constants
import { CONNECTION_TYPES } from '@constants/connectionTypes'
import { DEFAULT_SPHERE_SIZES } from '@constants/spheres'

import styles from './ThreeTextSphere.module.scss'

const {
  FRONTEND: { EXTERNAL },
} = CONNECTION_TYPES

const ThreeTextSphere = ({
  conn,
  text,
  title,
  onClick,
  position = [0, 0, 0],
  sphereType,
  size = DEFAULT_SPHERE_SIZES.MAIN,
}) => {
  const mainSphereRef = useRef()
  const haloRef = useRef()
  const targetOpacity = useRef(0.2)
  const [hovered, setHovered] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const tooltipTimeout = useRef(null)

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const initialSphereSize = size ?? DEFAULT_SPHERE_SIZES[sphereType]

  // Create a canvas texture for the rotating text + static title
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = 1024
    canvas.height = 512

    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (text) {
      ctx.fillStyle = 'silver'
      ctx.font = '12px Syncopate'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      const words = text.split(' ')
      let line = ''
      const maxWidth = canvas.width - 100
      const lines = []

      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' '
        const metrics = ctx.measureText(testLine)
        if (metrics.width > maxWidth && i > 0) {
          lines.push(line.trim())
          line = words[i] + ' '
        } else {
          line = testLine
        }
      }
      lines.push(line.trim())

      const lineHeight = 40
      let y = canvas.height / 2 - ((lines.length - 1) * lineHeight) / 2

      lines.forEach((l) => {
        ctx.fillText(l, canvas.width / 2, y)
        y += lineHeight
      })
    }

    if (title) {
      ctx.font = 'bold 28px Syncopate'
      ctx.fillStyle = 'white'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(title, canvas.width / 2, canvas.height / 2)
    }

    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.RepeatWrapping
    return tex
  }, [text, title])

  // Hover animations
  useFrame(() => {
    if (!haloRef.current || !mainSphereRef.current) return

    targetOpacity.current = hovered ? 1 : 0.2

    // Smooth halo opacity
    haloRef.current.material.opacity += (targetOpacity.current - haloRef.current.material.opacity) * 0.08

    // Smooth scaling relative to base size
    const targetScale = hovered ? 1.1 : 1
    mainSphereRef.current.scale.lerp(
      new THREE.Vector3(
        initialSphereSize * targetScale,
        initialSphereSize * targetScale,
        initialSphereSize * targetScale
      ),
      0.08
    )

    // Halo matches but slightly larger
    const haloScale = targetScale * 1.05
    haloRef.current.scale.lerp(
      new THREE.Vector3(initialSphereSize * haloScale, initialSphereSize * haloScale, initialSphereSize * haloScale),
      0.08
    )
  })

  const getTooltipText = () => {
    if (!conn) {
      return `Edit ${title}`
    }
    return conn.connection_type === EXTERNAL ? `Follow ${title} link` : `Explore ${title}'s connections`
  }

  // Clean up tooltip timer if unmounted
  useEffect(() => {
    return () => {
      if (tooltipTimeout.current) {
        clearTimeout(tooltipTimeout.current)
      }
    }
  }, [])

  return (
    <>
      {/* Main sphere */}
      <mesh
        onClick={onClick}
        ref={mainSphereRef}
        rotation={[0, 4.7, 0]}
        position={position}
        scale={[initialSphereSize, initialSphereSize, initialSphereSize]} // 👈 base size applied here
      >
        <sphereGeometry args={[1, 64, 64]} /> {/* 👈 always radius 1 */}
        <meshStandardMaterial map={texture} />
      </mesh>

      {/* Halo + hover/tooltip */}
      <mesh
        ref={haloRef}
        position={position}
        onPointerOver={() => {
          setHovered(true)
          tooltipTimeout.current = setTimeout(() => {
            setShowTooltip(true)
          }, 600) // delay in ms
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          setShowTooltip(false)
          if (tooltipTimeout.current) {
            clearTimeout(tooltipTimeout.current)
          }
          document.body.style.cursor = 'default'
        }}
      >
        {showTooltip && (
          <Html
            className={styles.tooltip}
            style={{
              transform: `translate(${mousePos.x + 24}px, ${mousePos.y + 24}px)`,
            }}
          >
            {getTooltipText()}
          </Html>
        )}
        <sphereGeometry args={[1, 64, 64]} /> {/* 👈 also radius 1 */}
        <meshBasicMaterial color="white" transparent side={THREE.BackSide} opacity={0.2} />
      </mesh>
    </>
  )
}

export default ThreeTextSphere
