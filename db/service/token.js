var request = require('request');
var db = require("../db");
var config = require("../../config");

var create = async (params) => {
    // chek if token exists
    if (await db.Token.findOne({ where: { id_token: params.id_token } })) {
        console.log('[DB]', 'id_token "' + params.id_token + '" is already taken');
        return;
    }

    // create a row in DB
    await db.Token.create(params);
    return;
}

var update = async (params) => {
    const token = await getByIdToken(params.id_token);
    Object.assign(token, params);
    await token.save();

    return ;
}

var _delete = async (id_token) => { // "delete" is a reserved name, so use "_delete"
    const token = await getByIdToken(id_token);
    // delete a row
    await token.destroy();
}

var getByIdToken = async (id_token) => {
    // query row with id_token
    const token = await db.Token.findOne({ where: { id_token: id_token } });
    if (!token) console.log('[DB]', 'Token not found');

    return token;
}

var isTokenExpired = async (id_token) => {
    const token = await getByIdToken(id_token);
    if(!token) return false;

    // check if token has expired
    var pastTime = Math.abs(new Date() - token.updatedAt)/1000;
    if(pastTime > token.expires_in) return token;
    else return false;
}

var updateToken = async (id_token) => {
    const token = await isTokenExpired(id_token);
    if(!token) return false;

    request({ // refresh access token by refresh token
        method: 'POST',
        uri: config.googleTokenURI,
        form: {
            'client_id': config.googleClientID,
            'client_secret': config.googleClientSecret,
            'grant_type': 'refresh_token',
            'refresh_token': token.refresh_token
        }
    },
    (error, response, body) => {
        token.access_token = JSON.parse(body).access_token;
        update(token);

        return true;
        }
    );
}


module.exports = {
    create,
    update,
    delete: _delete,
    getByIdToken,
    updateToken
};
