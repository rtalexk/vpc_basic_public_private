exports.normalizePort = function normalizePort(val) {
  let port = parseInt(val, 10);

  if (isNaN(port)) return val;
  if (port > 0) return port;
  return false;
}

exports.handlePromise = (promise) => promise.then(rs => [rs]).catch(er => [, er]);

exports.handleResponse = (prop, res, error, payload) => {
  if (error) {
    return res
      .status(400)
      .json({ error: error.toString() });
  }

  if (!payload || (Array.isArray(payload) && payload.length === 0)) {
    return res
      .status(404)
      .json({ [prop]: payload, msg: `${prop} not found` });
  }

  return res.json({ [prop]: payload });
}
