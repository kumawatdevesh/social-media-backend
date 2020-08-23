const User = require('../models/users');
const uuid = require('uuid/v1');
const bcrypt = require('bcrypt');

exports.getUserDetails = (req, res, next) => {
    const id = req.params.uid;
    
    User.findById(id)
    .populate('posts')
    .then(result => {
        res.json({user: result});
    })
    .catch(err => {
        console.log('this is a big error', err);
    });
};  

exports.postLogin = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    let user = await User.findOne({email: email});
    if(!user) {
        res.json({err: 'user not found'});
    }
    bcrypt.compare(password, user.password)
    .then(result => {
        if(result) {
            req.session.userToken = uuid(); 
            res.json({user: user, userToken: req.session.userToken});
        }else {
            res.json({err: 'password is not correct'});
        }
    })
    .catch(err => {
        console.log(err);
    });
};

exports.postSignUp = (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const image = req.file;
    const url = image.path;
    let user;
    console.log(url);
    bcrypt.hash(password, 12)
    .then(hashedPassword => {
        user = new User({
            name: name,
            image: url,
            email: email,
            password: hashedPassword,
            posts: []
        });
    })
    .then(result => {
        return user.save();
    })
    .then(result => {
        console.log(result);
        req.session.userToken = uuid();
        req.session.userId = result._id;
        res.json({userId: req.session.userId, userToken: req.session.userToken});
    })
    .catch(err => {
        console.log(err);
    });
};  

exports.Logout = (req, res, next) => {
    req.session.destroy(() => {
        res.json({msg: 'logged out'});
    });
};

exports.followRequest = (req, res, next) => {
    const userId = req.body.userId;
    const profileId = req.params.id;

    User.updateOne({_id: profileId}, {$push: {following: userId}})
    .then(result => {
        console.log(result);
        res.json({data: result});
    })
    .catch(err => {
        console.log(err);
    });
};

exports.updateProfile = async (req, res, next) => {
    const userId = req.params.id;

    const name = req.body.name;
    const email = req.body.email;
    const file = req.file.path;

    const user = await User.findOne({_id: userId});
    console.log(user);
    if(!user) {
        throw new Error('no user found');
    }

    try {
        user.name = name;
        user.email = email;
        user.image = file;
        return user.save();
    } catch(err) {
        console.log(err);
    }
};