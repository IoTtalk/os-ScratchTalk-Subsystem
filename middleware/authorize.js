var db = require("../db/db");
var logger = require('../utils/logger')("Express");

var authorize = () => {
    return [
        async (req, res, next) => {
            // check if token in session is valid
            var accessTokenRecord = await db.AccessToken.findOne({ where: { id: req.session.accessTokenId } });
            if (!accessTokenRecord){
                logger.warn("Unauthorized Access");
                return res.status(401).json({ message: 'Unauthorized' });
            }
            next();
        }
    ];
}

module.exports = authorize;
