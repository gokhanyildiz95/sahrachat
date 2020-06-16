import { ApolloServer } from 'apollo-server-express';
import mModels from './models/mongo';
import schema from './graphql/schema';
import resolvers from './graphql/resolvers';
import db from './models/index';

const { createWriteStream, unlink } = require('fs');
const mkdirp = require('mkdirp');
const shortid = require('shortid');

/*
const allowedOrigins = ['http://localhost:3000',
  'http://localhost:8000',
  'http://localhost:3000/gql'];
const corsOptions = {
  origin: '*',
  credentials: true,
};
*/
const UPLOAD_DIR = './files';
mkdirp.sync(UPLOAD_DIR);
const storeUpload = async (upload) => {
  const { createReadStream, filename, mimetype } = await upload;
  const stream = createReadStream();
  const id = shortid.generate();
  const path = `${UPLOAD_DIR}/${id}-${filename}`;
  const file = {
    id, filename, mimetype, path,
  };

  // Store the file in the filesystem.
  await new Promise((resolve, reject) => {
    stream
      .on('error', (error) => {
        unlink(path, () => {
          reject(error);
        });
      })
      .pipe(createWriteStream(path))
      .on('error', reject)
      .on('finish', resolve);
  });
  file.path = file.path.replace('.', '');

  return file;
};


const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  // cors: false,
  /* eslint-disable-next-line */
  context: async ({ req, connection }) => {
    if (connection) {
      return {
        mModels,
      };
    }

    if (req) {
      return {
        db,
        mModels,
        user: req.user,
        host: req.get('origin'),
        protocol: req.protocol,
        secret: 'kb cat',
        storeUpload,
      };
    }
  },
  playground: {
    settings: {
      'request.credentials': 'include',
    },
  },
});

export default server;
