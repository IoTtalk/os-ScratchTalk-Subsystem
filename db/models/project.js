const { DataTypes } = require('sequelize');

var projectModel = (sequelize) => {
    const attributes = {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        pId: {
            type: DataTypes.INTEGER,
        }
    };

    const options = { freezeTableName: true, initialAutoIncrement: 1 };

    return sequelize.define('Project', attributes, options);
}

module.exports = projectModel;
