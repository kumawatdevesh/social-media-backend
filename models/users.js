const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userModel = Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    posts: [{type: mongoose.Types.ObjectId, required: true, ref: 'Post'}],
    friends: [{
        sender: {type: mongoose.Types.ObjectId, required: true, ref: 'User'},
        rec: {type: mongoose.Types.ObjectId, required: true, ref: 'User'}
    }],
    following: [{type: mongoose.Types.ObjectId, required: true, ref: 'Post'}],
    sentRequest: [{
        sender: {type: mongoose.Types.ObjectId, required: true, ref: 'User'},
        rec: {type: mongoose.Types.ObjectId, required: true, ref: 'User'}
    }],
    channels: [{type: mongoose.Types.ObjectId, required: true, ref: 'Channel'}]
});

const model = mongoose.model('User', userModel);

module.exports = model;