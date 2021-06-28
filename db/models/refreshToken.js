const { DataTypes } = require('sequelize');

var refreshTokenModel = (sequelize) => {
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
    };

    const options = { freezeTableName: true, initialAutoIncrement: 1 };

    return sequelize.define('RefreshToken', attributes, options);
}

module.exports = refreshTokenModel;
