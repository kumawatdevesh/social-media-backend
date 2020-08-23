const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const friendSchema = new Schema({
    requester: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    reciever: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    status: {
        type: String,
        required: true
    }
});

const model = mongoose.model('Friend', friendSchema);

module.exports = model;