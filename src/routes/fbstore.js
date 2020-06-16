import express from 'express';
import mModels from '../models/mongo';

const jwt = require('jsonwebtoken');
const parser = require('ua-parser-js');

const secretKey = 'q$3#4234nj2hQ13+';


const debug = require('debug')('mobichat:fbstore');

const router = express.Router();

const getUser = (req) => {
    try {
      let token = "";
      const user = {
        android_user: true,
        dname: "mobikob",
      };
      if (req.headers.authorization) {
        token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, secretKey);
        debug("heleloo dec", decodedToken)
        user.i_user = req.body.i_user;
        user.tenant = req.body.tenant;
      } else {
        user.i_user = req.user.i_user;
        user.tenant = req.user.tenant;
      }
      return user;
    } catch(error) {
      debug('error jwt',error)
      return req.user;
    }
}

router.post('/deletetoken', async (req, res) => {
  await mModels.FirebaseTokens.deleteToken(req.body.token);
  return res.status(200).send({ ok: true }).end();
});

router.post('/storetoken', async (req, res) => {
  const user = getUser(req);

  debug('token user', user)
  if (!user) {
    return res.status(401).send({
      ok: false,
      message: 'Auth failed',
    });
  }
  const ua = parser(req.get('User-Agent'));
  const conditions = {
    user: parseInt(user.i_user, 10),
    tenant: user.tenant,
    dname: user.dname,
  };
  if (req.body.token) {
    const document = await mModels.FirebaseTokens.findOne(conditions);
    // debug("found the doc", document);
    const xForwardedFor = (req.headers['x-forwarded-for'] || '').replace(/:\d+$/, '');
    const ip = xForwardedFor || req.connection.remoteAddress;
    if (document) {
      // already exists
      const isExists = document.tokens.filter((stoken) => stoken.token === req.body.token);
      debug('token exists', isExists);
      if (isExists.length === 0) {
        document.tokens.push(
          {
            ua,
            ip,
            token: req.body.token,
            created_at: new Date(),
          },
        );
        await document.save();
      }
    } else {
      debug('document not exists');
      const fbtoken = new mModels.FirebaseTokens({
        tenant: user.tenant,
        user: parseInt(user.i_user, 10),
        dname: user.dname,
        tokens: [{
          ua,
          ip,
          token: req.body.token,
          created_at: new Date(),
        }],
      });

      await fbtoken.save();
    }
  }
  return res.status(200).send({ ok: true }).end();
});

export const fbRouter = router;
