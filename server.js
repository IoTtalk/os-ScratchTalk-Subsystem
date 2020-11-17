var express = require('express');
var path = require('path');
var superagent = require("superagent");
var formidable = require('express-formidable');
var cors = require('cors');

var config = require('./config');
var app = express();

app.use('/service/rc', express.static(__dirname + '/rc'));
app.use(express.static('.'));
app.use(formidable());
app.use(cors());

app.get('/service/rc/:device', (req, res) => {
  res.sendFile(path.join(__dirname + '/rc/' + req.params.device + '.html'));
});

app.post('/service/ccmapi', (req, res) => {
    superagent.post(config.AutogenURL)
        .type('form')
        .send(req.fields)
        .end((err, response) => {
            if (err) {
                console.log(err);
                res.send(response.text);
            }else{
                console.log("["+response.status+"]", req.fields.api_name, response.text);
                res.send(response.text);
            }
        });
})

app.listen(8999, ()=>{
    console.log("Serving ScratchTalk Subsystem on PORT 8999");
});
