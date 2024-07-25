import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import classNames from 'classnames'

// Redux
import { toggleNodeStarred } from '@redux/reducers/currentEntryReducer'

// Components
import { FavStarIcon } from '@components/Shared/FavStarIcon/FavStarIcon'

// Styles
import styles from './StarButton.module.scss'

const StarButton = ({ id, initialStarred }) => {
  const [isStarred, setIsStarred] = useState(initialStarred)
  const dispatch = useDispatch()

  const handleToggleNodeStarred = () => {
    setIsStarred(() => !isStarred)
    dispatch(toggleNodeStarred({ entryId: id }))
  }

  return (
    <FavStarIcon
      onClick={handleToggleNodeStarred}
      starred={isStarred}
      className={classNames(styles.favStarIcon, { [styles.starred]: isStarred })}
    />
  )
}

export default StarButton
