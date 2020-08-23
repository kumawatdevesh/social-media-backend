const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const channelSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    creator: {
        type: String,
        required: true
    },
    subscribers: [{type: mongoose.Types.ObjectId, required: true, ref: 'User'}],
    content: {
        question: [{
            title: {type: String, required: true},
            userId: {type: mongoose.Types.ObjectId, required: true, ref: 'User'}
        }]
    },
    answer: [{
        answer: {type: String, required: true},
        qid: {type: mongoose.Types.ObjectId, required: true},
        userId: {type: mongoose.Types.ObjectId, required: true, ref: 'User'}
    }]
});

const model = mongoose.model('Channel', channelSchema);

module.exports = model;