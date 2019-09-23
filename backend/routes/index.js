module.exports = (app) => {
  const { UserModel } = require('../models');
  const UserCtrl = require('../controllers').UserCtrl(UserModel);
  const usersRoute = require('./users.route')(UserCtrl);
  app.use('/users', usersRoute);

  const healthRoute = require('./health.route')();
  app.use('/health', healthRoute);
}
