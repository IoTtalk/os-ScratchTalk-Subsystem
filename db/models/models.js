var models = (sequelize) => {
    var User = require('./user')(sequelize);
    var AccessToken = require('./accessToken')(sequelize);
    var RefreshToken = require('./refreshToken')(sequelize);

    AccessToken.belongsTo(User, { as: 'user' });
    RefreshToken.belongsTo(User, { as: 'user' });
    RefreshToken.hasOne(AccessToken, { as: 'refreshToken' });

    return models = {
        user: User,
        accessToken: AccessToken,
        refreshToken: RefreshToken
    }
}

module.exports = models;