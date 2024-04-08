import React, { useState } from 'react'

import { ENTRY_TYPES } from '../../constants/entryTypes.js'

import DefaultButton from '../../components/Shared/DefaultButton/DefaultButton.js'
import NodeEntriesList from '../../components/NodeEntriesList/NodeEntriesList.js'
import JournalEntriesList from '../../components/JournalEntriesList/JournalEntriesList.js'

import '../ProfilePage/ProfilePage.scss'
import '../../styles/rubberDucky.scss'
import './Entries.scss'

const { NODE, JOURNAL } = ENTRY_TYPES

const Entries = () => {
  const [activeEntriesType, setActiveEntriesType] = useState(NODE)

  return (
    <div className={`profile`}>
      <h2 className={`profile__header`}>SAVED ENtRIES</h2>
      <div>
        <DefaultButton isSelected={activeEntriesType === NODE} onClick={() => setActiveEntriesType(NODE)}>
          Node
        </DefaultButton>
        <DefaultButton isSelected={activeEntriesType === JOURNAL} onClick={() => setActiveEntriesType(JOURNAL)}>
          Journal
        </DefaultButton>
      </div>
      {activeEntriesType === JOURNAL && <JournalEntriesList />}
      {activeEntriesType === NODE && <NodeEntriesList />}
    </div>
  )
}

export default Entries
