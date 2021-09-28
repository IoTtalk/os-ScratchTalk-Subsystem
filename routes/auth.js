var express = require('express');
var { Issuer } = require('openid-client');
var superagent = require("superagent");
var gravatar = require('gravatar');
var config = require('../config');
var db = require("../db/db").db;
var ccmapi = require('../utils/ccmapi');
var logger = require('../utils/logger')("/Auth");

var router = express.Router();

var iottalkOAuthClient;

const issuerDiscover = async () => {
    try {
      return await Issuer.discover(`${config.authIssuer}`);
    } catch (error) {
        logger.error(error.message);
        process.exit(1);
    }
  }

(async () => {
    const iottalkIssuer = await issuerDiscover();
    
    iottalkOAuthClient = new iottalkIssuer.Client({
        client_id: `${config.authClientID}`,
        client_secret: `${config.authClientSecret}`,
        redirect_uris: [`${config.authCallbackURI}`],
        id_token_signed_response_alg: "EdDSA",
        response_types: ['code']
    });
    logger.info("Found OAuth Issuer");
})()


router.get('/', authRedirect = (req, res) => {
    // Redirect user-agent to the authorization endpoint
    
    if (iottalkOAuthClient) {
        var redirectUri = iottalkOAuthClient.authorizationUrl();
        return res.redirect(redirectUri);
    } else {
        logger.error("Redirect to OAuth login page failed.")
        return res.status(404).send({ res: 'Failed to redirect to OAuth page' });
    }
});

router.get('/callback', authCallback = async (req, res) => {
    var authCode = iottalkOAuthClient.callbackParams(req);
    if (!authCode) {
        logger.error("Unable to authorize user");
        return res.status(401).send({ res: 'OAuth provider failed to authorize user' })
    }

    try {
        var tokenResponse = await iottalkOAuthClient.callback(`${config.authCallbackURI}`, authCode)
    } catch (error) {
        logger.error(error.message)
        return res.status(401).send({res: 'OAuth provider failed to authorize user'})
    }

    logger.info("Obtain user token from OAuth server: %s", JSON.stringify(tokenResponse));
    // validate and parse id token 
    var userInfo = tokenResponse.claims();
    logger.info("Obtain user info: %s", JSON.stringify(userInfo));

    var userRecord;
    userRecord = await db.User.findOne({ where: { sub: userInfo.sub } });
    
    if(!userRecord){
        // Create a new user record if there does not exist an old one
        userRecord = {
            sub: userInfo.sub,
            username: userInfo.preferred_username,
            email: userInfo.email
        }
        
        await db.User.create(userRecord);
        userRecord = await db.User.findOne({ where: { sub: userInfo.sub } });
        logger.info("Save user info: %s", JSON.stringify(userRecord.id));
    }
    // Query the refresh token record
    var refreshTokenRecord;
    refreshTokenRecord = await db.RefreshToken.findOne({ where: { userId: userRecord.id } });
    
    if(!refreshTokenRecord){
        // Create a new refresh token record if there does not exist an old one
        refreshTokenRecord = {
            token: tokenResponse.refresh_token,
            userId: userRecord.id
        }
        
        await db.RefreshToken.create(refreshTokenRecord);
        logger.info("Save refresh token: %s", JSON.stringify(refreshTokenRecord.token));
    }
    else if (tokenResponse.refresh_token){
        // If there is a refresh token in a token response, it indicates that
        // the old refresh token is expired, so we need to update the old refresh
        // token with a new one.
        refreshTokenRecord.token = tokenResponse.refresh_token;
        
        await db.RefreshToken.update(refreshTokenRecord, { where: { userId: userRecord.id } });
        logger.info("Save refresh token: %s", JSON.stringify(refreshTokenRecord.token));
    }

    // Create a new access token record
    AccessTokenRecord = {
        token: tokenResponse.access_token,
        expiresAt: new Date(new Date().getTime() + tokenResponse.expires_in * 1000),
        userId: userRecord.id,
        refreshTokenId: refreshTokenRecord.id
    }
    await db.AccessToken.create(AccessTokenRecord);
    AccessTokenRecord = await db.AccessToken.findOne({ where: { userId: userRecord.id } });
    logger.info("Save access token: %s", JSON.stringify(AccessTokenRecord.id));

    // Store the access token ID to session
    req.session.accessTokenId = AccessTokenRecord.id;
    logger.info("User logged in with AccessTokenID: %d", AccessTokenRecord.id);

    return res.redirect(`${config.serverName}` );
});

router.get('/logout', logout = async (req, res) => {
    if (!req.session.accessTokenId) {
        logger.error("User has not logged in");
        return res.status(404).send({ res: 'Invalid logout request' })
    }
    var accessTokenRecord;
    accessTokenRecord = await db.AccessToken.findOne({ where: { id: req.session.accessTokenId } });

    if(!accessTokenRecord){
        return res.redirect(`${config.serverName}`);
    }

    // delete iottalk projects
    projectRecords = await db.Project.findAll({ where: {userId: accessTokenRecord.userId } });
    if(projectRecords) {
        for(var projectRecord of projectRecords) {
            try {
                await ccmapi.delete_project(projectRecord.pId);
            } catch (err) {
                logger.error(err.message)
            }
            // delete project from DB
            await db.Project.destroy({ where: { pId: projectRecord.pId } })
            logger.info("Delete IoTtalk project: %d", projectRecord.pId);        
        }
    }

    // Revoke the access token
    await iottalkOAuthClient.revoke(req.session.accessTokenId)
    await db.AccessToken.destroy({ where: { id: req.session.accessTokenId } });
    logger.info("User logged out with AccessTokenID: %d", req.session.accessTokenId);
    req.session.destroy();
    return res.redirect(`${config.serverName}`);
});

router.post('/status', async (req, res) => {
    // check if session exist to determine whether the user has logged in or not
    if(!req.session.accessTokenId){
        return res.json({ session: null });
    }

    accessTokenRecord = await db.AccessToken.findOne({ where: { id: req.session.accessTokenId } });
    userRecord = await db.User.findOne({ where: { id: accessTokenRecord.userId } });

    return res.json({ session: userRecord.id });
});

router.post('/userprofile', async (req, res) => {
    if(!req.session.accessTokenId){
        return res.status(401).send("Not Logged In.")
    }else{
        var accessTokenRecord = await db.AccessToken.findOne({ where: { id: req.session.accessTokenId } });
        var userRecord = await db.User.findOne({ where: { id: accessTokenRecord.userId } });
        var userInfo = userRecord.get();
        userInfo['picture'] = gravatar.url(userInfo.email);
    
        return res.json({user: JSON.stringify(userInfo)});
    }
});


module.exports = router;