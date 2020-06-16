import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import expressSession from 'express-session';
import redis from 'redis';
import settings from './settings';
import apolloServer from './apollo-server';

import { initializePassport } from './passauth/passport';
import { initializeRoutes, initializeErrorRoutes } from './routes';
import mModels, { connectMDb } from './models/mongo';

const bodyParser = require('body-parser');
let RedisStore = require('connect-redis')(expressSession);
let redisClient = redis.createClient();


const debug = require('debug')('mobichat:server');
const { fromPlainText, toJSON } = require('./draftUtils');

debug('settitngs', settings);

// const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
const PORT = 9000;


const app = express();


app.use('/chat/files', express.static('files'));

const allowedOrigins = ['http://localhost:3000',
  'http://localhost:9000',
  'http://localhost:9005',
  'http://localhost:9000/gql',
  'http://10.0.0.128:3000',
  'http://10.0.0.128:3000/gql',
  'http://10.0.0.128:9000',
  'http://10.0.0.128:9000/gql',
  'http://aria.850.net.tr:8000/gql',
  'http://aria.850.net.tr:8000/chat',
  'http://aria.850.net.tr:8000',
  'http://sahra.850.net.tr:8000/gql',
  'http://sahra.850.net.tr:8000/chat',
  'http://sahra.850.net.tr:8000',
  'http://localhost:9000/member',
  'http://localhost:3000/member',
  'http://testserver:9005',
  'http://testserver:9005/gql',
  'http://localhost:3000/gql'];

/*
app.use((req, res, next) => {
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
   next();
})
*/


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('sdsjkdhjaksbk'));

app.use(
  expressSession({
    store: new RedisStore({ client: redisClient }),
    secret: 'sdsjkdhjaksbk',
    saveUninitialized: false,
    resave: false,
    cookie: {
      sameSite: true,
      secure: false, // true works on only https
      maxAge:  24 * 60 * 60 * 1000,
    }
  })
)
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

initializePassport(app, settings);
app.use(bodyParser.json());
// app.use(fileMiddleware);
apolloServer.applyMiddleware({
  app,
  path: '/gql',
  cors: {
    credentials: true,
    origin: true,
  },
});
initializeRoutes(app);
initializeErrorRoutes(app);

const httpServer = createServer(app);
apolloServer.installSubscriptionHandlers(httpServer);

const deleteOnRestart = false;

connectMDb().then(async () => {
  if (deleteOnRestart) {
    await mModels.Thread.deleteMany({});
    await mModels.Message.deleteMany({});
    await mModels.User.deleteMany({});
    createMessages();
  }
  httpServer.listen({ port: PORT }, () => {
    debug(`GQL API running on ${PORT} url /gql`);
  });
}).catch(async (error) => {
  debug(`we got a error ${error}`);
});


const createMessages = async () => {
  const messageTypeObj = {
    text: 'text',
    media: 'media',
    draftjs: 'draftjs',
  };
  const t1 = new mModels.Thread({});
  const t2 = new mModels.Thread({});
  t2.members = [];
  t2.members.push({
   userId: 6, lastSeen: new Date(),
  });

  t1.members = [];
  t1.members.push({
   userId: 6, lastSeen: new Date(),
  });
  t1.members.push({userId: 22, lastSeen: new Date()});
  t1.tenant = 'sahra';
  t1.isGroup = true;
  t1.groupInfo = {
    name: 'NOC',
    owners: [6],
    isPrivate: false,
  };
  const m1 = new mModels.Message({
    content: JSON.stringify(toJSON(fromPlainText('A second one'))),
    user: 6,
    thread: t1,
    messageType: 'draftjs',
  });
  const m2 = new mModels.Message({
    content: 'https://spectrum.imgix.net/threads/bfc03901-502a-489a-b2aa-001fc5615c17/885d21ca-6447-4fb3-8071-b03d18d98924-241423.jpg?expires=1575936000000&ixlib=js-1.4.1&s=1dfc7fd92f79f9d83df5fdcec629ddb6',
    user: 22,
    messageType: 'media',
    thread: t1,
  });
  const u1state = new mModels.UserStates({
    user: 6,
    lastSeen: new Date(),
    lastActivity: new Date(),
    isOnline: true,
    tenant: 'sahra',
  });
  const u2state = new mModels.UserStates({
    user: 22,
    lastSeen: new Date(),
    lastActivity: new Date(),
    isOnline: true,
    tenant: 'sahra',
  });

  await m1.save();
  await m2.save();
  await u1state.save();
  await u2state.save();
  await t1.save();
  await t2.save();
};
