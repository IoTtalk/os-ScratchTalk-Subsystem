var express = require('express');
var router = express.Router();

router.get('/:device', (req, res) => {
    res.sendFile(process.cwd() + '/rc/' + req.params.device + '.html');
});

module.exports = router;
