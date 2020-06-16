import passport from 'passport';
import {
  Strategy as LocalStrategy,
} from 'passport-local';
import lodash from 'lodash';
import hashers from 'node-django-hashers';
import passportCustom from 'passport-custom';
import db from '../models/index';
import settings from '../settings';

const jwt = require('jsonwebtoken');

const CustomStrategy = passportCustom.Strategy;
const CustomJWTStrategy = passportCustom.Strategy;


const debug = require('debug')('mobichat:passport');

const whitelisted = [
  '/member/login',
  '/verifyAuth',
  '/graphql',
  '/graphql/',
  '/fb/storetoken',
];

export const djangoSession = (app) => {
  app.use((req) => {
    req.settings = settings;
  });
};

export const initializePassport = (app, settings) => {
  app.use(passport.initialize());
  app.use(passport.session());

  // CHECK AUTH
  app.use((req, res, next) => {
    if (whitelisted.indexOf(req.path) > -1) {
      return next();
    }
    
    if (req.isAuthenticated()) {
      return next();
    }

    return res.status(401).send({
      error: 'unauthorized. please login',
    }).end();
  });

  passport.use('customjwt', new CustomJWTStrategy(
    ((req, done) => {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, secret_key);
        const user = {
          android_user: true,
          i_user: req.body.i_user,
          tenant: req.body.tenant,
          dname: 'mobikob',
        };
        debug('qweqwe', user);
        return done(null, user);
      } catch (error) {
        return done(null, false);
      }
    }),
  ));

  passport.use('custom', new CustomStrategy(
    ((req, done) => {
      // const session_key = req.cookies.sessionid;
      let session_key = req.headers['x-session-id'];
      if (!session_key) session_key = req.cookies.sessionid;
      if (!session_key) return done(null, false);
      const host = req.headers['x-forwarded-host'];
      debug('hello', host);
      if (!host) return done(null, false);
      const tenant = host.split('.')[0];
      const domainpart = host.split('.')[1];
      // const tenant = 'sahra';
      if (tenant === 'mobikob') {
        return done(null, false);
      }
      debug('tenant', tenant);
      const dname = settings.dnames[`${domainpart}.com`].dname;
      const sequelize = db[dname];
      sequelize.query(`select schema_name from pbx_tenant where domain_url = ?`, {
        replacements: [`${tenant}.${settings.base_url}`],
        type: sequelize.QueryTypes.SELECT,
      }).then((pbxTenant) => {
        const schema_name = pbxTenant[0].schema_name;
        db[dname].Session.schema(schema_name).findOne({
          where: {
            session_key,
          },
        }).then((session) => {
          if (!session) {
            return done(null, false);
          }
          const buffer = new Buffer.from(session.session_data, 'base64');
          const raw_data = buffer.toString().split(/:(.+)/)[1];
          const session_data = JSON.parse(raw_data);
          // TODO mobile login session dont have is_login @umut
          if (!session_data.is_login && !session_data._auth_user_id) {
            return done(null, false);
          }

          const user = {
            i_user: session_data.i_user,
            name: session_data.fullname.split(' "')[0],
            surname: session_data.fullname.split(' "')[1],
            username: session_data.username,
            email: session_data.email,
            // convert to database name
            dname: dname,
            tenant: session_data.tenant,
            extension: session_data.extension,
            extension_pass: session_data.extension_pass,
          };
          return done(null, user);
          // add usefull params
        });

      })
    }),
  ));
  passport.use('local', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true,
  },
  ((req, username, password, done) => {
    const {
      dname,
    } = req.body;
    const tenant = req.body.tenant === null ? 'public' : req.body.tenant;
    console.log('tenant', tenant, 'username', username, 'password', password);
    const h = new hashers.PBKDF2PasswordHasher();
    if (lodash.has(db, dname)) {
      db[dname].User.schema(tenant).findOne({
        where: {
          username,
        },
      }).then((user) => {
        if (!user) {
          return done(null, false);
        }
        // const hashName = hashers.identifyHasher(user.password);
        // const hashAlgorithm = hashers.getHasher(hashName);
        h.verify(password, user.password).then((verified) => {
          debug('verified', user.password, password, verified);
          if (!verified) {
            return done(null, false);
          }
          const userLodash = lodash.pick(user.toJSON(), ['i_user', 'name', 'surname', 'username', 'email', 'is_active']);
          // add usefull params
          userLodash.dname = dname;
          userLodash.tenant = tenant;
          return done(null, userLodash);
        });
      });
    } else {
      return done(null, false);
    }
  })));


  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });
};
