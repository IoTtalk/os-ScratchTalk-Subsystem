var db = require("../db");

var create = async (params) => {
    if (await db.User.findOne({ where: { id_token: params.id_token } })) {
        console.log('[DB]', 'id_token "' + params.id_token + '" is already taken');
        return;
    }

    await db.User.create(params);
    return;
}

var update = async (params) => {
    const user = await getByIdToken(params.id_token);
    Object.assign(user, params);
    await user.save();

    return ;
}

var _delete = async (id_token) => {
    const user = await getByIdToken(id_token);
    await user.destroy();
}

var getByIdToken = async (id_token) => {
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
