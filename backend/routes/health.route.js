const router = require('express').Router();

module.exports = () => {
  router.get('/', (_, res) => res.send('Healthy'));

  return router;
};
