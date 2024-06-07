const express = require('express');
const passport = require('passport');
const router = express.Router();
const postsController = require('../controllers/posts_controller');

// post written create using this form render
router.post('/create',passport.checkAuthentication,postsController.create);
//user should be logged in to delete the post
router.get('/destroy/:id',passport.checkAuthentication,postsController.destroy);


// Middleware to check authentication
const authenticateUser = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next(); // User is authenticated, proceed to the next middleware or route handler
    } else {
      return res.redirect('/users/sign-in'); // User is not authenticated, redirect to the login page
    }
  };

  // post image request page is render
router.post('/pimgs/:id', authenticateUser, postsController.pimgs);


module.exports = router;