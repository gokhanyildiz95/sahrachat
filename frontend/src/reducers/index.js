// @flow
import { combineReducers } from 'redux';
import titlebar from './titlebar';
import crmTable from './crmTable';
import cdrTable from './cdrTable';

const getReducers = () => {
  return combineReducers({
    titlebar,
    crmTable,
    cdrTable,
  });
};

export default getReducers;
