const usersFixtures = require('../fixtures/users.json');

module.exports = {
  getAll: () => Promise.resolve(usersFixtures),
};
