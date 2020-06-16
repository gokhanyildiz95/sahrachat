/* Get application type
*  Could be standalone app, development, production, extension
*/
import * as configDev from './config/development';
import * as configProdWeb from './config/production.web';
import * as configProdStd from './config/production.standalone';
import * as configExtension from './config/browserExtension';

const appType = {
  PRODUCTION_STANDALONE: {_type: 'PRODUCTION_STANDALONE', config: configProdStd},
  BROWSER_EXTENSION: {_type: 'BROWSER_EXTENSION', config: configExtension},
  DEVELOPMENT: {_type: 'DEVELOPMENT', config: configDev},
  PRODUCTION_TENANT: {_type: 'PRODUCTION_TENANT', config: configProdWeb},
};


var currentAppType = appType.DEVELOPMENT;
const TENANT = window.location.hostname.split('.').length === 3 ? window.location.hostname.split('.')[0] : '';
if (TENANT !== '') {
  currentAppType = appType.PRODUCTION_TENANT;
} else if (window.location.hostname === 'localhost') {
  currentAppType = appType.DEVELOPMENT;
} else if (window.location.hostname === 'localhost') {
  currentAppType = appType.DEVELOPMENT;
} else if (window.location.hostname.startsWith('chat')) {
  currentAppType = appType.PRODUCTION_STANDALONE;
} else {
  currentAppType = appType.BROWSER_EXTENSION;
}

// export default appType.PRODUCTION_TENANT;
export default currentAppType;
