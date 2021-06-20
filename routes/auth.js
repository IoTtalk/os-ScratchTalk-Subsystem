var express = require('express');
var { Issuer } = require('openid-client');
var gravatar = require('gravatar');
var config = require('../config');
var db = require("../db/db").db;
var logger = require('../utils/logger')("/Auth");

var router = express.Router();

var iottalkOAuthClient;
(async () => {
    const iottalkIssuer = await Issuer.discover(`${config.authIssuer}`);
    iottalkOAuthClient = new iottalkIssuer.Client({
        client_id: `${config.authClientID}`,
        client_secret: `${config.authClientSecret}`,
        redirect_uris: [`${config.authCallbackURI}`],
        // id_token_signed_response_alg: "EdDSA",
        response_types: ['code']
    });
    logger.info("Found OAuth Issuer");
})()


router.get('/', authRedirect = (req, res) => {
    // Redirect user-agent to the authorization endpoint
    var redirectUri = iottalkOAuthClient.authorizationUrl();

    return res.redirect(redirectUri);
});

router.get('/callback', authCallback = (req, res) => {
    var authCode = iottalkOAuthClient.callbackParams(req);

    iottalkOAuthClient.callback(`${config.authCallbackURI}`, authCode)
        .then(async function (tokenResponse) {
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
            logger.info("User signed with AccessTokenID: %d", AccessTokenRecord.id);

            return res.redirect(`${config.serverName}` );
        });
});

router.get('/sign_out', signOut = async (req, res) => {
    var accessTokenRecord;
    accessTokenRecord = await db.AccessToken.findOne({ where: { id: req.session.accessTokenId } });

    if(!accessTokenRecord){
        return res.redirect(`${config.serverName}`);
    }

    // Revoke the access token
    iottalkOAuthClient.revoke(req.session.accessTokenId)
        .then(async function () {
            await db.AccessToken.destroy({ where: { id: req.session.accessTokenId } })
            logger.info("User signed out with AccessTokeniD: %d", req.session.accessTokenId);
            req.session.destroy();
            return res.redirect(`${config.serverName}`);
        });
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