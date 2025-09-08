import React, { Suspense, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import classNames from 'classnames'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'

import useNodeEntriesInfo from '@hooks/useNodeEntriesInfo'
import ThreeTextSphere from '@components/ThreeTextSphere/ThreeTextSphere.js'

// Redux
import { setEntryById } from '@redux/reducers/currentEntryReducer'
import { fetchConnections } from '@redux/reducers/connectionsReducer'

// Styles
import styles from './Explore.module.scss'
import sharedStyles from '@styles/shared.module.scss'

// Constants
import { CONNECTION_TYPES } from '@constants/connectionTypes'
import { SPHERE_TYPES, DEFAULT_SPHERE_SIZES } from '@constants/spheres'

// Utils
import { transformConnection } from '@utils/transformConnection'

const {
  FRONTEND: { PARENT, EXTERNAL, CHILD, SIBLING },
} = CONNECTION_TYPES

const Explore = () => {
  const nodeEntriesInfo = useNodeEntriesInfo()
  const history = useHistory()
  const dispatch = useDispatch()

  const { content, title, entryId } = useSelector((state) => state.currentEntry)
  const { connections } = useSelector((state) => state.connections)

  const handleMainNodeClick = async () => {
    history.push(`/edit-node-entry?entryId=${entryId}`)
  }

  function extractTextFromHTML(htmlString) {
    const doc = new DOMParser().parseFromString(htmlString, 'text/html')
    return doc.body.textContent || ''
  }

  // --- Positioning logic ---
  const center = [0, 0, 0]
  const positions = {}
  const LINE_EXTENSION_FACTOR = 1.5

  const SPHERE_DIAMETER = 0.5 * 2
  const MIN_SEPARATION = SPHERE_DIAMETER + 0.1

  const SIBLING_DISTANCE_FROM_CENTER_SPHERE = 0.4
  const CHILD_DISTANCE_FROM_CENTER_SPHERE = SIBLING_DISTANCE_FROM_CENTER_SPHERE + 0.6
  const PARENT_DISTANCE_FROM_CENTER_SPHERE = SIBLING_DISTANCE_FROM_CENTER_SPHERE + 0.5

  // Filter connections by type
  const siblings = connections?.filter((c) => c.connection_type === SIBLING) || []
  const parents = connections?.filter((c) => c.connection_type === PARENT) || []
  const children = connections?.filter((c) => c.connection_type === CHILD) || []
  const externals = connections?.filter((c) => c.connection_type === EXTERNAL) || []

  const OUTER_FACTOR = 1.1
  const scaleFromOrigin = (pos, factor) => {
    const v = new THREE.Vector3(...pos)
    return v.multiplyScalar(factor).toArray()
  }

  // Position siblings
  siblings.forEach((s, i) => {
    // Alternate left and right sides
    const side = i % 2 === 0 ? -1 : 1
    const x = side * (SPHERE_DIAMETER + SIBLING_DISTANCE_FROM_CENTER_SPHERE)
    const y = Math.floor(i / 2) * MIN_SEPARATION * (i % 2 === 0 ? 1 : -1)
    positions[s.id] = scaleFromOrigin([x, y, 0], OUTER_FACTOR)
  })

  // Position externals
  externals.forEach((e, i) => {
    const diagonalIndex = i % 4
    const ring = Math.floor(i / 4)
    const baseDistance = SPHERE_DIAMETER * 3
    const distance = baseDistance * (1 + ring * 0.4)
    const offset = ring * 0.8

    let x = 0,
      y = 0
    switch (diagonalIndex) {
      case 0:
        x = -distance - offset
        y = distance + offset
        break
      case 1:
        x = distance + offset
        y = distance + offset
        break
      case 2:
        x = distance + offset
        y = -distance - offset
        break
      case 3:
        x = -distance - offset
        y = -distance - offset
        break
      default:
        // Default case for any unexpected values
        x = distance
        y = distance
        break
    }

    positions[e.id] = [x, y, 0]
  })

  // Position parents
  parents.forEach((p, i) => {
    positions[p.id] = [0, SPHERE_DIAMETER + MIN_SEPARATION * i + 2, 0]
  })

  // Position children
  children.forEach((c, i) => {
    const x = (i - (children.length - 1) / 2) * MIN_SEPARATION
    const y = -2
    positions[c.id] = scaleFromOrigin([x, y, 0], CHILD_DISTANCE_FROM_CENTER_SPHERE)
  })

  useEffect(() => {
    if (entryId) {
      dispatch(fetchConnections(entryId))
    }
  }, [dispatch, entryId])

  const handleConnectionSphereClick = async (id, conn) => {
    if (conn.connection_type === EXTERNAL) {
      window.open(conn.foreign_source, '_blank')
    } else {
      await dispatch(setEntryById(id))
    }
  }

  function getMostRecentlyModifiedItem(items) {
    if (!Array.isArray(items) || items.length === 0) return null
    const validItems = items.filter((item) => item && item.date_last_modified)
    if (validItems.length === 0) return null
    return validItems.reduce((latest, current) =>
      new Date(current.date_last_modified) > new Date(latest.date_last_modified) ? current : latest
    )
  }

  function getScaledSphereSize(baseSize, wordCount) {
    if (!wordCount || wordCount <= 0) return baseSize
    const factor = Math.log10(wordCount + 1) / 5
    const delta = Math.min(Math.max(factor, -0.5), 0.2)
    return baseSize * (1 + delta)
  }

  useEffect(() => {
    if (!entryId && Array.isArray(nodeEntriesInfo)) {
      const mostRecent = getMostRecentlyModifiedItem(nodeEntriesInfo)
      if (mostRecent?.id) {
        dispatch(setEntryById(mostRecent.id))
      }
    }
  }, [dispatch, entryId, nodeEntriesInfo])

  return (
    <div className={classNames(styles.wrapper, sharedStyles.flexColumnCenter)}>
      <h1>Explore</h1>
      <div className={styles.nodesWrapper}>
        <Canvas camera={{ position: [0, 0, 8] }}>
          <ambientLight />
          <directionalLight position={[5, 5, 5]} />

          <Suspense fallback={null}>
            {/* Main node */}
            <group renderOrder={1}>
              <ThreeTextSphere
                text={extractTextFromHTML(content)}
                title={title}
                position={center}
                sphereType={SPHERE_TYPES.MAIN}
                size={DEFAULT_SPHERE_SIZES[SPHERE_TYPES.MAIN]}
                onClick={handleMainNodeClick}
              />
            </group>

            {/* Connection lines to main */}
            {connections?.map((conn) => {
              const pos = positions[conn.id]
              if (!pos) return null

              // Calculate line start/end points to avoid overlapping spheres
              const endPos = new THREE.Vector3(...pos).multiplyScalar(LINE_EXTENSION_FACTOR)
              const startPos = new THREE.Vector3(...center)

              // line geometry from main -> connection
              const points = [startPos, endPos]
              const geometry = new THREE.BufferGeometry().setFromPoints(points)
              const isExternal = conn.connection_type === EXTERNAL

              return (
                <line
                  key={`line-${conn.id}`}
                  geometry={geometry}
                  dashed={isExternal}
                  onUpdate={(line) => {
                    if (isExternal && line.computeLineDistances) {
                      line.computeLineDistances()
                    }
                  }}
                >
                  {isExternal ? (
                    <lineDashedMaterial color="white" dashSize={0.3} gapSize={0.2} linewidth={1} />
                  ) : (
                    <lineBasicMaterial color="white" linewidth={1} />
                  )}
                </line>
              )
            })}

            {/* Connection spheres + their sub spheres */}
            {connections?.map((conn) => {
              const transformed = transformConnection(entryId, conn)
              const pos = positions[conn.id]
              if (!pos) return null

              const endPos = new THREE.Vector3(...pos).multiplyScalar(LINE_EXTENSION_FACTOR)

              const nodeInfo = nodeEntriesInfo.find((n) => n.id === transformed.id)
              const sphereSize = getScaledSphereSize(
                DEFAULT_SPHERE_SIZES[SPHERE_TYPES.CONNECTION],
                nodeInfo?.wdWordCount
              )

              return (
                <React.Fragment key={conn.id}>
                  {/* Parent connection sphere */}
                  <group renderOrder={1}>
                    <ThreeTextSphere
                      conn={conn}
                      connId={transformed.id}
                      title={transformed.title}
                      position={endPos}
                      sphereType={SPHERE_TYPES.CONNECTION}
                      size={sphereSize}
                      onClick={handleConnectionSphereClick}
                    />
                  </group>
                </React.Fragment>
              )
            })}
          </Suspense>
        </Canvas>
      </div>
    </div>
  )
}

export default Explore
