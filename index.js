var express = require('express');
var path = require('path');
var formidable = require('express-formidable');
var session = require('express-session');
var cors = require('cors');

var app = express();

app.use('/service/rc', express.static(__dirname + '/rc'));
app.use(express.static('.'));
app.use(formidable());
app.use(cors());

app.use(session({
    secret: 'scratchtalk',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: 'auto',
        httpOnly: true,
        maxAge: 3600000
    }
}));

app.use('/service/rc', require('./routes/rc'));
app.use('/service/ccmapi', require('./routes/ccmapiHandler'));
app.use('/service/account', require('./routes/account'));

app.listen(8999, ()=>{
    console.log("Serving ScratchTalk Subsystem on PORT 8999");
});
