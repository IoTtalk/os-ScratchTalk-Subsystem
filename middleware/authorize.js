var db = require("../db/db");
var Token = require("../db/service/token");

var authorize = () => {
    return [
        async (req, res, next) => {
            // check if token in session is valid
            const token = await Token.getByIdToken(req.session.token);
            if (!token)
                return res.status(401).json({ message: 'Unauthorized' });

            // update access token if it is expired
            await Token.updateToken(req.session.token);
            next();
        }
    ];
}

module.exports = authorize;
