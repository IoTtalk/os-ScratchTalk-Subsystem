var express = require('express');
var superagent = require("superagent");
var config = require('../config');

var router = express.Router();

router.post('/', (req, res) => {
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
});

module.exports = router;
