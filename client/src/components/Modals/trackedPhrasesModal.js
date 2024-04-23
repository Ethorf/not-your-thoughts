import React, { useState } from 'react'
import './trackedPhrasesModal.scss'
import { connect } from 'react-redux'
import { addTrackedPhrase, deleteTrackedPhrase } from '../../redux/actions/authActions'

function TrackedPhrasesModal({ addTrackedPhrase, deleteTrackedPhrase, auth: { user } }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [phraseData, setPhraseData] = useState({
    phrase: '',
  })
  const phraseInput = (e) => {
    e.preventDefault()
    setPhraseData(e.target.value)
  }
  const onSubmit = async (e) => {
    e.preventDefault()
    await addTrackedPhrase({ phrase: phraseData })
    setPhraseData({ phrase: '' })
  }

  return (
    <>
      <button onClick={() => setModalOpen(!modalOpen)}>Edit</button>
      <div open={modalOpen}>
        <h1 className="entry-analysis-modal__header">Tracked Phrases</h1>
        <ol>
          {user.trackedPhrases.map((item) => (
            <li className={`list-item`}>
              <h3 style={{ margin: '0' }}>{item.phrase}</h3>
              <button onClick={() => deleteTrackedPhrase(item.id)}>Delete</button>
            </li>
          ))}
        </ol>
        <form className={`add-new-phrase-form`}>
          <h3 className={`add-new-phrase`}>Add New Phrase:</h3>
          <input disableUnderline="true" onChange={phraseInput} placeholder="phrase" value={phraseData.phrase} />
        </form>
        <button onClick={onSubmit} type="submit">
          Add Phrase
        </button>
        <button onClick={() => setModalOpen(!modalOpen)}>Close</button>s
      </div>
    </>
  )
}

const mapStateToProps = (state) => ({
  auth: state.auth,
})

export default connect(mapStateToProps, { addTrackedPhrase, deleteTrackedPhrase })(TrackedPhrasesModal)
