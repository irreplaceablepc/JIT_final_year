const Post = require('../../../models/post');
const Comment = require('../../../models/comment');
const User = require('../../../models/user')
module.exports.index = async (req,res)=>{
    let posts = await Post.find({})
        .sort('-createdAt')
        .populate('user')
        .populate({
            path: 'comments',
            populate:{
                path: 'user'
            }
        });

    return res.json({
        message: "List of posts",
        posts: posts
    });
}

module.exports.destroy = async (req,res)=>{
  
    try{
        let post = await Post.findById(req.params.id);
        if(post.user == req.user.id)
        {
            post.remove();
            //removing comments from db
            await Comment.deleteMany({post: req.params.id});
        
            return res.json(200, {
                message: "Post and associated comments deleted"
            });
        }else{
            return res.json(401, {
                message: "You aren't authorised to delete this post"
            });
        }
        
    }
    catch(err)
    {
        console.log(err);
        return res.json(500, {
            message: "Internal Server Error"
        });
    }
    
}