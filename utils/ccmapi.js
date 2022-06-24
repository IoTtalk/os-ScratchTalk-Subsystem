const request = require("superagent");
var superagent = require("superagent");
var config = require("../config");

const ccmapi = config.autogenURL;

var _request = (api_name, payload) => {
    let request_payload = { api_name: api_name, payload: payload }
    return new Promise(function(resolve){
        superagent.post(ccmapi+'/ccm_api/')
            .type('json')
            .send(request_payload)
            .end((err, res) => {
                if (err) {
                    resolve({ status: res.status, response:  JSON.parse(res.text) });
                }else{
                    resolve({ status: res.status, response:  JSON.parse(res.text) });
                }
            });
    })
}

var create_account = (username, password, api_name='account.create') => {
    payload = { username: username, password: password };

    _request(api_name, payload);
}

var login_account = (username, password, api_name='account.login') => {
    payload = { username: username, password: password };

    _request(api_name, payload);
}

var delete_account = (username, password, api_name='account.delete') => {
    payload = { username: username, password: password };

    _request(api_name, payload);
}

var create_df = async (df, type, param, api_name='devicefeature.create') => {
    /*
        type: "input" or "output"
        param: {"max": 1.0, "param_type": "float", "min": 0.0}
    */
    payload = { df_name: df, type: type, parameter: param};

    res = await _request(api_name, payload);
    return Promise.resolve({ status: res.status, df_id: res.response });
}

var get_df = async (df, api_name='devicefeature.get') => {
    payload = { df: df };

    res = await _request(api_name, payload);
    return Promise.resolve({ status: res.status, df_info: res.response });
}

var delete_df = (df_id, api_name='devicefeature.delete') => {
    payload = { df: df_id };

    _request(api_name, payload);
}

var create_dm = async (dm_name, dfs, api_name='devicemodel.create') => {
    payload = { dm_name: dm_name, dfs: dfs };

    res = await _request(api_name, payload);
    return Promise.resolve({ status: res.status, dm_id: res.response });
}

var get_dm = async (dm, api_name='devicemodel.get') => {
    payload = { dm: dm };

    res = await _request(api_name, payload);
    return Promise.resolve({ status: res.status, dm_info: res.response });
}

var delete_dm = (dm, api_name='devicemodel.delete') => {
    payload = { dm: dm };

    _request(api_name, payload);
}

var create_project = async (p_name, api_name='project.create') => {
    payload ={ p_name: p_name };
    res = await _request(api_name, payload);
    return Promise.resolve({ status: res.status, p_id: res.response });
}

var get_project = (p_id, api_name='project.get') => {
    payload = { p_id: p_id };

    return _request(api_name, payload);
    /* return project info format
    {
        "exception": "",
        "ido": [],
        "na": [],
        "odo": [],
        "p_id": 198,
        "p_name": "scratch3_demo",
        "restart": false,
        "sim": "off",
        "status": "on",
        "u_id": 12
    }
    */
}

var delete_project = async (p_id, api_name='project.delete') => {
    payload = { p_id: p_id };

    res = await _request(api_name, payload);
    return Promise.resolve({ status: res.status, res: res.response });
}

var on_project = async (p_id, api_name='project.on') => {
    payload = { p_id: p_id };

    res = await _request(api_name, payload);
    return Promise.resolve({ status: res.status, res: res.response });
}

var off_project = (p_name, api_name='project.off') => {
    payload = { p_id: p_id };

    _request(api_name, payload);
}

var create_do = async (p_id, dm_name, df, api_name='deviceobject.create') => {
    payload = { p_id: p_id, dm_name: dm_name, dfs: df }; // df should be a list
    res = await _request(api_name, payload); // return do_id
    
    return Promise.resolve({ status: res.status, do_id: res.response });
}

var get_do = async (p_id, do_id, api_name='deviceobject.get') => {
    payload = { p_id: p_id, do_id: do_id };

    _request(api_name, payload);
}

var create_na = async (p_id, joins, api_name='networkapplication.create') => {
    payload = { p_id: p_id, joins: joins };

    res = await _request(api_name, payload);
    return Promise.resolve({ status: res.status, na_id: res.response });
}

var get_na = async (p_id, na_id, api_name='networkapplication.get') => {
    payload = { p_id: p_id, na_id: na_id };

    res = await _request(api_name, payload);
    return Promise.resolve({ status: res.status, na_info: res.response });
}

var custom_update_na = async(p_id, na_id, na_name, api_name='networkapplication.update') => {
    get_na(p_id, na_id).then(async function(res){
        // payload = gen_payload(na_id, na_name, p_id, res.na_info);
        // res = await _request(api_name, payload);
        return Promise.resolve({ status: 200 , na_id: na_id});
    });
}

var get_device = (p_id, do_id, api_name='device.get') => {
    payload = { p_id: p_id, do_id: do_id };

    return _request(api_name, payload);
}

var bind_device = async (p_id, do_id, d_id, api_name='device.bind') => {
    payload = { p_id: p_id, do_id: do_id, d_id:d_id };

    res = await _request(api_name, payload);
    return Promise.resolve({ status: res.status, res: res.response});
}

var unbind_device = async (p_id, do_id, api_name='device.unbind') => {
    payload = { p_id: p_id, do_id: do_id};

    res = await _request(api_name, payload);
    return Promise.resolve({ status: res.status, res: res.response});
}


function gen_payload(na_id, na_name, p_id, na_info){
    var payload ={
        na_id: na_id,
        na_name: na_name,
        p_id: parseInt(p_id),
        dfm_list: []
    }
    // na_info = JSON.parse(na_info);
    na_info.result.input.forEach((item, i) =>{
        dfm = {
            "dfo_id": item.dfo_id,
            "dfmp_list": item.dfmp
        }
        payload.dfm_list.push(dfm);
    });

    na_info.result.output.forEach((item, i) =>{
        dfm = {
            "dfo_id": item.dfo_id,
            "dfmp_list": item.dfmp
        }
        payload.dfm_list.push(dfm);
    });
    // payload.dfm_list[1].dfmp_list[0].fn_id = 10;
    // payload.dfm_list[2].dfmp_list[0].fn_id = 11;
    return payload;
}


module.exports = {
    create_account: create_account,
    login_account: login_account,
    delete_account: delete_account,
    create_df: create_df,
    get_df: get_df,
    delete_df: delete_df,
    create_dm: create_dm,
    get_dm: get_dm,
    delete_dm: delete_dm,
    create_project: create_project,
    delete_project: delete_project,
    on_project: on_project,
    off_project: off_project,
    create_do: create_do,
    get_do: get_do,
    create_na: create_na,
    get_na: get_na,
    custom_update_na: custom_update_na,
    get_device: get_device,
    bind_device: bind_device,
    unbind_device: unbind_device
};
