const router = require('express').Router();

module.exports = (Controller) => {
  router.get('/', (req, res) => Controller.getAll(req, res));

  return router;
}
