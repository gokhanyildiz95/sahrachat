import formidable from 'formidable';
import mModels from '../models/mongo';
import { PROJECT_DIR } from '../settings';

const debug = require('debug')('mobichat:middleware:fileUpload');

const uploadDir = 'files';

const fileMiddleware = (req, res, next) => {
  if (!req.is('multipart/form-data')) {
    return next();
  }

  const form = formidable.IncomingForm({
    uploadDir,
  });
  form.type = true;
  form.keepExtensions = true;
  form.on('fileBegin', (name, file) => {
    file.path = `${PROJECT_DIR}/files/${file.name}`;
  });

  form.parse(req, (error, fields, files) => {
    if (error) {
      debug('error', error);
    }
    debug('field', fields);
    const document = JSON.parse(fields.operations);
    debug('req body', document);
    if (Object.keys(files).length) {
      const { file: { type, name, path: filePath } } = files;
      debug('type', type);
      debug('fp', filePath);
      // just need path
      document.variables.file = {
        path: filePath,
      };
      /*
      mModels.ChatFiles.create({
        filename: name,
        localname: filePath,
        filesize: 20
      }).then((data) => {
        console.log("data", dataj
      ;
      })
      */
    }
    debug('doc', document);
    // req.body = document
    next();
  });
};

export default fileMiddleware;
