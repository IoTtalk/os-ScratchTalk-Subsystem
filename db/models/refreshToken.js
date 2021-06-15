const { DataTypes } = require('sequelize');

var refreshTokenModel = (sequelize) => {
    const attributes = {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        token: {
            type: DataTypes.TEXT('long'),
            allowNull: true
        },
    };

    const options = { freezeTableName: true };

    return sequelize.define('refreshToken', attributes, options);
}

module.exports = refreshTokenModel;
