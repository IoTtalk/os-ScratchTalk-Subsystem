const { DataTypes } = require('sequelize');

var accessTokenModel = (sequelize) => {
    const attributes = {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        token: {
            type: DataTypes.TEXT('long'),
            allowNull: true
        },
        expiresAt: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
    };

    const options = { freezeTableName: true };

    return sequelize.define('accessToken', attributes, options);
}

module.exports = accessTokenModel;
