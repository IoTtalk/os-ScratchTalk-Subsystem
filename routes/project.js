var express = require('express');
var db = require("../db/db").db;
var ccmapi = require('../utils/ccmapi');
var logger = require('../utils/logger')("project");
var router = express.Router();

router.post('/create', createProject = async (req, res) => {
    var projectConfig = req.fields;
    var userAccessTokenId = req.session.accessTokenId;
    var iottalkProjectInfo = { 
        p_id: null,
        ido_id: [],
        odo_id: [],
        na_id: []
    }

    // create a iottalk project
    iottalkProjectInfo.p_id = parseInt((await ccmapi.create_project("scratch-"+ new Date().getTime())).p_id);

    // create IDOs
    if(projectConfig.idos) {
        for(var ido of projectConfig.idos) {
            iottalkProjectInfo.ido_id.push(parseInt((await ccmapi.create_do(iottalkProjectInfo.p_id, ido.dm, ido.idfs)).do_id));
        }
    }

    // create ODOs
    if(projectConfig.odos) {
        for(var odo of projectConfig.odos) {
            iottalkProjectInfo.odo_id.push(parseInt((await ccmapi.create_do(iottalkProjectInfo.p_id, odo.dm, odo.odfs)).do_id));
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
            iottalkProjectInfo.na_id.push(parseInt((await ccmapi.create_na(iottalkProjectInfo.p_id, joinEndPoint)).na_id));
        }
    }

    // turn the iottalk project status to "on"
    await ccmapi.on_project(iottalkProjectInfo.p_id);

    // set join functions
    await ccmapi.update_na(iottalkProjectInfo.p_id, iottalkProjectInfo.na_id[0], "Join (Updated)");

    // store project to DB
    AccessTokenRecord = await db.AccessToken.findOne({ where: { id: userAccessTokenId } });
    projectRecord = {
        pId: iottalkProjectInfo.p_id,
        userId: AccessTokenRecord.userId
    }
    await db.Project.create(projectRecord);

    return res.json(iottalkProjectInfo)
});

router.post('/delete', deleteProject = async (req, res) => {
    var projectInfo = req.fields;
    
    var result = (await ccmapi.delete_project(projectInfo.p_id)).res;
    // delete project from DB
    await db.Project.destroy({ where: { pId: projectInfo.p_id } })
    return res.send(result)
});

router.post('/bind_device', bindDevice = async (req, res) => {
    var bindingInfo = req.fields;
    
    var result = (await ccmapi.bind_device(bindingInfo.p_id, bindingInfo.do_id, bindingInfo.d_id)).res;
    return res.send(result)
});

router.post('/unbind_device', unbindDevice = async (req, res) => {
    var unbindingInfo = req.fields;

    var result = (await ccmapi.unbind_device(unbindingInfo.p_id, unbindingInfo.do_id)).res;
    return res.send(result)
});

module.exports = router;