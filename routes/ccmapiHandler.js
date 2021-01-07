var express = require('express');
var superagent = require("superagent");
var auth = require("../middleware/authorize")
var config = require('../config');

var router = express.Router();

router.post('/', auth(), (req, res) => {
    if(req.session.token){
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

// for unauthorized device binding only (such as smartphone)
router.post('/bind', (req, res) => {
    if(req.fields.api_name == "device.bind" || req.fields.api_name == "device.unbind"){
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
        res.status(400).send("Device Binding Error");
    }
});

module.exports = router;
