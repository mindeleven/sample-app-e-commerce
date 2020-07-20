const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const userRepo = require('./repositories/users');

const app = express();

app.use(bodyParser.urlencoded({ extended: 'true' }));

app.use(cookieSession({
  keys: ['SFosFt6DakMksn3ng3II']
}));

app.get('/signup', (req, res) => {
  res.send(`
    <div>
    Your id is: ${req.session.userId}
      <form method="POST">
        <input name="email" placeholder="email">
        <input name="password" placeholder="password">
        <input name="passwordConfirmation" placeholder="password confirmation">
        <button>Sign Up</button>
      </form>
    </div>
  `);
});

app.post('/signup', async (req, res) => {
  const { email, password, passwordConfirmation } = req.body;

  const existingUser = await userRepo.getOneBy({ email });
  if (existingUser) {
    return res.send('Email in use');
  }

  if (password !== passwordConfirmation) {
    return res.send('Passwords must match')
  }

  // create a user in our user repo
  const user = await userRepo.create({ email, password });

  // store the id of the user inside the user's cookie
  req.session.userId = user.id;

  //console.log(req.body);
  res.send('Account created!!!');
});

app.get('/signout', async (req, res) => {
  req.session = null;
  res.send('You are logged out');
});

app.get('/signin', (req, res) => {
  res.send(`
    <div>
      <form method="POST">
        <input name="email" placeholder="email">
        <input name="password" placeholder="password">
        <button>Sign In</button>
      </form>
    </div>
  `);
});

app.post('/signin', async (req, res) => {
  const { email, password} = req.body;

  const user = await userRepo.getOneBy({ email });

  if (!user) {
    return res.send('Email not found');
  }

  if (user.password !== password) {
    return res.send('Invalid password');
  }

  req.session.userId = user.id;

  res.send('You are signed in !!!');
});

app.listen(3000, () => {
  console.log('listening to port 3000...');
});
