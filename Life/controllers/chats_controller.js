const bcrypt = require('bcrypt');
const User = require('../models/user');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const secretKey = 'anythingForNow';
const pimgsDir = path.join(__dirname, '..', 'uploads/users/pimgs');
const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const Chat = require('../models/chatModel');
const Follow = require('../models/follow');


module.exports.chatLoad = async (req, res) => {
    const userId = req.user.id;
        // Find all users who are following the current user
        const followers = await Follow.find({ followingId: userId }).populate('current_user');

        // Find all users whom the current user is following
        const following = await Follow.find({ current_user: userId }).populate('followingId');
    var users = await User.find({ _id: { $nin: [req.session.user]} });
    return res.render('chat', { ajay: req.session.user, users : users, followers:followers,following:following});
}



module.exports.saveChat = async(req, res) =>{
    try {
        var chat = new Chat({
            sender_id : req.body.sender_id,
            receiver_id : req.body.receiver_id,
            message : req.body.message,
        });  
        console.log(sender_id);

        var newChat= await chat.save();
        res.status(200).send({ success: true, msg: 'chat inserted', data: newChat});
        
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message});
    }
}