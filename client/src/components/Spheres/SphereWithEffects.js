import React, { useRef, useState, useMemo, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

// Constants
import { CONNECTION_TYPES } from '@constants/connectionTypes'

import styles from './SphereWithEffects.module.scss'

const {
  FRONTEND: { EXTERNAL },
} = CONNECTION_TYPES

const SphereWithEffects = ({ id, pos, title, size, conn, mainTexture, onClick, rotation = [0, 4.7, 0] }) => {
  const [localHovered, setLocalHovered] = useState(false)
  const [localTooltip, setLocalTooltip] = useState(false)
  const localTooltipTimeout = useRef(null)
  const sphereRef = useRef()
  const haloRef = useRef()

  // Memoized tooltip text generation
  const getTooltipText = useCallback(
    (title) => {
      if (!conn) {
        return `Edit ${title}`
      }
      return conn.connection_type === EXTERNAL ? `Follow ${title} link` : `Explore ${title}'s connections`
    },
    [conn]
  )

  // Lorem ipsum text for sphere backgrounds
  const LOREM_IPSUM =
    'Struggling with the best way to call this one, but it definitely relates to K. Anders Ericsson. These are the things that drive us all. Ericcson (IIRC) posits that capabilities do not drive us, but instead feedback loops of internal positive reinforcement that are at least to some large degree innate. Thus we are not ever "talented", we just feel psychological rewards from practising certain skills as opposed to others, thus are internally incentivized to continue this behaviour.'

  // Create individual texture for this sphere (unless using main texture)
  const sphereTexture = useMemo(() => {
    if (mainTexture) return mainTexture

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = 1024
    canvas.height = 512

    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add lorem ipsum background text (similar to main sphere)
    ctx.fillStyle = 'silver'
    ctx.font = '12px Syncopate'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    const words = LOREM_IPSUM.split(' ')
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

    // Add title on top of lorem ipsum
    if (title) {
      ctx.font = 'bold 28px Syncopate'
      ctx.fillStyle = 'white'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(title, canvas.width / 2, canvas.height / 2)
    }

    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = THREE.ClampToEdgeWrapping
    tex.wrapT = THREE.ClampToEdgeWrapping
    return tex
  }, [title, mainTexture])

  // Memoized hover handlers
  const handlePointerOver = useCallback(() => {
    setLocalHovered(true)
    localTooltipTimeout.current = setTimeout(() => setLocalTooltip(true), 600)
    document.body.style.cursor = 'pointer'
  }, [])

  const handlePointerOut = useCallback(() => {
    setLocalHovered(false)
    setLocalTooltip(false)
    if (localTooltipTimeout.current) {
      clearTimeout(localTooltipTimeout.current)
      localTooltipTimeout.current = null
    }
    document.body.style.cursor = 'default'
  }, [])

  const handleClick = useCallback(() => {
    onClick?.(id, conn)
  }, [onClick, id, conn])

  // hover animation
  useFrame(() => {
    if (!sphereRef.current || !haloRef.current) return
    const targetScale = localHovered ? 1.1 : 1
    sphereRef.current.scale.lerp(new THREE.Vector3(size * targetScale, size * targetScale, size * targetScale), 0.08)
    haloRef.current.material.opacity += ((localHovered ? 1 : 0.2) - haloRef.current.material.opacity) * 0.08
    haloRef.current.scale.lerp(
      new THREE.Vector3(size * targetScale * 1.05, size * targetScale * 1.05, size * targetScale * 1.05),
      0.08
    )
  })

  return (
    <group>
      <mesh
        ref={sphereRef}
        onClick={handleClick}
        rotation={rotation}
        position={pos}
        renderOrder={3}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[size, 64, 64]} />
        <meshStandardMaterial map={sphereTexture} />
      </mesh>

      {/* Halo */}
      <mesh ref={haloRef} position={pos} renderOrder={3}>
        {localTooltip && <Html className={styles.tooltip}>{getTooltipText(title)}</Html>}
        <sphereGeometry args={[size, 64, 64]} />
        <meshBasicMaterial color="white" transparent side={THREE.BackSide} opacity={0.2} />
      </mesh>
    </group>
  )
}

export default SphereWithEffects
