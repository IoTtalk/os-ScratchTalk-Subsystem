const { DataTypes } = require('sequelize');

var userModel = (sequelize) => {
    const attributes = {
        id_token: { type: DataTypes.STRING, allowNull: true },
        name: { type: DataTypes.STRING, allowNull: true },
        email: { type: DataTypes.STRING, allowNull: true },
        picture: { type: DataTypes.STRING, allowNull: true }
    };

    const options = {};

    return sequelize.define('User', attributes, options);
}

module.exports = userModel;
