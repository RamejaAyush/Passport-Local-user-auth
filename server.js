const path = require('path');
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const LocalStrategy = require('passport-local').Strategy;

const PORT = 8080;
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const verify = (username, password, done) => {
  console.log('Inside Verify');
  if (username === 'ayushrameja@gmail.com' && password === 'test') {
    console.log(`success, Got the user ${username}`);
    done(null, username);
  } else {
    console.error(`error, Combination doesn't match.`);
    done(null, false);
  }
};

passport.use(
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password', session: false },
    verify
  )
);

// Serialize: Save the session to the user to the cookie
passport.serializeUser((user, done) => {
  console.log(`Current User ${user}`);
  done(null, user);
});

// Deserial: Loading it from the cookie
passport.deserializeUser((id, done) => {
  done(null, id);
});

app.use(
  cookieSession({
    name: 'session',
    maxAge: 24 * 60 * 60 * 1000,
    keys: ['secret'],
  })
);

app.use(passport.initialize());
// Authenicates the session that being sent to the server, using keys
app.use(passport.session());

const checkloggedIn = (req, res, next) => {
  console.log('current user', req.user);
  const isLoggedIn = req.isAuthenticated() && req.user;

  if (!isLoggedIn) {
    return res.status(401).json({
      code: 401,
      message: `You must login!`,
    });
  }

  next();
};

const checkUser = (req, res, next) => {
  const isLoggedIn = req.isAuthenticated() && req.user;

  if (isLoggedIn) {
    return res.redirect('/dashboard');
  }

  next();
};

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', checkUser, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/dashboard', checkloggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/logout', checkloggedIn, (req, res) => {
  req.logout();

  return res.sendFile(path.join(__dirname, 'public', 'logout.html'));
});

app.post(
  '/api/login',
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    session: true,
  })
);

app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);
