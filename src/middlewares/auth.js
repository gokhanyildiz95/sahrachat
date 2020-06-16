const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).send({ error: 'middleware unauthorized' }).end();
  }
};

export default isAuthenticated;
