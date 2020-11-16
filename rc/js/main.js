const Ccmapi_URL = window.location.host + "/ccmapi";
const Csm_URL = "https://iottalk.scratchtalk.tw/csm";

$(function() {
    var connStatus = false;

    // Keep screen active
    function enableNoSleep() {
        var noSleep = new NoSleep();
        noSleep.enable();
    }

    function checkDeviceMotion() {
      // feature detect
      if (typeof DeviceMotionEvent.requestPermission === 'function') {
          DeviceMotionEvent.requestPermission()
          .then(permissionState => {
              if (permissionState === 'granted') {
                  window.addEventListener('devicemotion', () => {});
              }
            }).catch(console.error);
        } else {
            // handle regular non iOS 13+ devices
        }
    }

    function checkDeviceOrientation() {
        // feature detect
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    window.addEventListener('deviceorientation', () => {});
                }
            }).catch(console.error);
        } else {
            // handle regular non iOS 13+ devices
        }
    }
    $('#permission_modal').modal('show',{backdrop: null,keyboard: false});
    $('#permission_modal').bind('click',function(){
        $('#permission_modal').modal('hide');
        enableNoSleep();
        checkDeviceOrientation();
        checkDeviceMotion();
        wrapperAudioMeter();
    });
    $('#disconnect_modal').bind('click',function(){
        $('#disconnect_modal').modal('hide');
        $('#permission_modal').modal('hide');
    });

    var device_name = "Smartphone";
    // while( !(device_name = prompt('請輸入裝置名稱', Math.floor(Math.random() * 1000) + '.SmartPhone')) );
    var interval = 33;
    var accurracy = 10;
    var acc  = {x:0,y:0,z:0};
    var gyro = {x:0,y:0,z:0};
    var orient = {x:0,y:0,z:0,oc:0};
    var AxDom = $('#Ax > span');
    var AyDom = $('#Ay > span');
    var AzDom = $('#Az > span');
    var RxDom = $('#Rx > span');
    var RyDom = $('#Ry > span');
    var RzDom = $('#Rz > span');
    var OxDom = $('#Ox > span');
    var OyDom = $('#Oy > span');
    var OzDom = $('#Oz > span');

    window.ondevicemotion = function(event) {
        var ax = event.accelerationIncludingGravity.x || 0;
        var ay = event.accelerationIncludingGravity.y || 0;
        var az = event.accelerationIncludingGravity.z || 0;
        acc.x = Math.round(ax*accurracy) / accurracy;
        acc.y = Math.round(ay*accurracy) / accurracy;
        acc.z = Math.round(az*accurracy) / accurracy;

        var ra = event.rotationRate.alpha;
        var rb = event.rotationRate.beta;
        var rg = event.rotationRate.gamma;
        gyro.x = Math.round(rg*accurracy) / accurracy;
        gyro.y = Math.round(ra*accurracy) / accurracy;
        gyro.z = Math.round(rb*accurracy) / accurracy;
    }

    window.ondeviceorientation = function(event) {
        var compassdisc = document.getElementById("compassDiscImg");

        if(event.webkitCompassHeading)
            orient.oc = Math.ceil(event.webkitCompassHeading) || 0;  // oc: orientation compass
        else
            orient.oc =  (Math.round((event.alpha||0)*accurracy) / accurracy);

        orient.x = (Math.round((event.alpha||0)*accurracy) / accurracy);
        orient.y = (Math.round((event.beta  ||0)*accurracy) / accurracy);
        orient.z = (Math.round((event.gamma||0)*accurracy) / accurracy);
        compassdisc.style.webkittransform = "rotate("+ (360-orient.oc) +"deg)";
        compassdisc.style.moztransform = "rotate("+ (360-orient.oc) +"deg)";
        compassdisc.style.transform = "rotate("+ (360-orient.oc) +"deg)";
    }

    function domUpdater() {
        AxDom.text(acc.x);
        AyDom.text(acc.y);
        AzDom.text(acc.z);

        RxDom.text(gyro.x);
        RyDom.text(gyro.y);
        RzDom.text(gyro.z);

        OxDom.text(orient.x);
        OyDom.text(orient.y);
        OzDom.text(orient.z);

        requestAnimationFrame(domUpdater);
    }
    requestAnimationFrame(domUpdater);

    function iotUpdater() {
        dan2.push('Acceleration', [acc.x, acc.y, acc.z]);
        dan2.push('Gyroscope', [gyro.x, gyro.y, gyro.z]);
        dan2.push('Orientation', [orient.x, orient.y, orient.z]);
        dan2.push('Microphone', [(meter.volume*100).toFixed(2)]);
    }

    function on_signal(cmd, param) {
        if(cmd === "DISCONNECT"){
            connStatus = false;
            $('#disconnect_modal').modal('show',{backdrop: null,keyboard: false});
            $('#container').hide();
            return true;
        }else{
            connStatus = true;
            $('#disconnect_modal').modal('hide');
            $('#container').show();
            return true;
        }
    }

    // check IoTtalk connection status
    setInterval(function(){
        if(connStatus){
            $('#disconnect_modal').modal('hide');
        }
    }, 1000);

    function bind_device(p_id, do_id, d_id){
        var formData;

        formData = new FormData();
        formData.append('username', 'scratchdev');
        formData.append('password', 'scratchdev');
        formData.append('api_name', 'device.bind');
        formData.append('payload', JSON.stringify({
            'p_id': p_id,
            'do_id': do_id,
            'd_id':d_id })
        );
        $.ajax({
            type: 'POST',
            url: Ccmapi_URL,
            processData: false,
            contentType: false,
            data: formData,
            success: function(){
                console.log("binding success");
            },
            error: function(err){
                console.log("err:",err);
            },
        });
    }

    function unbind_device(p_id, do_id){
        var formData;

        formData = new FormData();
        formData.append('username', 'scratchdev');
        formData.append('password', 'scratchdev');
        formData.append('api_name', 'device.unbind');
        formData.append('payload', JSON.stringify({
            'p_id': p_id,
            'do_id': do_id})
        );
        $.ajax({
            type: 'POST',
            url: Ccmapi_URL,
            processData: false,
            contentType: false,
            data: formData,
            success: function(){
                console.log("device unbinded");
            },
            error: function(err){
                console.log("err:",err);
            },
        });
    }

    // Register DA to IoTtalk
    var url = new URL(window.location.href);
    var p_id = url.searchParams.get("p_id");
    var do_id = url.searchParams.get("do_id");
    var d_id = _uuid();

    function on_data(odf, data) {
        // receive data from IoTtalk
    }

    function _uuid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

    function init_callback(result) {
        console.info('register:', result);
        $('#uuid').text(result ? 'Connected: ' + device_name : 'Registration Failed');
        if(result){
            setInterval(iotUpdater, interval);
        }
        unbind_device(p_id, do_id);
        bind_device(p_id, do_id, d_id);
    }

    dan2.register(Csm_URL, {
        'id': d_id,
        'name': device_name,
        'on_signal': on_signal,
        'on_data': on_data,
        'idf_list': [
            ['Acceleration', ['g', 'g', 'g']],
            ['Gyroscope', ['g', 'g', 'g']],
            ['Orientation', ['g', 'g', 'g']],
            ['Microphone', ['g']],
        ],
        'odf_list': [],
        'profile': {
            'model': 'Smartphone',
        },
        'accept_protos': ['mqtt'],
        }, init_callback);


    function pageUnloaded() {
        dan2.deregister();
        unbind_device(p_id, do_id);
    }
    window.addEventListener("unload", pageUnloaded, false);
});