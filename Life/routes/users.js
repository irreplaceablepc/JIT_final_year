const express = require('express');
const router = express.Router();
const passport = require('passport');
const usersController = require('../controllers/users_controller');
const chatsController = require('../controllers/chats_controller');

// Middleware to check authentication
const authenticateUser = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next(); // User is authenticated, proceed to the next middleware or route handler
  } else {
    return res.redirect('/users/sign-in'); // User is not authenticated, redirect to the login page
  }
};

router.get('/sign-in', usersController.signIn);


// Routes with authentication middleware
router.get('/profile/:id', authenticateUser, usersController.profile);
router.post('/update/:id', authenticateUser, usersController.update);
router.get('/settings/:id', authenticateUser, usersController.settings);
router.post('/password/:id', authenticateUser, usersController.password);

router.post('/create', usersController.create);

// Use passport as a middleware to authenticate
router.post('/create-session', passport.authenticate(
  'local',  // Our strategy
  { failureRedirect: '/users/sign-in' }
), usersController.createSession);

router.get('/sign-out', usersController.destroySession);

// Google authentication routes
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/users/sign-in' }), usersController.createSession);

router.get('/search', usersController.search);
router.post('/save-chat', usersController.saveChat);
router.post('/follow', usersController.follow);


module.exports = router;
