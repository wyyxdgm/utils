var Db = require('../models/code');
var userDb = require('../models/account');
var random = require('../lib/random');
var webreq = require('../lib/webreq');
var async = require("async");

function sendSms(body, fn) {
    if (body.body) body = body.body;
    if (!body.phone)
        fn("no phone");

    var json = {
        "uid": "oGThF2X8UwYz",
        "pas": "nf5kmgj4",
        "type": "json"
    };
    json.mob = body.phone;

    var code = body.code || random.genNum(6);

    json.p1 = code;
    if (body.code2) {
        json.p2 = body.code2;
    }

    json.cid = body.template || "pWmKsYiHMP1D";

    Db.method.get({
        "phone": body.phone
    }, {}, function(err, doc) {
        if (err) {
            fn(err);
            return;
        }
        if (!doc) {
            doc = new Db({
                "phone": body.phone,
                "code": code,
                "time": new Date()
            });
        } else if (new Date().getTime() - doc.time.getTime() < 60000) {
            fn("wait 60s to send next", null, 1);
            return;
        }
        doc.code = code;
        doc.time = new Date();
        console.log(doc);
        doc.save(function(err) {
            if (err) {
                fn(err);
                return;
            }
            console.log(json);
            webreq.postForm("http://api.weimi.cc/2/sms/send.html", json, function(err, result) {
                if (err) fn(err);
                else if (result.data.code == 0)
                    fn(null, {
                        success: true
                    });
                else
                    fn("第三方短信发送接口返回错误", result, 2);
            });
        });
    });

}
module.exports.sendSms = sendSms;
module.exports.sendSmsMultiple = function(body, fn) {
    if (body.body) body = body.body;
    async.eachSeries(body.configs, function(config, cb) {
        sendSms(config, function(err) {
            if (err) {
                console.log("send sms error " + config.phone);
            }
            cb();
        });
    }, fn);

}
module.exports.sendSmsCheckNoPhone = function(req, fn) {
    userDb.method.get({
        "phone": req.body.phone
    }, {}, function(err, doc) {
        if (err) {
            fn("database error: findOne failed: " + req.body.phone);
            return;
        }
        if (doc) {
            fn("phone already exists", null, 3);
            return;
        }
        sendSms(req, fn);
    });
}
module.exports.sendSmsCheckPhone = function(req, fn) {
    userDb.method.get({
        "phone": req.body.phone
    }, {}, function(err, doc) {
        if (err) {
            fn("database error: findOne failed: " + req.body.phone);
            return;
        }
        if (!doc) {
            fn("phone not exists", null, 3);
            return;
        }
        sendSms(req, fn);
    });
}
module.exports.verifySMS = function(req, fn) {
    Db.method.VerifyCode({
        "id": req.body.phone,
        "code": req.body.code,
        "minutes": 3
    }, function(err, doc) {
        if (err) fn(err);
        else if (doc)
            fn(null, {
                result: true
            });
        else
            fn(null, {
                result: false
            });
    });
}