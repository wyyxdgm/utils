var Umeng = require("./umeng");
var MSG = require("./msg");
var Account = require("../models/account");
var Flag = require("../models/accountflag");
var DB = require("../core/db");

/*
		Umeng.send({
			type: "INFO_VALIDATE_SUCCESS",
			message: MSG.INFO_VALIDATE_SUCCESS.replace("%1",item).replace("%2", amount)
		}, userid);
*/
module.exports.refreshLimit = function(userid) {
    var flag = {};
    Account.methods.get(userid, {}, function(err, user) {
        Flag.methods.gets({
            userid: userid
        }, {}, function(err, docs) {
            if (docs)
                docs.forEach(function(doc) {
                    flag[doc.type] = doc.status;
                });
            var limit = 0;
            console.log(flag);
            if (flag.idcard == 3 && flag.stucard == 3 && flag.video == 3)
                limit += 1000;
            else {
                Account.methods.update(userid, {
                    limitamount: limit
                });
                return;
            }
            if (flag.email == 3 && user.email.match(/edu\.cn$/))
                limit += 100;
            if (flag.mobile == 3)
                limit += 150;
            if (flag.taobao == 3)
                limit += 450;
            if (flag.jingdong == 3)
                limit += 300;
            if (flag.stuinfo == 3) {
                limit += 1000;
            }
            Account.methods.update(userid, {
                limitamount: limit
            });
        });
    });
}
module.exports.precise = precise;

function precise(f) {
    return parseFloat(parseFloat(f).toFixed(2));
}

var ints = [0.0155, 0.0145, 0.0135, 0.0125, 0.0115, 0.0105];
ints[-0.5] = 0.0155;
var fee = 0.07;
module.exports.calRepayamount = calRepayamount;

function calRepayamount(amount, totaltime, intrate) {
    if (intrate === undefined) intrate = 1;
    return precise(amount * (1 + totaltime * ints[totaltime - 1] * intrate));
}
module.exports.calInterest = calInterest;

function calInterest(amount, totaltime) {
    return precise(calRepayamount(amount, totaltime) - amount);
}
module.exports.calFee = calFee;

function calFee(amount, totaltime) {
    return precise(amount * fee);
}
module.exports.calTransfer = calTransfer;

function calTransfer(amount, totaltime, feerate) {
    return calWithdraw(amount, totaltime, feerate) + 1;
}
module.exports.calWithdraw = calWithdraw;

function calWithdraw(amount, totaltime, feerate) {
    if (feerate === undefined) feerate = 1;
    return precise(amount * (1 - fee * feerate));
}

module.exports.lend = function(amount, tradeid, feerate) {
    if (feerate === undefined) feerate = 1;
    amount = precise(amount);
    var Record = DB.getModel("records");
    Record.insert({
        "tradeid": tradeid,
        "amount": -precise(amount + 1),
        "platform": precise(amount * fee * feerate),
        "spent": 1,
        "time": new Date(),
        "type": "WITHDRAW"
    });
}
module.exports.lendFailed = function(amount, tradeid, feerate) {
    if (feerate === undefined) feerate = 1;
    amount = precise(amount);
    var Record = DB.getModel("records");
    Record.insert({
        "tradeid": tradeid,
        "amount": precise(amount + 1),
        "platform": -precise(1 - precise(amount * (1 - fee * feerate))),
        "spent": -1,
        "time": new Date(),
        "type": "WITHDRAW_FAILED"
    });
}
module.exports.lendSuccess = function(amount, tradeid) {
    amount = precise(amount);
    var Record = DB.getModel("records");
    Record.insert({
        "tradeid": tradeid,
        "type": "WITHDRAW_SUCCESS",
        "time": new Date()
    });
}

module.exports.repay = function(amount, interest, tradeid) {
    amount = precise(amount);
    var Record = DB.getModel("records");
    Record.insert({
        "tradeid": tradeid,
        "ontheway": precise(amount - precise(amount * 0.0015)),
        "type": "DEPOSIT",
        "time": new Date()
    });
}
module.exports.repayFailed = function(amount, interest, tradeid) {
    amount = precise(amount);
    var Record = DB.getModel("records");
    Record.insert({
        "tradeid": tradeid,
        "ontheway": -precise(amount - precise(amount * 0.0015)),
        "type": "DEPOSIT_FAILED",
        "time": new Date()
    });
}
module.exports.repaySuccess = function(amount, interest, tradeid) {
    amount = precise(amount);
    var Record = DB.getModel("records");
    Record.insert({
        "tradeid": tradeid,
        "amount": precise(amount - precise(amount * 0.0015)),
        "ontheway": -precise(amount - precise(amount * 0.0015)),
        "interest": precise(interest),
        "spent": precise(amount * 0.0015),
        "type": "DEPOSIT_SUCCESS",
        "time": new Date()
    });
}
module.exports.bonus = function(amount, tradeid) {
    amount = precise(amount);
    var Record = DB.getModel("records");
    Record.insert({
        "tradeid": tradeid,
        "amount": -precise(amount + 1),
        "time": new Date(),
        "type": "BONUS_WITHDRAW"
    });
}
module.exports.bonusFailed = function(amount, tradeid) {
    amount = precise(amount);
    var Record = DB.getModel("records");
    Record.insert({
        "tradeid": tradeid,
        "amount": precise(amount + 1),
        "time": new Date(),
        "type": "BONUS_WITHDRAW_FAILED"
    });
}
module.exports.bonusSuccess = function(amount, tradeid) {
    amount = precise(amount);
    var Record = DB.getModel("records");
    Record.insert({
        "tradeid": tradeid,
        "type": "BONUS_WITHDRAW_SUCCESS",
        "time": new Date()
    });
}


module.exports.incSpent = incSpent;

function incSpent(userid, amount, fn) {
    Account.methods.put(userid, {
        $inc: {
            spent: amount
        }
    }, function(err) {
        fn(err);
    });
}

/*depeleted*/
module.exports.getOriginLimit = getOriginLimit;

function getOriginLimit() {
    return 1000;
}