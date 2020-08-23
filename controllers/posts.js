const Post = require('../models/posts');
const User = require('../models/users');
const Channel = require('../models/channel');
const mongoose = require('mongoose');
const io = require('../socket');

exports.getPosts = async (req, res, next) => {
    try {
        Post.find()
        .populate('creator.userId')
        .then(result => {
            return res.json({posts: result});
        })  
        .catch(err => {
            console.log(err);
        });
    }catch(err) {
        throw new Error('error while fetching posts');
    } 
};

exports.getPostById = async (req, res, next) => {
    const id = req.params.id;
    try {
        const post = await Post.findById(id);
        console.log('by id', post);
        if(post) {
            res.json({post: post});
        }
    } catch(err) {
        res.json({err: err});
    }
};

exports.postPosts = async (req, res, next) => {
    const image = req.file;
    const caption = req.body.caption;
    const creator = req.body.creator;
    const url = image.path;
    console.log(url);
    const post = new Post({
        image: url,
        caption: caption,
        creator: [{userId: creator, liked: false}],
        friends: [],
        comm: [{userId: creator}],
        likes: [],
        likesCount: 0
    });

    let user;
    try {    
        user = await User.findById({_id: creator});
    }catch(err) {
        throw new Error('user not found');
    }
    if(!user) {
        throw new Error('user not found');
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await post.save({session: sess});
        user.posts.push(post);
        await user.save({session: sess});
        await sess.commitTransaction();
        res.json({msg: post});
    }catch(err) {
        throw new Error(err);
    } 
};

exports.deletePost = async (req, res, next) => {
    const id = req.params.id;
    const userId = req.body.userId;

    const post = await Post.findById(id);
    const user = await User.findById(userId);

    if(!post) {
        throw new Error('no post found while deleting post');
    }
    try {
        const session = await mongoose.startSession();
        session.startTransaction();
        await post.remove({session: session});
        user.posts.pull(post);
        await user.save({session: session});
        await session.commitTransaction();
        res.json({msg: 'post deleted'});
    } catch(err) {
        throw new Error(err);
    }
};

exports.getUsers = async (req, res, next) => {

    const id = req.params.id;
    let users;
    users = await User.find({_id: {$ne: id}});
    if(!users) {
        throw new Error('users not found');
    }else {
        res.json({users: users});
    }
};  

exports.sendFriendRequest = (req, res, next) => {
    const rec = req.body.to;
    const sender = req.params.id;
    
    User.updateMany({_id: {$in: [rec, sender]}, 'sentRequest.sender': {$ne: sender}, 'sentRequest.rec': {$ne: rec}}, 
    {$push: {sentRequest: {sender: sender, rec: rec}}})
    .then(result => {
        res.json({msg: 'request sent'});
    })
    .catch(err => {
        console.log(err);
    })
};

exports.getRequest = (req, res, next) => {
    const userId = req.params.id;

    User.find({_id: userId, 'sentRequest.sender': {$eq: userId}})
    .populate('sentRequest.rec')
    .then(result => {
        const users = result.map(i => {
            return {user: i.sentRequest}
        })
        res.json({users: users});
    })
    .catch(err => {
        console.log(err);
    });
};

exports.recieveRequest = (req, res, next) => {
    const userId = req.params.id;

    User.find({_id: userId, 'sentRequest.rec': {$eq: userId}})
    .populate('sentRequest.sender')
    .then(result => {
        const users = result.map(i => {
            return {user: i.sentRequest}
        })
        res.json({users: users});
    })
    .catch(err => {
        console.log(err);
    });
};

exports.acceptRequest = (req, res, next) => {
    const rec = req.params.id;
    const sender = req.body.userId;

    User.updateMany({_id: {$in: [rec, sender]}, 'sentRequest.sender': {$ne: rec}, 'sentRequest.rec': {$ne: sender}}, 
    {$pull: {sentRequest: {sender: sender, rec: rec}} , $push: {friends: {sender: sender, rec: rec}}})
    .then(result => {
        res.json({msg: 'friends'});
    })
    .catch(err => {
        console.log(err);
    }); 
};

exports.postComment = (req, res, next) => {
    const postId = req.params.id;
    const comm = req.body.comment;
    const userId = req.body.userId;

    Post.updateOne({_id: postId}, {$push: {comment: {userId: userId, comment: comm}}})
    .then(result => {
        res.json({msg: 'succesful'});
    })
    .catch(err => {
        console.log(err);
    });
};

exports.Comments = (req, res, next) => {
    const postId = req.params.id;

    Post.findById({_id: postId})
    .populate('comment.userId')
    .exec()
    .then(result => {
        const sendResult = result.comment.map(i => {
            return {name: i.userId.name, comment: i.comment}
        });
        res.json({comm: sendResult, likes: result.likesCount});
    })  
    .catch(err => {
        console.log(err);
    });
};


exports.decLikeHandler = (req, res, next) => {
    const id = req.params.id;
    const userId = req.body.userId;

    Post.updateOne({_id: id}, 
    {$set: {'creator.0.liked': false}, $inc: {likesCount: -1}, $pull: {likes: {userId: userId}}})
    .then(result => {
        res.json({msg: 'successful'});
    })
    .catch(err => {
        console.log(err);
    });
};

exports.incLikeHandler = (req, res, next) => {
    const id = req.params.id;
    const userId = req.body.userId;

    Post.updateOne({_id: id},
        {$set: {'creator.0.liked': true}, $inc: {likesCount: 1}, $push: {likes: {userId: userId}}})
        .then(result => {
            io.getIO().emit('liked', {msg: 'picture liked'});
        })
        .catch(err => {
            console.log('incliked', err);
        });
};

