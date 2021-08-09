const { DataTypes } = require('sequelize');

var userModel = (sequelize) => {
    const attributes = {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        sub: {
            type: DataTypes.STRING(255),
            allowNull: true,
            unique: true
        },
        email: {
            type: DataTypes.STRING(254),
            allowNull: true
        },
        username: {
            type: DataTypes.STRING(100),
            allowNull: true
        }
    };

    const options = { freezeTableName: true, initialAutoIncrement: 1 };

    return sequelize.define('User', attributes, options);
}

module.exports = userModel;
