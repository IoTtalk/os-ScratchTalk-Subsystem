const { DataTypes } = require('sequelize');

var tokenModel = (sequelize) => {
    const attributes = {
        id_token: { type: DataTypes.STRING, allowNull: true },
        access_token: { type: DataTypes.STRING, allowNull: true },
        refresh_token: { type: DataTypes.STRING, allowNull: true },
        token_type: { type: DataTypes.STRING, allowNull: true },
        expires_in: { type: DataTypes.INTEGER, allowNull: true },
    };

    const options = {};

    return sequelize.define('Token', attributes, options);
}

module.exports = tokenModel;
