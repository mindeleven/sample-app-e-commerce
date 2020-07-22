const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const userRepo = require('./repositories/users');

const app = express();

app.use(bodyParser.urlencoded({ extended: 'true' }));

app.use(cookieSession({
  keys: ['SFosFt6DakMksn3ng3II']
}));

app.listen(3000, () => {
  console.log('listening to port 3000...');
});

model.exports = router;
