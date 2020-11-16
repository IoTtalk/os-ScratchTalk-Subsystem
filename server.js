var express = require('express');
var path = require('path');
var superagent = require("superagent");
var formidable = require('express-formidable');
var cors = require('cors');

var Config = require('./config');
var app = express();

app.use(express.static('.'));
app.use(formidable());
app.use(cors());

app.get('/rc/:device', (req, res) => {
  res.sendFile(path.join(__dirname + '/rc/' + req.params.device + '.html'));
});

app.post('/ccmapi', (req, res) => {
    superagent.post(Config.AutoGen_URL)
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
