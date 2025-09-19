import React, { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { useDispatch, useSelector } from 'react-redux'

// Constants
import { CONNECTION_TYPES } from '@constants/connectionTypes'
import { DEFAULT_SPHERE_SIZES } from '@constants/spheres'

// Redux
import { fetchConnectionsDirect } from '@redux/reducers/connectionsReducer'

// Utils
import { transformConnection } from '@utils/transformConnection'

import styles from './ThreeTextSphere.module.scss'

const {
  FRONTEND: { EXTERNAL },
} = CONNECTION_TYPES

// Reusable sphere with hover halo + tooltip
const SphereWithEffects = ({ id, pos, title, size, conn, mainTexture, onClick, getTooltipText }) => {
  const [localHovered, setLocalHovered] = useState(false)
  const [localTooltip, setLocalTooltip] = useState(false)
  const localTooltipTimeout = useRef(null)
  const sphereRef = useRef()
  const haloRef = useRef()

  // Create individual texture for this sphere (unless using main texture)
  const sphereTexture = useMemo(() => {
    if (mainTexture) return mainTexture

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = 1024
    canvas.height = 512

    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

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
        onClick={() => onClick?.(id, conn)}
        rotation={[0, 4.7, 0]}
        position={pos}
        renderOrder={3}
        onPointerOver={() => {
          setLocalHovered(true)
          localTooltipTimeout.current = setTimeout(() => setLocalTooltip(true), 600)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setLocalHovered(false)
          setLocalTooltip(false)
          if (localTooltipTimeout.current) clearTimeout(localTooltipTimeout.current)
          document.body.style.cursor = 'default'
        }}
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

const ThreeTextSphere = ({
  conn,
  connId,
  text,
  title,
  onClick,
  position = [0, 0, 0],
  sphereType,
  rotation = [0, 4.7, 0],
  size = DEFAULT_SPHERE_SIZES.MAIN,
}) => {
  const dispatch = useDispatch()
  const [subConnections, setSubConnections] = useState(null)
  const initialSphereSize = size ?? DEFAULT_SPHERE_SIZES[sphereType]
  const { entryId: currentEntryId } = useSelector((state) => state.currentEntry)

  // Create a canvas texture for the main sphere with text + title
  const mainTexture = useMemo(() => {
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
    tex.wrapS = THREE.ClampToEdgeWrapping
    tex.wrapT = THREE.ClampToEdgeWrapping
    return tex
  }, [text, title])

  const getTooltipText = (title) => {
    if (!conn) {
      return `Edit ${title}`
    }
    return conn.connection_type === EXTERNAL ? `Follow ${title} link` : `Explore ${title}'s connections`
  }

  // Fetch one level of sub-connections
  useEffect(() => {
    const fetchSubs = async () => {
      const result = await dispatch(fetchConnectionsDirect(connId)).unwrap()
      setSubConnections(result)
    }
    if (connId) fetchSubs()
  }, [connId, dispatch])

  const ORBITAL_RADIUS = size * 3

  return (
    <>
      {/* Main sphere */}
      <SphereWithEffects
        id={connId}
        pos={position}
        title={title}
        size={initialSphereSize}
        getTooltipText={getTooltipText}
        conn={conn}
        mainTexture={mainTexture}
        onClick={onClick}
      />

      {/* Sub-connections with orbital lines */}
      {conn?.connection_type !== EXTERNAL &&
        subConnections
          ?.filter((conn) => conn.foreign_entry_id !== currentEntryId && conn.primary_entry_id !== currentEntryId)
          .map((sub, i) => {
            // Create orbital position around the main sphere
            const angle = (i / subConnections.length) * Math.PI * 2 // Distribute evenly around circle

            // Compute direction vector from origin -> this sphere
            const direction = new THREE.Vector3(...position).normalize()

            // Create a perpendicular vector to the direction for orbital plane
            const up = new THREE.Vector3(0, 1, 0)
            const right = new THREE.Vector3().crossVectors(direction, up).normalize()
            const forward = new THREE.Vector3().crossVectors(right, direction).normalize()

            // Calculate orbital position
            const orbitalOffset = new THREE.Vector3()
              .addScaledVector(right, Math.cos(angle) * ORBITAL_RADIUS)
              .addScaledVector(forward, Math.sin(angle) * ORBITAL_RADIUS)
              // Add additional offset in the direction away from origin to ensure no overlap
              .addScaledVector(direction, ORBITAL_RADIUS * 0.3)

            const newPos = new THREE.Vector3(...position).add(orbitalOffset).toArray()

            // line geometry from parent -> sub
            const points = [new THREE.Vector3(...position), new THREE.Vector3(...newPos)]
            const geometry = new THREE.BufferGeometry().setFromPoints(points)

            const transformed = transformConnection(connId, sub)

            return (
              <group key={sub.id}>
                <line geometry={geometry} renderOrder={0}>
                  <lineBasicMaterial color="white" linewidth={0.8} depthWrite={false} depthTest={false} />
                </line>
                <SphereWithEffects
                  id={sub.id}
                  pos={newPos}
                  title={transformed.title}
                  size={initialSphereSize * 0.7}
                  conn={sub}
                  onClick={onClick}
                  getTooltipText={getTooltipText}
                />
              </group>
            )
          })}
    </>
  )
}

export default ThreeTextSphere
