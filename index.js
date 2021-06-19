var express = require('express');
var path = require('path');
var formidable = require('express-formidable');
var session = require('express-session');
var cors = require('cors');
var Sequelize = require('sequelize');
var config = require('./config');
var logger = require('./utils/logger')("Express");

var app = express();


app.use('/service/rc', express.static(__dirname + '/rc'));
app.use(express.static('.'));
app.use(formidable());
app.use(cors());

app.use(session({
    secret: config.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: 'auto',
        httpOnly: true,
        maxAge: 24*60*60*1000 // expires in 1 day
    }
}));

app.use('/service/rc', require('./routes/rc'));
app.use('/service/project', require('./routes/project'));
app.use('/service/auth', require('./routes/auth'));

app.listen(config.serverPort, ()=>{
    logger.info("Serving ScratchTalk Subsystem on PORT %d", config.serverPort);
});
