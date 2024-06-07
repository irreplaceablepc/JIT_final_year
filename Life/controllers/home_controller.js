const Post = require('../models/post');
const User = require('../models/user');
const Follow = require('../models/follow');


module.exports.home = async (req,res)=>{
    // console.log(req.cookies);
    // res.cookie('user_id',25);  //changing the value of cookie in response 
    //any error will go to catch
    try
    {
        //populate is used to exatract whole user not just its id
        //here we are extracting user of the post, comments and their respective users also using populate
        //async-await to get ride of so many callbacks
        //await puts the execution of the next function on hold till this one gets executed
        let posts = await Post.find({})
        .sort('-createdAt')
        .populate('user')
        .populate({
            path: 'comments',
            populate:{
                path: 'user'
            },
            populate: {
                path: 'likes'
            }
        }).populate('likes')

        const userId = req.user ? req.user.id : null;

        // Find all users who are following the current user
        const followers = await Follow.find({ followingId: userId }).populate('current_user');

        // Find all users whom the current user is following
        const following = await Follow.find({ current_user: userId }).populate('followingId');

        //after posts users will get executed
        let users = await User.find({});
        return res.render('home', {
            posts: posts,
            all_users: users,
            current_user: req.user ? req.user.id : null,
            followers,
            following
        });

    }
    catch(err)
    {
        console.log('Error',err);
        return;
    }
    

}

