var db = require("../db");
var logger = require('../../utils/logger')("DB");

var create = async (params) => {
    // check if user exists
    if (await db.User.findOne({ where: { id_token: params.id_token } })) {
        logger.error('id_token "%s" is already taken', params.id_token);
        return;
    }

    // create a row in DB
    await db.User.create(params);
    logger.info('Create new row "%s"', params.id_token);
    return;
}

var update = async (params) => {
    const user = await getByIdToken(params.id_token);
    Object.assign(user, params);
    await user.save();
    logger.info('Update row "%s"', params.id_token);

    return ;
}

var _delete = async (id_token) => { // "delete" is a reserved name, so use "_delete"
    const user = await getByIdToken(id_token);
    // delete a row
    await user.destroy();
    logger.info('Delete row "%s"', id_token);
}

var getByIdToken = async (id_token) => {
    // query row with id_token
    const user = await db.User.findOne({ where: { id_token: id_token } });
    if (!user) logger.error('User "%s" not found', id_token);

    return user;
}


module.exports = {
    create,
    update,
    delete: _delete,
    getByIdToken
};
