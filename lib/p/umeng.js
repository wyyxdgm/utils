var Stumsg = require("../models/stumsg");
var Account = require("../models/account");
var webreq = require("../lib/webreq");
var encrypt = require("../lib/encrypt");
var url = "http://msg.umeng.com/api/send";
/*
var appkey1 = "54d309e4fd98c5fe620000ac";
var app_master_secret1 = "ttmwo5itct7q1rtfov2rv27zsmipkzgr";

var appkey2 = "54f1821efd98c5e405000124";
var app_master_secret2 = "ldfa4qgqqeqtysdgpgaoj5ynmwcdmxuc";
*/
var appkey1 = "54f3f4c4fd98c5f8d4000132";
var app_master_secret1 = "xreyolxgsqhhdjufw4upvpmennrkhh7y";
var appkey2 = "54f3f512fd98c59b5f0001e0";
var app_master_secret2 = "m2ss92erspsfis2peg4dzxg6nzndxptu";
var alias_type = "stubank";

function sign1(json) {
    return encrypt.md5("POST" + url + JSON.stringify(json) + app_master_secret1);
}

function sign2(json) {
    return encrypt.md5("POST" + url + JSON.stringify(json) + app_master_secret2);
}
module.exports.send = function(msg, userid, fn) {
    msg.time = new Date();
    msg.userid = userid;
    msg.status = 1;
    Stumsg.methods.add(msg, function(err, result) {
        if (err) {
            fn(err);
            return;
        }
        if (!result.insertId) {
            fn("no insertId");
            return;
        }
        msg._id = result.insertId;
        sendAndroid(msg, userid);
        sendIos(msg, userid);
    });
};
module.exports.sendIos = sendIos;

function sendIos(msg, userid, fn) {

    if (!fn) fn = function() {};
    var payload = {
        "aps": {
            "alert": msg.message
        }
    }
    payload.type = msg.type;
    payload.time = msg.time;
    payload.userid = msg.userid;
    payload._id = msg._id;
    payload.supp = msg.supp || "";
    var json = {
        "appkey": appkey2,
        "timestamp": new Date().getTime().toString(),
        "type": "customizedcast",
        "alias": userid.toString(),
        "alias_type": alias_type,
        "payload": payload,
        "production_mode": false,
        "description": "hehe"
    };
    webreq.postJSON(url + "?sign=" + sign2(json), json, function(err, result) {
        if (err) {
            fn(err);
            return;
        }
        console.log("ios");
        console.log(result);
        if (result.statusCode != 200) fn(result);
        else fn(null, result);
    });
}
module.exports.sendAndroid = sendAndroid;

function sendAndroid(msg, userid, fn) {
    msg = JSON.stringify(msg);
    if (!fn) fn = function() {};
    var json = {
        "appkey": appkey1,
        "timestamp": new Date().getTime().toString(),
        "type": "customizedcast",
        "alias": userid.toString(),
        "alias_type": alias_type,
        "payload": {
            "display_type": "message", // 消息，message
            "body": {
                "custom": encodeURIComponent(msg) //message类型只需填写custom即可，可以是字符串或JSON。
            }
        },
        "description": "hehe"
    };
    webreq.postJSON(url + "?sign=" + sign1(json), json, function(err, result) {
        if (err) {
            fn(err);
            return;
        }
        console.log("android");
        console.log(result);
        if (result.statusCode != 200) fn(result);
        else fn(null, result);
    });
}


module.exports.broadcast = function(msg, fn) {
    var msgs = [];
    Account.methods.find({}, {}, function(err, result) {
        if (err) {
            fn(err);
            return;
        }
        if (result && result.length > 0) { /* fill msgs */
            for (var i in result) {
                var message = {
                    message: msg.message,
                    time: new Date(),
                    status: 1,
                    userid: result._id
                };
                msgs[i] = message;
            }
        }
        Stumsg.methods.inserts(msgs, function(err, result) {
            if (err) {
                fn(err);
                return;
            }
            if (!result.insertId) {
                fn("no insertId");
                return;
            }
            broadcastIos(msg);
            broadcastAndroid(msg);
        });
    });
};
module.exports.broadcastIos = broadcastIos;

function broadcastIos(msg, fn) {

    if (!fn) fn = function() {};
    var payload = {
        "aps": {
            "alert": msg.message
        }
    }
    payload.type = msg.type;
    payload.time = msg.time;
    payload.userid = msg.userid;
    payload._id = msg._id;
    payload.supp = msg.supp || "";
    var json = {
        "appkey": appkey2,
        "timestamp": new Date().getTime().toString(),
        "type": "broadcast",
        "alias_type": alias_type,
        "payload": payload,
        "production_mode": false,
        "description": "hehe"
    };
    webreq.postJSON(url + "?sign=" + sign2(json), json, function(err, result) {
        if (err) {
            fn(err);
            return;
        }
        console.log("ios");
        console.log(result);
        if (result.statusCode != 200) fn(result);
        else fn(null, result);
    });
}
module.exports.broadcastAndroid = broadcastAndroid;

function broadcastAndroid(msg, fn) {
    msg = JSON.stringify(msg);
    if (!fn) fn = function() {};
    var json = {
        "appkey": appkey1,
        "timestamp": new Date().getTime().toString(),
        "type": "broadcast",
        "alias_type": alias_type,
        "payload": {
            "display_type": "message", // 消息，message
            "body": {
                "custom": encodeURIComponent(msg) //message类型只需填写custom即可，可以是字符串或JSON。
            }
        },
        "description": "haha"
    };
    webreq.postJSON(url + "?sign=" + sign1(json), json, function(err, result) {
        if (err) {
            fn(err);
            return;
        }
        console.log("android");
        console.log(result);
        if (result.statusCode != 200) fn(result);
        else fn(null, result);
    });
}