const express = require('express');

const router = express.Router();
const postController = require('../controllers/posts');

router.get('/post', postController.getPosts);

router.get('/users/:id', postController.getUsers);

router.post('/post-comment/:id', postController.postComment);

router.get('/post/:id', postController.getPostById);

router.get('/comments/:id', postController.Comments);

router.get('/get-request/:id', postController.getRequest);

router.delete('/delete/:id', postController.deletePost);

router.post('/request/:id', postController.sendFriendRequest);

router.get('/recieve-request/:id', postController.recieveRequest);

router.post('/accept-request/:id', postController.acceptRequest);

router.patch('/dec-likes/:id', postController.decLikeHandler);

router.patch('/inc-likes/:id', postController.incLikeHandler);

router.post('/post', postController.postPosts);

module.exports = router;