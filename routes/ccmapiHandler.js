var express = require('express');
var superagent = require("superagent");
var config = require('../config');

var router = express.Router();

router.post('/', (req, res) => {
    if(req.session.token || req.fields.api_name == "device.bind"){ // TODO: seperate rc/bind to another path, because device bind does not require authorizaton
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
    }else{
        res.status(400).send("To gain IoTtalk service permission, please log in.");
    }
});

module.exports = router;
