import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchNodeEntries } from '../../redux/reducers/nodeEntriesReducer'
import Spinner from '../Shared/Spinner/Spinner'
import { NodeEntry } from '../NodeEntry/NodeEntry'

import styles from './NodeEntriesList.module.scss'

const NodeEntriesList = () => {
  const dispatch = useDispatch()
  const allNodeEntries = useSelector((state) => state.nodeEntries.allNodeEntries.entries)

  useEffect(() => {
    dispatch(fetchNodeEntries())
  }, [dispatch])
  console.log('allNodeEntries is:')
  console.log(allNodeEntries)
  return (
    <div>
      <h2 className={styles.nodesTitle}>Nodes</h2>
      <ul className={styles.listContainer}>
        {allNodeEntries.length ? allNodeEntries.map((nodeEntry) => <NodeEntry node={nodeEntry} />) : <Spinner />}
      </ul>
    </div>
  )
}

export default NodeEntriesList
