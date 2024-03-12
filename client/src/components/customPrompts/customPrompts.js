import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import './customPrompts.scss'
import '../../pages/profile/profile.scss'

import { addCustomPrompt, deleteCustomPrompt, toggleCustomPromptsEnabled } from '../../redux/actions/authActions'

const CustomPrompts = ({
  addCustomPrompt,
  deleteCustomPrompt,
  prompts,
  toggleCustomPromptsEnabled,
  customPromptsEnabled,
}) => {
  const [promptData, setPromptData] = useState({
    prompt: '',
  })
  const [localCustomPromptsEnabled, setLocalCustomPromptsEnabled] = useState(customPromptsEnabled)
  const [localPromptAddOpen, setLocalPromptAddOpen] = useState(false)

  const togglePrompts = () => {
    setLocalCustomPromptsEnabled(!localCustomPromptsEnabled)
    toggleCustomPromptsEnabled()
  }
  const promptInput = (e) => {
    e.preventDefault()
    setPromptData(e.target.value)
  }
  const toggleAddPromptOpen = (e) => {
    e.preventDefault()
    setLocalPromptAddOpen(!localPromptAddOpen)
  }
  const onSubmit = async (e) => {
    e.preventDefault()
    await addCustomPrompt({ prompt: promptData })
    setPromptData({ prompt: '' })
  }
  useEffect(() => {
    setLocalCustomPromptsEnabled(customPromptsEnabled)
  }, [])
  return (
    <div className={`custom-prompts`}>
      <div className={`profile__stats-text profile__toggle-container`}>
        Custom Prompts:
        <div className={`profile__toggle-switch`} onClick={togglePrompts}>
          <span
            className={`profile__on-button profile__toggle-button ${
              localCustomPromptsEnabled ? 'profile__active' : 'profile__inactive'
            }`}
          >
            On
          </span>
          <span
            className={`profile__toggle-button profile__off-button ${
              localCustomPromptsEnabled ? 'profile__inactive' : 'profile__active'
            }`}
          >
            Off
          </span>
        </div>
      </div>
      <div className={localCustomPromptsEnabled ? 'visible' : 'invisible'}>
        <h2
          className={`custom-prompts__title`}
          style={localCustomPromptsEnabled ? { color: 'white' } : { color: 'silver' }}
        >
          Your Prompts
          <span onClick={toggleAddPromptOpen} className={`custom-prompts__add-new`}>
            {' '}
            add +
          </span>
        </h2>
        <form className={`${localPromptAddOpen === true ? 'custom-prompts__add-prompt-input' : 'invisible'}`}>
          <input
            className={`custom-prompts__input`}
            onChange={promptInput}
            placeholder="your prompt here"
            value={promptData.prompt}
          ></input>
          <div className={`custom-prompts__button-container`}>
            <button className={`custom-prompts__button`} onClick={onSubmit} type="submit">
              Add Prompt
            </button>
            <button className={`custom-prompts__button custom-prompts__cancel-button`} onClick={toggleAddPromptOpen}>
              Cancel
            </button>
          </div>
        </form>

        <ul className={`custom-prompts__prompts-container`}>
          {prompts.map((prompt) => {
            return (
              <li className={`custom-prompts__prompt`} key={prompt.id} id={prompt.id}>
                <div className={`custom-prompts__content`}>{prompt.content}</div>
                <span
                  className={`custom-prompts__delete-button`}
                  onClick={() => {
                    deleteCustomPrompt(prompt.id)
                  }}
                >
                  X
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

CustomPrompts.propTypes = {
  prompts: PropTypes.array.isRequired,
  customPromptsEnabled: PropTypes.bool.isRequired,
}

const mapStateToProps = (state) => ({
  prompts: state.auth.user.customPrompts,
  customPromptsEnabled: state.auth.user.customPromptsEnabled,
})

export default connect(mapStateToProps, {
  addCustomPrompt,
  deleteCustomPrompt,
  toggleCustomPromptsEnabled,
})(CustomPrompts)
