var mysql = require('mysql2/promise');
var Sequelize = require('sequelize');
var config = require('../config');
var logger = require('../utils/logger')("DB");

// mysql
/*const sequelize = new Sequelize(config.db, config.dbUser, config.dbPassword, {
    host: config.dbHost,
    port: 3306,
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 30000
    },
    charset: 'utf8',
    logging: false
});*/

//sqlite
const sequelize = new Sequelize(config.db, config.dbUser, config.dbPassword, {
     host: 'localhost',
     dialect: 'sqlite',
     pool: {
         max: 5,
         min: 0,
         idle: 30000
     },
     storage: './scratchtalk.sqlite',
     charset: 'utf8',
     logging: false
});

const db = {
    User: require('./models/user')(sequelize),
    AccessToken: require('./models/accessToken')(sequelize),
    RefreshToken: require('./models/refreshToken')(sequelize),
    Project: require('./models/project')(sequelize)
}

var init = async () => {
    // create db if it doesn't already exist (for mysql only)
    if(sequelize.dialect==='mysql'){
        const connection = await mysql.createConnection({
            host: config.dbHost,
            user: config.dbUser,
            password: config.dbPassword
        });
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.db}\`;`);
        logger.warn("Database does not exist, create one: %s", config.db);
    }
    
    // start db
    sequelize.authenticate()
        .then(function(err) {
            logger.info('Connection has been established successfully.');
        })
        .catch(function (err) {
            logger.error('Unable to connect to the database: %s', err);
        });

    // configure table relationships
    db.User.hasMany(db.AccessToken, { as: 'userAccessToken', foreignKey: 'userId' });
    db.User.hasOne(db.RefreshToken, { as: 'userRefreshToken', foreignKey: 'userId' });
    db.User.hasMany(db.Project, { as: 'userProject', foreignKey: 'userId' });
    db.RefreshToken.hasMany(db.AccessToken, { as: 'refreshToken', foreignKey: 'refreshTokenId' });
    
    // sync all models with database
    await sequelize.sync();
}


module.exports = {
    db: db,
    init: init
};
