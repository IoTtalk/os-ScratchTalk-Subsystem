var db = require("../db");

var create = async (params) => {
    // check if user exists
    if (await db.User.findOne({ where: { id_token: params.id_token } })) {
        console.log('[DB]', 'id_token "' + params.id_token + '" is already taken');
        return;
    }

    // create a row in DB
    await db.User.create(params);
    return;
}

var update = async (params) => {
    const user = await getByIdToken(params.id_token);
    Object.assign(user, params);
    await user.save();

    return ;
}

var _delete = async (id_token) => { // "delete" is a reserved name, so use "_delete"
    const user = await getByIdToken(id_token);
    // delete a row
    await user.destroy();
}

var getByIdToken = async (id_token) => {
    // query row with id_token
    const user = await db.User.findOne({ where: { id_token: id_token } });
    if (!user) console.log('[DB]', 'User not found');

    return user;
}


module.exports = {
    create,
    update,
    delete: _delete,
    getByIdToken
};
