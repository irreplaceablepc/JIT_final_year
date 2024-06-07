const express = require('express');
const router = express.Router();
const passport = require('passport');
const chatsController = require('../controllers/chats_controller');



router.get('/chat', chatsController.chatLoad);
// router.post('/save-chat', chatsController.saveChat);



module.exports = router;