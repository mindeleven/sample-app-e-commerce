const express = require('express');
const { check, validationResult } = require('express-validator');

const userRepo = require('../../repositories/users');
const signupTemplate = require('../../views/admin/auth/signup');
const signinTemplate = require('../../views/admin/auth/signin');

const router = express.Router();

router.get('/signup', (req, res) => {
  res.send(signupTemplate({ req }));
});

router.post('/signup', [
  check('email').trim().normalizeEmail().isEmail(),
  check('password').trim().isLength({ min: 4, max: 20 }),
  check('passwordConfirmation').trim().isLength({ min: 4, max: 20 })
], async (req, res) => {
  const errors = validationResult(req);
  console.log(errors);
  
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

router.get('/signout', async (req, res) => {
  req.session = null;
  res.send('You are logged out');
});

router.get('/signin', (req, res) => {
  res.send(signinTemplate());
});

router.post('/signin', async (req, res) => {
  const { email, password} = req.body;

  const user = await userRepo.getOneBy({ email });

  if (!user) {
    return res.send('Email not found');
  }

  const validPassword  = await userRepo.comparePasswords(
    user.password,
    password
  );

  if (!validPassword) {
    return res.send('Invalid password');
  }

  req.session.userId = user.id;

  res.send('You are signed in !!!');
});

module.exports = router;
