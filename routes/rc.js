var express = require('express');
var logger = require('../utils/logger')("rc");
var router = express.Router();

router.get('/:device', (req, res) => {
    logger.info("Start %s", req.params.device)
    res.sendFile(process.cwd() + '/rc/' + req.params.device + '.html');
});

module.exports = router;
