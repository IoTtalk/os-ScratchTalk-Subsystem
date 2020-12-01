var express = require('express');
var request = require('request');
var config = require('../config');

var router = express.Router();


router.get('/login/:oauthProvider', (req, res) => {
    if(!req.session.token){
        // res.redirect(`${config.googleAuthURI}?client_id=${config.googleClientID}&redirect_uri=${config.redirectURI}&scope=email&response_type=code`);
        var redir = { redirect: `${config.googleAuthURI}?client_id=${config.googleClientID}&redirect_uri=${config.redirectURI}&scope=openid%20profile%20email&response_type=code` };
    }else{
        // res.redirect(`${config.serverName}`);
        var redir = { redirect: `${config.serverName}` };
    }

    return res.json(redir);
});

router.get('/oauth-callback', (req, res) => {
    request({ // exchange token by code
        method: 'POST',
        uri: config.googleTokenURI,
        form: {
            'client_id': config.googleClientID,
            'client_secret': config.googleClientSecret,
            'code': req.query.code,
            'grant_type': 'authorization_code',
            'redirect_uri': config.redirectURI
        }
    },
    (error, response, body) => {
        req.session.token = JSON.parse(body).access_token;
        console.log('[User logged in]', JSON.parse(body).access_token);

        return res.redirect(`${config.serverName}`);
        }
    );
});

router.post('/status', (req, res) => {
    var session = {session: req.session.token};
    return res.json(session);
});

router.post('/userprofile', (req, res) => {
    if(!req.seesion.token){
        return res.status(400).send("Not Logged In.")
    }else{
        request({
            method: 'GET',
            uri: config.userinfoEndpoint+'?alt=json&&access_token='+req.session.token,
        },
        (error, response, body) => {
            console.log('[Get User Profile]', body);

            return res.json({user: body});
            }
        );
    }
});

router.get('/logout', (req, res) => {
    if(req.session.token){
        console.log('[User signed out]', req.session.token);
        req.session.destroy();

        // res.redirect(`${config.serverName}`);
        var redir = { redirect: `${config.serverName}` };
        return res.json(redir);
    }else{
        return res.status(400).send("Not Logegd In.");
    }
});


module.exports = router;
