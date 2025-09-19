import React, { Suspense, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation } from 'react-router-dom'
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
import sharedStyles from '@styles/sharedClassnames.module.scss'

// Constants
import { CONNECTION_TYPES } from '@constants/connectionTypes'
import { SPHERE_TYPES, DEFAULT_SPHERE_SIZES } from '@constants/spheres'

// Utils
import { transformConnection } from '@utils/transformConnection'
import extractTextFromHTML from '@utils/extractTextFromHTML'
import calculateSpherePositions from '@utils/calculateSpherePositions'

const {
  FRONTEND: { PARENT, EXTERNAL, CHILD, SIBLING },
} = CONNECTION_TYPES

const Explore = () => {
  const nodeEntriesInfo = useNodeEntriesInfo()
  const history = useHistory()
  const location = useLocation()
  const dispatch = useDispatch()

  const { content, title, entryId } = useSelector((state) => state.currentEntry)
  const { connections } = useSelector((state) => state.connections)

  // *** May not actually need this right now, I think I'm just going to start with filtering the main entryId
  // const [seenNodeIds, setSeenNodeIds] = useState([entryId])

  // --- Positioning logic ---
  const { positions, center, lineExtensionFactor, externalDistanceFactor } = calculateSpherePositions(connections, {
    PARENT,
    EXTERNAL,
    CHILD,
    SIBLING,
  })

  // **** Handle query parameters for entryId
  // useEffect(() => {
  //   const urlParams = new URLSearchParams(location.search)
  //   const queryEntryId = urlParams.get('entryId')

  //   if (queryEntryId && queryEntryId !== entryId) {
  //     // If there's a query param entryId and it's different from current, set it
  //     dispatch(setEntryById(queryEntryId))
  //   } else if (!queryEntryId && entryId) {
  //     // If there's no query param but we have an entryId, add it to the URL
  //     const newUrl = `${location.pathname}?entryId=${entryId}`
  //     history.replace(newUrl)
  //   }
  // }, [location.search, entryId, dispatch, history, location.pathname])

  const handleMainNodeClick = async () => {
    history.push(`/edit-node-entry?entryId=${entryId}`)
  }

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
      // Update the query parameter when switching to a different entry
      const newUrl = `${location.pathname}?entryId=${id}`
      history.replace(newUrl)
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
            {/* Main node - render on top */}
            <group>
              <ThreeTextSphere
                text={extractTextFromHTML(content)}
                title={title}
                position={center}
                sphereType={SPHERE_TYPES.MAIN}
                size={DEFAULT_SPHERE_SIZES[SPHERE_TYPES.MAIN]}
                onClick={handleMainNodeClick}
                rotation={[0, 4.7, 0]}
              />
            </group>

            {/* LINES Connection to main - render first */}
            <group>
              {connections?.map((conn) => {
                const pos = positions[conn.id]
                if (!pos) return null

                // Calculate line start/end points to avoid overlapping spheres
                const isExternal = conn.connection_type === EXTERNAL
                const extensionFactor = isExternal ? externalDistanceFactor : lineExtensionFactor
                const endPos = new THREE.Vector3(...pos).multiplyScalar(extensionFactor)
                const startPos = new THREE.Vector3(...center)

                // line geometry from main -> connection
                const points = [startPos, endPos]
                const geometry = new THREE.BufferGeometry().setFromPoints(points)

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
                    renderOrder={0}
                  >
                    {isExternal ? (
                      <lineDashedMaterial
                        color="white"
                        dashSize={0.3}
                        gapSize={0.2}
                        linewidth={1}
                        depthWrite={false}
                        depthTest={false}
                      />
                    ) : (
                      <lineBasicMaterial color="white" linewidth={1} depthWrite={false} depthTest={false} />
                    )}
                  </line>
                )
              })}
            </group>

            {/* CONNECTION SPHERES + their sub spheres - render second */}
            <group>
              {connections?.map((conn) => {
                const transformed = transformConnection(entryId, conn)
                const pos = positions[conn.id]
                if (!pos) return null

                const isExternal = conn.connection_type === EXTERNAL
                const extensionFactor = isExternal ? externalDistanceFactor : lineExtensionFactor
                const endPos = new THREE.Vector3(...pos).multiplyScalar(extensionFactor)

                const nodeInfo = nodeEntriesInfo.find((n) => n.id === transformed.id)
                const sphereSize = getScaledSphereSize(
                  DEFAULT_SPHERE_SIZES[SPHERE_TYPES.CONNECTION],
                  nodeInfo?.wdWordCount
                )

                return (
                  <React.Fragment key={conn.id}>
                    {/* PARENT connection sphere */}
                    <ThreeTextSphere
                      conn={conn}
                      connId={transformed.id}
                      title={transformed.title}
                      position={endPos}
                      sphereType={SPHERE_TYPES.CONNECTION}
                      size={sphereSize}
                      onClick={() => handleConnectionSphereClick(transformed.id, conn)}
                    />
                  </React.Fragment>
                )
              })}
            </group>
          </Suspense>
        </Canvas>
      </div>
    </div>
  )
}

export default Explore
