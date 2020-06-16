import { createStore } from 'redux'
import getReducer from '../reducers'
export const store = createStore(getReducer());
