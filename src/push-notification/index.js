import fapp from '../firebaseInitializer';
import mModels from '../models/mongo';
import { toPlainText } from '../draftUtils';

const debug = require('debug')('mobichat:push-notif');

const fbMessaging = fapp.messaging();
const sendNotification = async (payload) => {
  fbMessaging.sendMulticast(payload).then((resp) => {
    debug('sent the notif', JSON.stringify(resp));
    if (resp.failureCount > 0) {
      resp.responses.forEach((v, i) => {
        if (!v.success) {
          debug('deleting token', payload.tokens[i]);
          mModels.FirebaseTokens.deleteToken(payload.tokens[i]);
        }
      });
    }
  })
    .catch((error) => {
      debug('error', error);
    });
};

export default sendNotification;
