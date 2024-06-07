const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
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

module.exports.signIn = (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('http://localhost:3000/');
    }
    return res.render('user_sign_in');
};


module.exports.profile = async (req, res) => {
    try {
        const userId = req.user.id;
        // Find all users who are following the current user
        const followers = await Follow.find({ followingId: userId }).populate('current_user');

        // Find all users whom the current user is following
        const following = await Follow.find({ current_user: userId }).populate('followingId');
        const user = await User.findById(req.params.id);
        const postCount = await Post.countDocuments({ user: user.id });
        const userPosts = await Post.find({ user: req.params.id });
        return res.render('profile', { profile_user: user, postCount: postCount, userPosts: userPosts, followers:followers,following:following});
    } catch (err) {
        req.flash('error', 'User not found');
        return res.redirect('/');
    }
};

module.exports.settings = async (req, res) => {
    const userId = req.user.id;
        // Find all users who are following the current user
        const followers = await Follow.find({ followingId: userId }).populate('current_user');

        // Find all users whom the current user is following
        const following = await Follow.find({ current_user: userId }).populate('followingId');
    return res.render('settings', { followers:followers,following:following});
}


module.exports.update = async (req, res) => {
    try {
        if (req.user.id !== req.params.id) {
            throw new Error('Unauthorized!');
        }

        const user = await User.findById(req.params.id);

        User.uploadedAvatar(req, res, async (err) => {
            if (err) {
                console.error(err);
                req.flash('error', 'An error occurred during file upload.');
                return res.redirect('back');
            }
            user.name = req.body.name;
            user.email = req.body.email;
            user.bio = req.body.bio;

            if (req.file) {
                if (user.avatar) {
                    try {
                        await fs.promises.unlink(path.join(__dirname, '..', user.avatar));
                    } catch (err) {
                        console.error('Error deleting previous avatar:', err);
                    }
                }
                user.avatar = User.avatarPath + '/' + req.file.filename;
            }

            try {
                await user.save();
                req.flash('success', 'Profile updated successfully.');
                return res.redirect('back');
            } catch (err) {
                console.error('Error saving user:', err);
                req.flash('error', 'An error occurred during user save.');
                return res.redirect('back');
            }
        });
    } catch (err) {
        req.flash('error', err.message || 'An error occurred during update.');
        return res.redirect('back');
    }
};

module.exports.password = async (req, res) => {
    const { password} = req.body;
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds); 
        const user = await User.findById(req.user._id);
        user.password = hashedPassword;
        await user.save();
        req.flash('success', 'Password Changed.');
        return res.redirect('back');
    } catch (error) {
        console.error('Error password change:', error);
        req.flash('error', 'An error occurred while creating the account.');
        return res.redirect('back');
    }
}


module.exports.create = async (req, res) => {
    const data = {
        email: req.body.email,
        phone: req.body.phone,
        name: req.body.name,
        username: req.body.username,
        password: req.body.password,
    };
    const { password, confirm_password } = req.body;
  
    // Check if passwords match
    if (password !== confirm_password) {
        req.flash('error', 'Passwords not confirm.');
        return res.redirect('back');
    }


    // Check if email exists
    let existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
        req.flash('error', 'Email already exists.');
        return res.redirect('back');
    }
  
    // Check if phone exists
    existingUser = await User.findOne({ phone: data.phone });
    if (existingUser) {
        req.flash('error', 'Phone number already exists.');
        return res.redirect('back');
    }
  
    // Check if username exists
    existingUser = await User.findOne({ username: data.username });
    if (existingUser) {
        req.flash('error', 'Username already exists.');
        return res.redirect('back');
    }
    
    // If none of the fields exist, proceed with user creation
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);
        data.password = hashedPassword;
  
        await User.create(data);
        req.flash('success', 'Account created successfully.');
        return res.redirect('/users/sign-in');
    } catch (error) {
        console.error('Error creating user:', error);
        req.flash('error', 'An error occurred while creating the account.');
        return res.redirect('back');
    }
};



//sign in and create session for user
module.exports.createSession = (req,res)=>{
    //sesssion is created by passport all we need to do is redirect to the home page
    req.flash('success','Logged in successfully');
    return res.redirect('/');
}

module.exports.destroySession = (req, res) => {
    req.logout((err) => {
        if (err) {
            console.log('Error in destroying session:', err);
            return;
        }
        req.flash('success', 'You have logged out successfully!');
        return res.redirect('/');
    });
};

module.exports.search = async (req, res) => {
    try {
        const query = req.query.query;

        const users = await User.find({ 
            $or: [
                { name: { $regex: new RegExp(query, 'i') } },
                { email: { $regex: new RegExp(query, 'i') } },
                // Add other fields you want to search by
            ]
        });

        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports.saveChat = async(req, res) =>{
    try {
        var chat = new Chat({
            sender_id : req.body.sender_id,
            receiver_id : req.body.receiver_id,
            message : req.body.message,
        });
        

        var newChat= await chat.save();
        res.status(200).send({ success: true, msg: 'chat inserted', data: newChat});
        
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message});
    }
}

exports.follow = async (req, res) => {
    try {
        const { current_user, followingId } = req.body;
        
        console.log('current_user:', current_user); // Log followerId
        console.log('followingId:', followingId);

        // Check if followerId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(current_user)) {
            return res.status(400).send('Invalid current_user');
        }

        // Convert followerId to ObjectId (ensure you're using the new keyword)
        const followerObjectId = new mongoose.Types.ObjectId(current_user);


        // Check if the follow relationship already exists
        let existingFollow = await Follow.findOne({ current_user: followerObjectId, followingId });
        let totalFollowing = await Follow.countDocuments({ current_user: followerObjectId });
        let totalFollowers = await Follow.countDocuments({ followingId });

        // If the follow relationship already exists, remove it (unfollow)
        if (existingFollow) {
            await Follow.deleteOne({ _id: existingFollow._id });
            console.log(`User ${current_user} unfollowed user ${followingId}`);
            totalFollowing--;
            totalFollowers--;
            req.flash('error','Unfollowed');
        } else {
            // If the follow relationship doesn't exist, create it (follow)
            await Follow.create({ current_user: followerObjectId, followingId });
            console.log(`User ${current_user} followed user ${followingId}`);
            totalFollowing++;
            totalFollowers++; // Increment totalFollowers when a user follows another user
            req.flash('success','Followed');
        }

        // Update the totalFollowing count in the User model
        await User.findByIdAndUpdate(current_user, { totalFollowing });

        // Update the totalFollowers count in the User model of the user being followed
        await User.findByIdAndUpdate(followingId, { totalFollowers });

        console.log('Updated totalFollowing:', totalFollowing);
        console.log('Updated totalFollowers:', totalFollowers);
        res.redirect('/');
        
    } catch (err) {
        console.error('Error following/unfollowing user:', err);
        res.status(500).send('Internal Server Error');
    }
};
