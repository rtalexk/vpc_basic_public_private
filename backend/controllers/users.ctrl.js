const { handlePromise: hp, handleResponse } = require('../utils');

module.exports = (UserModel) => ({
  getAll: async (req, res) => {
    const [users, err] = await hp(UserModel.getAll());
    return handleResponse('users', res, err, users);
  }
});
