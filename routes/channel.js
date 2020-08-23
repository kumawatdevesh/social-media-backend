const express = require('express');
const router = express.Router();
const channelController = require('../controllers/channel');

router.get('/channel/:id', channelController.getChannelById);

router.get('/channel', channelController.getChannels);

router.get('/que-ans/:qid', channelController.questionAndAnswer);

router.get('/ans/:id', channelController.answers);

router.get('/ques/:id', channelController.question);

router.post('/channel/:creator', channelController.addChannel);

router.post('/post-question/:qid', channelController.postQuestion);

router.post('/post-answer/:qid', channelController.postAnswers);

router.get('/follow/:id', channelController.getFollowers);

router.post('/follow/:id', channelController.followChannel);

module.exports = router;