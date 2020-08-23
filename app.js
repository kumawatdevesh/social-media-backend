const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const uuid = require('uuid/v1');
const path = require('path');
const session = require('express-session');
const MongoDBSession = require('connect-mongodb-session')(session);
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/post');
const channelRoutes = require('./routes/channel');


const store = new MongoDBSession({
    uri: 'mongodb+srv://kumawatdevesn99:kumawatdevesn99@cluster0-tpp9z.mongodb.net/social-media?retryWrites=true&w=majority',
    collections: 'session'
});

app.use(session({
    secret: 'secret_key', resave: false, saveUninitialized: false, store: store
}));

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, uuid() + '.' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);        
    } else {
        cb(null, false);
    }
};

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(cors());
app.options('*', cors());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,X-Access-Token,XKey,Authorization');
    next();
});

app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/channels', channelRoutes);

mongoose.connect('mongodb+srv://kumawatdevesn99:kumawatdevesn99@cluster0-tpp9z.mongodb.net/social-media?retryWrites=true&w=majority')
.then(res => {

    let server = app.listen(process.env.PORT || 5000);
    const io = require('./socket').init(server);
    io.on('connection', socket => {
        console.log('socket connected');
    })
})
.catch(err => {
    console.log('not connected');
});