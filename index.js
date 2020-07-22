const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const authRouter = require('./routes/admin/auth');

const app = express();

app.use(bodyParser.urlencoded({ extended: 'true' }));

app.use(cookieSession({
  keys: ['SFosFt6DakMksn3ng3II']
}));

app.use(authRouter);

app.listen(3000, () => {
  console.log('listening to port 3000...');
});

model.exports = router;
