const { DataTypes } = require('sequelize');

var accessTokenModel = (sequelize) => {
    const attributes = {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        token: {
            type: DataTypes.TEXT('long'),
            allowNull: true
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
    };

    const options = { freezeTableName: true, initialAutoIncrement: 1 };

    return sequelize.define('AccessToken', attributes, options);
}

module.exports = accessTokenModel;
