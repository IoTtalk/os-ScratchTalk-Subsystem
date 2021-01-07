var express = require('express');
var request = require('request');
var config = require('../config');
var User = require('../db/service/user');
var Token = require('../db/service/token');

var router = express.Router();


router.get('/login/:oauthProvider', (req, res) => {
    // direct to OAuth server if not logged in
    if(!req.session.token){
        var redir = { redirect: `${config.googleAuthURI}?prompt=consent&access_type=offline&client_id=${config.googleClientID}&redirect_uri=${config.redirectURI}&scope=openid%20profile%20email&response_type=code` };
    }else{
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
        var token = JSON.parse(body);
        token.id_token = (token.id_token).slice(0, 30);
        // save token in user session for service authorization
        req.session.token = token.id_token;
        console.log('[User logged in]', token.id_token);

        // save token in database
        delete token['scope'];
        Token.create(token)
            .then( () => {
                // refresh token if time expires
                Token.updateToken(token.id_token);

                // save userinfo in database if user not exist
                User.getByIdToken(token.id_token)
                    .then( userObject => {
                        if(!userObject){
                            Token.getByIdToken(token.id_token)
                            .then( tokenObject => {
                                request({
                                    method: 'GET',
                                    uri: config.userinfoEndpoint+'?alt=json&&access_token='+tokenObject.access_token,
                                },
                                (error, response, body) => {
                                    console.log('[Get User Profile]', body);

                                    User.create({
                                        id_token: token.id_token,
                                        name: JSON.parse(body).name,
                                        email: JSON.parse(body).email,
                                        picture: JSON.parse(body).picture
                                    });
                                    }
                                );
                            });
                        }
                        return res.redirect(`${config.serverName}`);
                    });
            });
        }
    );
});

router.post('/status', (req, res) => {
    // check if session exist to determine whether the user has logged in or not
    if(!req.session.token){
        return res.json({ session: null });
    }

    // check if token is valid
    Token.getByIdToken(req.session.token)
        .then( tokenObject => {
            if(!tokenObject)return res.json({ session: null });
            return res.json({ session: tokenObject.id_token });
        })
});

router.post('/userprofile', (req, res) => {
    if(!req.session.token){
        return res.status(401).send("Not Logged In.")
    }else{
        // response user profile (name. email, picture, etc.)
        User.getByIdToken(req.session.token)
            .then(userObject => {
                return res.json({user: JSON.stringify(userObject.get())});
            });
    }
});

router.get('/logout', (req, res) => {
    if(req.session.token){
        console.log('[User signed out]', req.session.token);
        // destroy user session to log out
        req.session.destroy();

        var redir = { redirect: `${config.serverName}` };
        return res.json(redir);
    }else{
        return res.status(400).send("Not Logged In.");
    }
});


module.exports = router;
