const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

router.get('/userdetails/:uid', authController.getUserDetails);

router.post('/login', authController.postLogin);

router.post('/signup', authController.postSignUp);

router.post('/follow/:id', authController.followRequest);

router.put('/update-profile/:id', authController.updateProfile);

module.exports = router;