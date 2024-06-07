const express = require('express');
const router = express.Router();

const homeController = require('../controllers/home_controller');
const usersController = require('../controllers/chats_controller');


router.get('/', homeController.home);
router.use('/users',require('./users'));
router.use('/posts',require('./posts'));
router.use('/comments',require('./comments'));
router.use('/likes', require('./likes'));
router.use('/chatroute', require('./chatroute'));

router.use('/api', require('./api'));
module.exports = router;