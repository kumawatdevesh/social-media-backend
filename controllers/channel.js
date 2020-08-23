const Channel = require('../models/channel');
const User = require('../models/users');
const {ObjectId} = require('mongodb');
const mongoose = require('mongoose');

exports.getChannels = async (req, res, next) => {
    try {
        const channels = await Channel.find();
        if(channels) {
            res.json({channels: channels});
        }
    }catch(err) {
        throw new Error(err);
    }
};

exports.getChannelById = (req, res, next) => {
    const cid = req.params.id;

    Channel.findOne({_id: cid})
    .then(result => {
        res.json({channel: result})
    })
    .catch(err => {
        console.log(err);
    });
};

exports.addChannel = async (req, res, next) => {
    const cat = req.body.cat;
    const name = req.body.name;
    const creator = req.params.creator;
    console.log(cat, name, creator);
    
    const user = await User.findOne({_id: creator});
    if(!user) {
        throw new Error('user not found');
    }
    try {
        const channel = new Channel({
            name: name,
            category: cat,
            creator: creator,
            subscribers: [],
            'content.question': [],
            answer: []
        });
        
        const sess = await mongoose.startSession();
        await channel.save({session: sess})
        sess.startTransaction();
        user.channels.push(channel);
        await user.save({session: sess});
        await sess.commitTransaction();
        res.json({msg: 'channel created'});
    } catch(err) {
        console.log(err);
    }
};  

exports.postQuestion = (req, res, next) => {
    const id = req.params.qid;
    const ques = req.body.question;
    const userId = req.body.userId;

    Channel.updateOne({_id: id}, {$push: {content: {question: {title: ques, userId: userId}}}})
    .then(result => {
        res.json({msg: 'posted question'});
    })
    .catch(err => {
        console.log(err);
    });
};

exports.postAnswers = (req, res, next) => {
    const channelId = req.params.qid;
    const ans = req.body.answer;
    const userId = req.body.userId;

    const quesId = req.body.quesId;

    Channel.updateOne({_id: channelId}, {$push: {answer: {answer: ans, qid: quesId, userId: userId}}})
    .then(result => {
        res.json({msg: 'posted answer'});
    })
    .catch(err => {
        console.log(err);
    });
};

exports.questionAndAnswer = (req, res, next) => {
    const qid = req.params.qid;

    Channel.find({})
    .then(result => {
        res.json({question: result})
    })
    .catch(err => {
        console.log(err);
    });
};

exports.answers = (req, res, next) => {
    const id = req.params.id;
    
    Channel.aggregate([
        {$project: 
            {
                _id: 0,
                answers: {$filter: {input: "$answer", as: "ans", cond: {$eq: ["$$ans.qid", ObjectId(id)]}}}
            }
        },
        { $lookup: {
            "from": "users",
            "localField": "_id",
            "foreignField": "answer.userId",
            "as": "user"
        }}
    ])
    .then(result => { 
        let userAnswers;
        result.map(i => {
            userAnswers = i.answers.map(a => {
                return {answers: a, user: i.user}
            })
        });
        res.json({ans: userAnswers});  
    })
    .catch(err => {
        console.log(err);
    });
};

exports.question = (req, res, next) => {
    const id = req.params.id;

    Channel.findOne({"content.question._id": Object(id)},
    {"content.question.$": true})
    .then(result => {
        let ques;
        ques = result.content.question.map(i => {
            return {title: i.title}
        });
        res.json({question: ques});
    })
    .catch(err => {
        console.log(err);
    });
};

exports.followChannel = (req, res, next) => {
    const userId = req.body.userId;
    const channelId = req.params.id;
    Channel.updateOne({_id: channelId}, {$push: {subscribers: userId}})
    .then(result => {
        console.log(result);
    })
    .catch(err => {
        console.log(err);
    });
};
exports.getFollowers = (req, res, next) => {
    const userId = req.params.id;
    
    Channel.findOne({subscribers: {$eq: userId}})
    .then(result => {
        if(result) {
            res.json({following: true});
        }
    })
    .catch(err => {
        console.log(err);
    });
};