var mysql = require('mysql2/promise');
var Sequelize = require('sequelize');
var config = require('../config');

var initdb = async () => {
    // create db if it doesn't already exist
    var dbConn = await mysql.createConnection({
        host: config.dbHost,
        user: config.dbUser,
        password: config.dbPassword
    });

    var actions = {
            createDB: {
                sql: `CREATE DATABASE IF NOT EXISTS \`${config.db}\``,
                msg: "Create scratchtalk Database"
            },
            switchDB: {
                sql: `USE \`${config.db}\``,
                msg: "Use scratchtalk database"
            },
            createTokenTable: {
                sql: "CREATE TABLE IF NOT EXISTS token (id_token VARCHAR(255), access_token VARCHAR(255), refresh_token VARCHAR(255), token_type VARCHAR(255), expires_in INTEGER, update_time TIMESTAMP)",
                msg: "Create token table"
            },
            createUserTable: {
                sql: "CREATE TABLE IF NOT EXISTS user (id_token VARCHAR(255), name VARCHAR(255), email VARCHAR(255), picture VARCHAR(255))",
                msg: "Create user table"
            }
        }

    // for(var action in actions){
    //     await dbConn.query(actions[action].sql);
    //     console.log("[DB]", actions[action].msg);
    // }

    // connect to db
    const sequelize = new Sequelize(config.db, config.dbUser, config.dbPassword, {
        host: config.dbHost,
        port: 3306,
        dialect: 'mysql',
        pool: {
            max: 5,
            min: 0,
            idle: 30000
        },
    });

    sequelize.authenticate()
        .then(function(err) {
            console.log('Connection has been established successfully.');
        })
        .catch(function (err) {
            console.log('Unable to connect to the database:', err);
        });

    // init models and add them to the exported db object
    db.Token = require('./models/token')(sequelize);
    db.User = require('./models/user')(sequelize);

    // sync all models with database
    await sequelize.sync();
}

initdb();

module.exports = db = {};
