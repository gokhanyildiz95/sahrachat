import express from 'express';
// import lodash from 'lodash';
import passport from 'passport';

const router = express.Router();
router.get('/me', async (req, res) => {
  return res.send({ you: req.user, dname: req.dname });
});

router.get('/test', async (req, res) => {
  return res.send('member test');
});

router.post('/login', (req, res, next) => {
  passport.authenticate(['custom', 'local'], (err, user /* info */) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(401).send({ error: 'unauthorized' }).end();
    }

    return req.logIn(user, (loginError) => {
      if (loginError) {
        return next(loginError);
      }

      return res.status(200).send(user).end();
    });
  })(req, res, next);
});


router.get('/logout', (req, res) => {
  req.logout();
  res.status('200').send({ success: true });
});


export const memberRouter = router;
