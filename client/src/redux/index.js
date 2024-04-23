import store from '../redux/store/index'
import { addArticle } from './actions/index'
import { changeWordCount } from './actions/index'

window.store = store
window.addArticle = addArticle
window.changeWordCount = changeWordCount
