const express = require('express');

const { normalizePort } = require('./utils');

const app = express();

const port = normalizePort(process.env.PORT || 4000);

require('./routes')(app);

app.get('*', (_, res) => {
  res.status(400).json({
    error: 'NOT_FOUND'
  });
})

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}/`);
});
