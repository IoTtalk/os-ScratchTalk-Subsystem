var db = require("../db/db");
var Token = require("../db/service/token");

var authorize = () => {
    return [
        async (req, res, next) => {
            const token = await Token.getByIdToken(req.session.token);
            if (!token)
                return res.status(401).json({ message: 'Unauthorized' });

            await Token.updateToken(req.session.token);
            next();
        }
    ];
}

module.exports = authorize;
