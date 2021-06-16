var express = require('express');
var superagent = require("superagent");
var auth = require("../middleware/authorize")
var config = require('../config');
var logger = require('../utils/logger')("CCMAPI");

var router = express.Router();

router.post('/', auth(), (req, res) => {
    superagent.post(config.autogenURL)
        .type('form')
        .send(req.fields)
        .end((err, response) => {
            if (err) {
                logger.error("Error: %s", err);
                res.send(response.text);
            }else{
                logger.info("API: [%s] success. Response: %s", req.fields.api_name, response.text);
                res.send(response.text);
            }
        });
});

// for unauthorized device binding only (such as smartphone)
router.post('/bind', (req, res) => {
    if(req.fields.api_name == "device.bind" || req.fields.api_name == "device.unbind"){
        superagent.post(config.AutogenURL)
            .type('form')
            .send(req.fields)
            .end((err, response) => {
                if (err) {
                    logger.error("Error: %s", err);
                    res.send(response.text);
                }else{
                    logger.info("API: [%s] success. Response: %s", req.fields.api_name, response.text);
                    res.send(response.text);
                }
            });
    }else{
        res.status(400).send("[Error] "+req.fields.api_name);
    }
});

module.exports = router;
