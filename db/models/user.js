const { DataTypes } = require('sequelize');

var userModel = (sequelize) => {
    const attributes = {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        sub: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        email: {
            type: DataTypes.STRING(254),
            allowNull: true
        },
        username: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        isActive: {
            type: DataTypes.BOOLEAN
        },
        picture: {
            type: DataTypes.STRING,
            allowNull: true
        }
    };

    const options = { freezeTableName: true };

    return sequelize.define('User', attributes, options);
}

module.exports = userModel;
