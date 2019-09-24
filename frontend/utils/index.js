exports.handlePromise = (promise) => promise.then(rs => [rs]).catch(er => [, er]);
