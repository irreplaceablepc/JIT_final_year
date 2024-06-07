const Post = require('../models/post');
const Comment = require('../models/comment');
const User = require('../models/user');
const Like = require('./../models/like');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const secretKey = 'anythingForNow';
const pimgsDir = path.join(__dirname, '..', 'uploads/users/pimgs');
const express = require('express');
const router = express.Router();
// const Post = require('../models/post');

module.exports.create = async (req,res)=>{
    //create a new post
    try{
        let post = await Post.create({
            content: req.body.content,
            user: req.user._id
        });
        const user = await User.findById(req.user._id);
        const postCount = await Post.countDocuments({ user: req.user._id });
        console.log(postCount);
        user.totalPost = postCount;
        await user.save();
        req.flash('success', 'Post published');
        res.redirect('back');
    }
    catch(err)
    {
        req.flash('error', err);
        res.redirect('back');
    }
    

}

module.exports.destroy = async (req, res) => {
    try {
        let post = await Post.findById(req.params.id);
        if (!post) {
            req.flash('error', 'Post not found');
            return res.redirect('back');
        }

        if (post.user == req.user.id) {
            await Like.deleteMany({ likeable: req.params.id, onModel: 'Post' });
            await Like.deleteMany({ _id: { $in: post.comments } });

            await post.deleteOne(); // Use deleteOne() instead of remove()

            // Removing comments from db
            await Comment.deleteMany({ post: req.params.id });


            const user = await User.findById(req.user._id);
            const postCount = await Post.countDocuments({ user: req.user._id });
            console.log(postCount);
            user.totalPost = postCount;
            await user.save();

            if (req.xhr) {
                return res.status(200).json({
                    data: {
                        post_id: req.params.id
                    },
                    message: 'Post deleted'
                });
            }

            req.flash('success', 'Post deleted');
            return res.redirect('back');
        } else {
            req.flash('error', 'You can not delete this post');
            res.redirect('back');
        }
    } catch (err) {
        req.flash('error', 'An error occurred while deleting the post');
        res.redirect('back');
    }
};



// post images upload
module.exports.pimgs = async (req, res) => {
    // try {
    //     if (req.user.id !== req.params.id) {
    //         throw new Error('Unauthorized!');
    //     }

        const user = await User.findById(req.params.id);

        User.puploadedAvatar(req, res, async (err) => {
            if (err) {
                console.error(err);
                req.flash('error', 'An error occurred during file upload.');
                return res.redirect('back');
            }
            

            if (req.file) {
                // user.pimgs = User.pavatarPath + '/' + req.file.filename;
                // const post = new Post({
                //     fileName: User.pavatarPath + '/' + req.file.filename
                //   });
                //   await Post.save();
                // post image upload using this
                const post = await Post.create({
                    content: req.body.content,
                    pimg: User.pavatarPath + '/' + req.file.filename, //pimg is the place where img is saved(post database)
                    user: req.user._id
                });
                const user = await User.findById(req.user._id);
                 const postCount = await Post.countDocuments({ user: req.user._id });
                console.log(postCount);
                user.totalPost = postCount;
                await user.save();
                
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
    // } catch (err) {
    //     req.flash('error', err.message || 'An error occurred during update.');
    //     return res.redirect('back');
    // }
};