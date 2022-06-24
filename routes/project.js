var express = require('express');
var db = require("../db/db").db;
var ccmapi = require('../utils/ccmapi');
var logger = require('../utils/logger')("project");
var router = express.Router();

router.post('/create', createProject = async (req, res) => {
    if (!req.session.accessTokenId) {
        logger.error("Unable to create IoTtalk project. Please log in.");
        return res.status(404).send({ res: 'User has not logged in.' })
    }
    var projectConfig = req.fields;
    var userAccessTokenId = req.session.accessTokenId;
    var iottalkProjectInfo = { 
        p_id: null,
        ido_id: [],
        odo_id: [],
        na_id: []
    }

    try{
        // create a iottalk project
        let new_id = (await ccmapi.create_project("scratch-"+ new Date().getTime())).p_id;
        iottalkProjectInfo.p_id = parseInt(new_id["result"]);
        // TO DO: create DM, DF if they do not exist
        
        // create IDOs
        if(projectConfig.idos) {
            for(var ido of projectConfig.idos) {
                let my_do_id = (await ccmapi.create_do(iottalkProjectInfo.p_id, ido.dm, ido.idfs)).do_id;
                iottalkProjectInfo.ido_id.push(parseInt(my_do_id.result));
            }
        }

        // create ODOs
        if(projectConfig.odos) {         
            for(var odo of projectConfig.odos) {
                let my_do_id = (await ccmapi.create_do(iottalkProjectInfo.p_id, odo.dm, odo.odfs)).do_id;
                iottalkProjectInfo.odo_id.push(parseInt(my_do_id.result));
            }
        }

        // create NAs

        if(projectConfig.joins) {
            for(var join of projectConfig.joins){
                var joinEndPoint = [];
                if(join.idfs) {
                    join.idfs.forEach( idf => {
                        joinEndPoint.push([iottalkProjectInfo.ido_id[join.ido], idf])
                    });
                }
                if(join.odfs) {
                    join.odfs.forEach( odf => {
                        joinEndPoint.push([iottalkProjectInfo.odo_id[join.odo], odf])
                    });
                }
                let my_na_id = (await ccmapi.create_na(iottalkProjectInfo.p_id, joinEndPoint)).na_id;
                iottalkProjectInfo.na_id.push(parseInt(my_na_id.result));
            }
        }

        // turn the iottalk project status to "on"
        await ccmapi.on_project(iottalkProjectInfo.p_id);

        // set join functions
        var index = 0;
        // AccessTokenRecord = await db.AccessToken.findOne({ where: { id: userAccessTokenId } });
        for(var join of projectConfig.joins){
            if(join.idfs.includes('Orientation-I')){
                await ccmapi.custom_update_na(iottalkProjectInfo.p_id, iottalkProjectInfo.na_id[index], "Join (Updated)");
                console.log("update complete");
            }
            index++;
        }

        // store project to DB
        AccessTokenRecord = await db.AccessToken.findOne({ where: { id: userAccessTokenId } });
        projectRecord = {
            pId: iottalkProjectInfo.p_id,
            userId: AccessTokenRecord.userId
        }
        await db.Project.create(projectRecord);
    } catch (error) {
        logger.error(error.message)
        return res.status(404).send({ res: 'Create IoTtalk project failed.' });
    }
    
    return res.json(iottalkProjectInfo);
});

router.post('/delete', deleteProject = async (req, res) => {
    if (!req.session.accessTokenId) {
        logger.error("Unable to delete IoTtalk project. Please log in.");
        return res.status(404).send({ res: 'User has not logged in.' })
    }

    var projectInfo = req.fields;
    
    try {
        var result = (await ccmapi.delete_project(projectInfo.p_id)).res;
    } catch (err) {
        logger.error(err.message)
    }
    // delete project from DB
    await db.Project.destroy({ where: { pId: projectInfo.p_id } })
    return res.send(result)
});

router.post('/bind_device', bindDevice = async (req, res) => {
    var bindingInfo = req.fields;
    
    if (typeof bindingInfo.p_id === 'string')  
        bindingInfo.p_id = parseInt(bindingInfo.p_id);
    if (typeof bindingInfo.do_id === 'string')  
        bindingInfo.do_id = parseInt(bindingInfo.do_id);

        let my_result = await ccmapi.get_device(bindingInfo.p_id, bindingInfo.do_id);
        bindingInfo.d_id = my_result.response.result[0].d_id;
    try {
        var result = (await ccmapi.bind_device(bindingInfo.p_id, bindingInfo.do_id, bindingInfo.d_id)).res;
    } catch (err) {
        logger.error(err.message)
    }
    return res.send(result)
});

router.post('/unbind_device', unbindDevice = async (req, res) => {
    var unbindingInfo = req.fields;

    try {
        var result = (await ccmapi.unbind_device(unbindingInfo.p_id, unbindingInfo.do_id)).res;
    } catch (err) {
        logger.error(err.message)
    }

    return res.send(result)
});

module.exports = router;