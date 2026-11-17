const LIST_ITEM_INDENT_CLASS_PREFIX = 'ql-indent-'
const ORDERED_LIST_NUMBER_ATTR = 'data-nyt-ol-num'
const ORDERED_LIST_MARK_ATTR = 'data-nyt-ol-mark'

export const getListItemIndent = (element) => {
  const indentClass = [...element.classList].find((className) =>
    className.startsWith(LIST_ITEM_INDENT_CLASS_PREFIX)
  )

  if (!indentClass) {
    return 0
  }

  return parseInt(indentClass.slice(LIST_ITEM_INDENT_CLASS_PREFIX.length), 10) || 0
}

export const stripListItemIndent = (listItem) => {
  for (let level = 1; level <= 9; level += 1) {
    listItem.classList.remove(`${LIST_ITEM_INDENT_CLASS_PREFIX}${level}`)
  }
}

const isEmptyParagraph = (node) => {
  if (!node || node.tagName !== 'P') {
    return false
  }

  const text = node.textContent.replace(/\u200B/g, '').trim()
  return text === '' || node.innerHTML === '<br>' || node.innerHTML === '<br/>'
}

export const isTopLevelContentParagraph = (node) => {
  if (!node || node.tagName !== 'P' || isEmptyParagraph(node)) {
    return false
  }

  return getListItemIndent(node) === 0
}

const isListElement = (node) => node?.tagName === 'OL' || node?.tagName === 'UL'

const isEmptyListItem = (node) => {
  if (!node || node.tagName !== 'LI') {
    return false
  }

  const text = node.textContent.replace(/\u200B/g, '').trim()
  return text === ''
}

export const isBulletListItem = (listItem) => {
  const listType = listItem.getAttribute('data-list')

  if (listType === 'bullet') {
    return true
  }

  if (listType === 'ordered') {
    return false
  }

  return listItem.parentElement?.tagName === 'UL'
}

const isContinuationOrderedList = (listElement) => {
  let previous = listElement.previousElementSibling

  while (previous && isEmptyParagraph(previous)) {
    previous = previous.previousElementSibling
  }

  return previous?.tagName === 'UL' || previous?.tagName === 'OL'
}

const shouldNumberAsTopLevelOrdered = (listItem, items, index, listElement) => {
  if (isBulletListItem(listItem)) {
    return false
  }

  const indent = getListItemIndent(listItem)

  if (indent === 0) {
    return true
  }

  if (index === 0 && isContinuationOrderedList(listElement)) {
    return true
  }

  const previous = index > 0 ? items[index - 1] : null
  if (!previous) {
    return false
  }

  // Nested under a top-level ordered item (1. → a.) — keep nest.
  if (getListItemIndent(previous) === 0) {
    return false
  }

  // Sibling / deeper nested ordered items (a. → b.) — keep nest.
  // Only strip when Quill left indent after a nested bullet run.
  if (!isBulletListItem(previous)) {
    return false
  }

  return items
    .slice(0, index)
    .some((item) => getListItemIndent(item) === 0 && !isBulletListItem(item))
}

const clearOrderedListNumber = (listItem) => {
  if (listItem.hasAttribute(ORDERED_LIST_NUMBER_ATTR)) {
    listItem.removeAttribute(ORDERED_LIST_NUMBER_ATTR)
    return true
  }

  return false
}

const clearOrderedListMark = (listItem) => {
  if (listItem.hasAttribute(ORDERED_LIST_MARK_ATTR)) {
    listItem.removeAttribute(ORDERED_LIST_MARK_ATTR)
    return true
  }

  return false
}

const toLowerAlpha = (value) => {
  let num = value
  let result = ''

  while (num > 0) {
    num -= 1
    result = String.fromCharCode(97 + (num % 26)) + result
    num = Math.floor(num / 26)
  }

  return result
}

const ROMAN_GLYPHS = [
  [1000, 'm'],
  [900, 'cm'],
  [500, 'd'],
  [400, 'cd'],
  [100, 'c'],
  [90, 'xc'],
  [50, 'l'],
  [40, 'xl'],
  [10, 'x'],
  [9, 'ix'],
  [5, 'v'],
  [4, 'iv'],
  [1, 'i'],
]

const toLowerRoman = (value) => {
  let num = value
  let result = ''

  ROMAN_GLYPHS.forEach(([amount, glyph]) => {
    while (num >= amount) {
      result += glyph
      num -= amount
    }
  })

  return result
}

