var request = require('request');
var db = require("../db");
var config = require("../../config");

var create = async (params) => {
    if (await db.Token.findOne({ where: { id_token: params.id_token } })) {
        console.log('[DB]', 'id_token "' + params.id_token + '" is already taken');
        return;
    }

    await db.Token.create(params);
    return;
}

var update = async (params) => {
    const token = await getByIdToken(params.id_token);
    Object.assign(token, params);
    await token.save();

    return ;
}

var _delete = async (id_token) => {
    const token = await getByIdToken(id_token);
    await token.destroy();
}

var getByIdToken = async (id_token) => {
    const token = await db.Token.findOne({ where: { id_token: id_token } });
    if (!token) console.log('[DB]', 'Token not found');

    return token;
}

var isTokenExpired = async (id_token) => {
    const token = await getByIdToken(id_token);
    if(!token) return false;

    var pastTime = Math.abs(new Date() - token.updatedAt)/1000;
    if(pastTime > token.expires_in) return token;
    else return false;
}

var updateToken = async (id_token) => {
    const token = await isTokenExpired(id_token);
    if(!token) return false;

    request({ // exchange token by code
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
