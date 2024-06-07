require('dotenv').config({path:'./vars/.env'});
const express = require('express');
const cookieParser = require('cookie-parser');
const db = require('./config/mongoose');
const User = require('./models/user');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT;
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const MongoStore = require('connect-mongo');
const passportLocal = require('./config/passport-local-strategy');
const passportJwt = require('./config/passport-jwt-strategy');
const passportGoogle = require('./config/passport-google-oauth2-strategy');
const sassMiddleware = require('node-sass-middleware');
const bodyParser = require('body-parser');
const Chat = require('./models/chatModel');


// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: true }));

// Parse JSON bodies (as sent by API clients)
app.use(bodyParser.json());

const flash = require('connect-flash');
const customMiddleware = require('./config/middleware');
const path = require('path');

app.use(sassMiddleware({
    src: './static/scss',
    dest: './static/css',
    debug: true, //display errors if any
    outputStyle: 'extended', //output in multiple lines not in same line
    prefix: '/css'  //where server should look for css files
}));

// app.use(express.urlencoded());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static('./static'));
//make the upload path available to the browser
app.use('/uploads', express.static(__dirname + '/uploads'));

app.use(expressLayouts);
//extract styles and scripts from sub pages in layout
app.set('layout extractStyles', true);
app.set('layout extractScripts', true);


//set up the view engine
app.set('view engine','ejs');
app.set('views','./views');

//mongo store is used to store the session cookie in the db
app.use(session({
    name: 'life',
    secret: process.env.SECRET_KEY,
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 1000 * 60 * 100,
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGOSEDB, // replace with your MongoDB connection string
      autoRemove: 'disabled',
    })
  }));
//telling server to use passport
app.use(passport.initialize());
app.use(passport.session());

app.use(passport.setAuthenticatedUser);

//set up flash after the session cookies as it uses session
app.use(flash());
app.use(customMiddleware.setFlash);
//use express router
app.use('/',require('./routes'));

var usp = io.of('/user-namespace');

usp.on('connection', async function(socket){
    console.log('User Connected');
    var userId = socket.handshake.auth.token;

       await User.findByIdAndUpdate({ _id: userId}, { $set: {is_online: '1'} });

      // user broadcast online status
      socket.broadcast.emit('getOnlineUser', {user_id: userId});

  socket.on('disconnect', async function(){
    console.log('User Disconnected');
    var userId = socket.handshake.auth.token;

        await User.findByIdAndUpdate({ _id: userId}, { $set: {is_online: '0'} });

        // user broadcast online status
        socket.broadcast.emit('getOfflineUser', {user_id: userId});
    });

    // chatting implemention
    socket.on('newChat', function(data){
        socket.broadcast.emit('loadNewChat', data);
    })

    // load old chats
    socket.on('existsChat', async function(data){
      var chats = await  Chat.find({ $or :[
        { sender_id:data.sender_id, receiver_id:data.receiver_id},
        { sender_id:data.receiver_id, receiver_id:data.sender_id},
      ]});

      socket.emit('loadChats', {chats: chats});

    });
});

app.locals.rmWhitespace = true;
http.listen(PORT,(err)=>{
    if(err)
        console.log("Error occured");
    else
        console.log(`Server running on port ${PORT}`);
})