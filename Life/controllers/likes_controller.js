const mongoose = require('mongoose');
const Like = require('../models/like');
const Comment = require('../models/comment');
const Post = require('../models/post');

module.exports.toggleLike = async (req, res)=>{
    try{
        let likeable;
        let deleted = false;
        if(req.query.type == 'Post'){
            likeable = await Post.findById(req.query.id).populate('likes');
        } else {
            likeable = await Comment.findById(req.query.id).populate('likes');
        }
        // //check if like already exists
        let existingLike = await Like.findOne({
            likeable: req.query.id,
            onModel: req.query.type,
            user: req.user._id
        });
        if(existingLike){
            likeable.likes.pull(existingLike._id);
            likeable.save();
            // Use deleteOne method to delete the document
            await Like.deleteOne({ _id: existingLike._id });
            deleted = true;
            // Set a flash message to indicate that the comment was unliked
            req.flash('success', 'Comment unliked');
        } else {
            let newLike = await Like.create({
                user: req.user._id,
                likeable: req.query.id,
                onModel: req.query.type
            });

            likeable.likes.push(newLike);
            likeable.save();
            // Set a flash message to indicate that the comment was liked
            req.flash('success', 'Comment liked');
        }
        res.redirect('back');
    } catch(err) {
        console.log(err);
        return res.json(500, {
            message: 'Internal server error'
        })
    }
}

