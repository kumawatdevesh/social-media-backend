const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const postModel = Schema({
    image: {
        type: String,
        required: true
    },
    caption: {
        type: String,
        required: true
    },
    creator: [
        {
            userId: {type: mongoose.Types.ObjectId, required: true, ref: 'User'},
            liked: {type: Boolean, required: true}
        }
    ],
    comment: [
        {
            userId: {type: mongoose.Types.ObjectId, required: true, ref: 'User'},
            comment: {type: String, required: true}
        }
    ],
    likes: [
        {
            userId: {type: mongoose.Types.ObjectId, required: true, ref: 'User', default: null}
        }
    ],
    likesCount: {type: Number, required: true}
}); 

const model = mongoose.model('Post', postModel);

module.exports = model;