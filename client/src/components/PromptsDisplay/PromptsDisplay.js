import React, { useEffect, useState } from 'react'
import classNames from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import { useHotkeys } from 'react-hotkeys-hook'

import { fetchCustomPrompts } from '@redux/reducers/customPromptsReducer'
import { openModal } from '@redux/reducers/modalsReducer.js'

import TextButton from '../Shared/TextButton/TextButton'
import DefaultButton from '../Shared/DefaultButton/DefaultButton'

import { randomNum } from '@utils/randomNum.js'

import { MODAL_NAMES } from '@constants/modalNames'

// Assets
import firstIcon from '../../assets/Icons/prompt-icons/first-gray.png'
import previousIcon from '../../assets/Icons/prompt-icons/previous-gray.png'
import shuffleIcon from '../../assets/Icons/prompt-icons/shuffle-gray.png'
import nextIcon from '../../assets/Icons/prompt-icons/next-gray.png'
import lastIcon from '../../assets/Icons/prompt-icons/last-gray.png'

import styles from './PromptsDisplay.module.scss'

const PromptsDisplay = () => {
  const dispatch = useDispatch()
  const [activePromptIndex, setActivePromptIndex] = useState(0)

  const { customPrompts } = useSelector((state) => state.customPrompts)

  useEffect(() => {
    dispatch(fetchCustomPrompts())
  }, [dispatch])

  const handleOpenModal = () => {
    dispatch(openModal(MODAL_NAMES.CUSTOM_PROMPTS))
  }

  const handleShuffle = () => {
    setActivePromptIndex(randomNum(customPrompts.length - 1))
  }

  return customPrompts.length ? (
    <div className={styles.wrapper}>
      <div className={styles.topContainer}>
        <h3 data-tooltip-id="main-tooltip" data-tooltip-content="Custom prompt" className={styles.prompt}>
          {customPrompts[activePromptIndex].content}
        </h3>
        <TextButton
          tooltip="Add / Customize prompts"
          className={classNames(styles.noBorder, styles.plusButton)}
          onClick={handleOpenModal}
        >
          +
        </TextButton>
      </div>
      <div className={styles.controlsContainer}>
        {activePromptIndex !== 0 ? (
          <>
            <DefaultButton
              className={styles.noBorder}
              onClick={() => setActivePromptIndex(0)}
              tooltip="First Prompt ctrl + f"
            >
              <img
                className={classNames(styles.controlsButton, styles.firstButton, styles.tooltip)}
                src={firstIcon}
                alt="go to first prompt"
              />
            </DefaultButton>
            <DefaultButton
              className={styles.noBorder}
              onClick={() => setActivePromptIndex(activePromptIndex - 1)}
              tooltip="Previous Prompt ctrl + p"
            >
              <img
                className={classNames(styles.controlsButton, styles.prevButton, styles.tooltip)}
                src={previousIcon}
                alt="go to previous prompt"
              />
            </DefaultButton>
          </>
        ) : (
          <>
            <div />
            <div />
          </>
        )}
        <DefaultButton className={styles.noBorder} onClick={handleShuffle} tooltip="Shuffle Prompts ctrl + ?">
          <img
            className={classNames(styles.controlsButton, styles.shuffleButton, styles.tooltip)}
            src={shuffleIcon}
            alt="shuffle Prompts"
          />
        </DefaultButton>
        {activePromptIndex !== customPrompts.length - 1 ? (
          <>
            <DefaultButton
              className={styles.noBorder}
              onClick={() => setActivePromptIndex(activePromptIndex + 1)}
              tooltip="Next Prompt ctrl + n"
            >
              <img
                className={classNames(styles.controlsButton, styles.nextButton, styles.tooltip)}
                src={nextIcon}
                alt="go to next prompt"
              />
            </DefaultButton>
            <DefaultButton
              className={styles.noBorder}
              onClick={() => setActivePromptIndex(customPrompts.length - 1)}
              tooltip="Last Prompt ctrl + l"
            >
              <img
                className={classNames(styles.controlsButton, styles.lastButton, styles.tooltip)}
                src={lastIcon}
                alt="go to last prompt"
              />
            </DefaultButton>
          </>
        ) : (
          <>
            <div />
            <div />
          </>
        )}
      </div>
    </div>
  ) : null
}

export default PromptsDisplay

// useHotkeys(
//     'ctrl+s',
//     () => {
//         argsShuffle();
//     },
//     { enableOnTags: ['TEXTAREA'] }
// );
// useHotkeys(
//     'ctrl+f',
//     () => {
//         first();
//     },
//     { enableOnTags: ['TEXTAREA'] }
// );
// useHotkeys(
//     'ctrl+n',
//     () => {
//         next();
//     },
//     { enableOnTags: ['TEXTAREA'] }
// );
// useHotkeys(
//     'ctrl+p',
//     () => {
//         prev();
//     },
//     { enableOnTags: ['TEXTAREA'] }
// );
// useHotkeys(
//     'ctrl+l',
//     () => {
//         last();
//     },
//     { enableOnTags: ['TEXTAREA'] }
// );