/** Match Quill's indent marker cycle: a/b, i/ii, 1/2, a/b, ... */
export const formatIndentListMark = (count, indent) => {
  const cycle = ((indent - 1) % 3) + 1

  if (cycle === 1) {
    return toLowerAlpha(count)
  }

  if (cycle === 2) {
    return toLowerRoman(count)
  }

  return String(count)
}

const resetDeeperLevelCounters = (levelCounters, indent) => {
  for (let level = indent + 1; level <= 9; level += 1) {
    levelCounters[level] = 0
  }
}

/**
 * Remove empty paragraphs sandwiched between lists (Quill reload artifact).
 */
export const removeEmptyParagraphsBetweenLists = (root) => {
  if (!root) {
    return false
  }

  let changed = false

  ;[...root.children].forEach((child) => {
    if (!isEmptyParagraph(child)) {
      return
    }

    const previous = child.previousElementSibling
    const next = child.nextElementSibling

    if (isListElement(previous) && isListElement(next)) {
      child.remove()
      changed = true
    }
  })

  return changed
}

/**
 * Outdent continuation ordered items that Quill leaves nested after bullet runs.
 */
export const fixContinuedTopLevelOrderedItems = (root) => {
  if (!root) {
    return false
  }

  let changed = false

  root.querySelectorAll('ol').forEach((listElement) => {
    const items = [...listElement.children].filter((child) => child.tagName === 'LI')

    items.forEach((listItem, index) => {
      if (isEmptyListItem(listItem)) {
        return
      }

      if (!shouldNumberAsTopLevelOrdered(listItem, items, index, listElement)) {
        return
      }

      if (getListItemIndent(listItem) === 0) {
        return
      }

      stripListItemIndent(listItem)
      changed = true
    })
  })

  return changed
}

/**
 * Assign explicit ordered-list markers so split <ol> blocks and nested resets
 * don't depend on fragile CSS counter scoping with Quill.
 */
export const assignOrderedListNumbers = (root) => {
  if (!root) {
    return false
  }

  let changed = false

  root.querySelectorAll(`li[${ORDERED_LIST_NUMBER_ATTR}]`).forEach((listItem) => {
    changed = clearOrderedListNumber(listItem) || changed
  })
  root.querySelectorAll(`li[${ORDERED_LIST_MARK_ATTR}]`).forEach((listItem) => {
    changed = clearOrderedListMark(listItem) || changed
  })

  let topLevelCounter = 0

  ;[...root.children].forEach((child) => {
    if (child.tagName === 'P' && isTopLevelContentParagraph(child)) {
      topLevelCounter = 0
      return
    }

    if (child.tagName !== 'OL') {
      return
    }

    const items = [...child.children].filter((node) => node.tagName === 'LI')
    const levelCounters = Array.from({ length: 10 }, () => 0)

    items.forEach((listItem, index) => {
      if (isBulletListItem(listItem)) {
        changed = clearOrderedListNumber(listItem) || changed
        changed = clearOrderedListMark(listItem) || changed
        return
      }

      const indent = getListItemIndent(listItem)
      resetDeeperLevelCounters(levelCounters, indent)

      if (shouldNumberAsTopLevelOrdered(listItem, items, index, child)) {
        resetDeeperLevelCounters(levelCounters, 0)
        topLevelCounter += 1
        const nextValue = String(topLevelCounter)

        if (listItem.getAttribute(ORDERED_LIST_NUMBER_ATTR) !== nextValue) {
          listItem.setAttribute(ORDERED_LIST_NUMBER_ATTR, nextValue)
          changed = true
        }

        changed = clearOrderedListMark(listItem) || changed
        return
      }

      if (indent <= 0) {
        changed = clearOrderedListMark(listItem) || changed
        return
      }

      levelCounters[indent] += 1
      const nextMark = formatIndentListMark(levelCounters[indent], indent)

      if (listItem.getAttribute(ORDERED_LIST_MARK_ATTR) !== nextMark) {
        listItem.setAttribute(ORDERED_LIST_MARK_ATTR, nextMark)
        changed = true
      }

      changed = clearOrderedListNumber(listItem) || changed
    })
  })

  return changed
}

export const repairQuillListStructure = (root) => {
  const removedGaps = removeEmptyParagraphsBetweenLists(root)
  const fixedIndents = fixContinuedTopLevelOrderedItems(root)

  return removedGaps || fixedIndents
}

export const refreshOrderedListDisplay = (root) => {
  const structuralChange = repairQuillListStructure(root)
  const numbersChanged = assignOrderedListNumbers(root)

  return structuralChange || numbersChanged
}
