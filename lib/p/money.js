var BankCard = require("../models/bankcard");
var BankCardUtils = require("../controller/bankcard");
var Trade = require("../models/trade");
var ToTrade = require("../models/totrade");
var LoanReq = require("../models/loanrequest");
var LoanInfo = require("../models/loaninfo");
var SinapayUtils = require("../sinapay/sinapay-utils");
var Bill = require("../models/bill");
var Request = require("../models/request");
var Record = require("../models/record");
var Limit = require("../lib/limitamount");
var doSync = require("../lib/sync").doSync;
var mainAccountId = "0001";
var idPrefix = "jac";

var reqcordStatus = {
    LEND_START: 1,
    LEND_TRANSFER_FAILED: 2,
    LEND_TRANSFER_SUCCESS: 3,
    LEND_WITHDRAW_FAILED: 4,
    LEND_SUCCESS: 5,
    REPAY_START: 6,
    REPAY_DEPOSIT_FAILED: 7,
    REPAY_DEPOSIT_SUCCESS: 8,
    REPAY_TRANSFER_FAILED: 9,
    REPAY_SUCCESS: 10
};
var requestStatus = {
        START_REQ: 1,
        PAY_REJECT: 2,
        PAY_ACCEPT: 3,
        WITHDRAW_FAILED: 4,
        WITHDRAW_SUCCESS: 5
    }
    //代还款列表（账单）状态
var billStatus = {
    TOPAY: 1,
    PROCESSING: 2,
    FINISHED: 3
}

function addRequest(body, fn) {
    var rtn = {};
    LoanReq.method.post(body, function(err, result) {
        if (err) {
            fn(err);
            return;
        }
        if (!result) {
            fn("no result");
            return;
        }
        rtn.reqid = result.insertId;
        body.reqid = result.insertId;
        Request.insert(body, function(err, result) {
            if (err) {
                fn(err);
                return;
            }
            rtn.reqid2 = result.insertId;
            fn(null, rtn);
        });
    });
}

function addRecord(body, fn) {}

function checkBillNoTopay(env, fn) {
    Bill.select({
        userid: env.userid,
        status: billStatus.TOPAY
    }, function(err, docs) {
        if (err) return fn(err);
        if (docs) return fn("有未付清的账单", null, 1);
        fn();
    });
}

function checkRequestNoProcessing(env, fn) {
    Request.selectpro({
        $eq: {
            userid: env.userid
        },
        $sort: {
            applydate: -1
        },
        $limit: 1
    }, function(err, docs) {
        if (err) return fn(err);
        var doc = docs[0];
        if (!doc || doc.status == requestStatus.WITHDRAW_SUCCESS)
            return fn();
        fn("你已经有一笔处理中的借款，ID: " + doc._id, null, 2);
    });
}

function getBankCard(env, fn) {
    BankCard.method.get(env.bankcardid, {}, function(err, doc) {
        if (err) {
            fn(err);
            return;
        }
        if (!doc) {
            fn("bankcard id error");
            return;
        }
        env.bankcard = doc;
        fn();
    });
}

function ensureWithdrawCard(env, fn) {
    var bankcard = env.bankcard;
    SinapayUtils.ensureWithdrawCard({
        identity_id: env.user.identity_id,
        payee_identity_id: mainAccountId,
        card_id: bankcard.card_id
    }, function(err, result) {
        if (err) {
            fn(err);
            return;
        }
        if (result.message == "NOT_BINDED") {
            BankCardUtils.bindCard({
                body: {
                    bank_account_no: bankcard.bank_account_no,
                    bank_code: bankcard.bank_code,
                    card_type: bankcard.card_type,
                    phone_no: bankcard.phone_no
                },
                user: env.user
            }, function(err, result) {
                if (err) {
                    fn(err);
                    return;
                }
                env.ticket = result.ticket;
                fn("done", result);
                return;
            });
        } else {
            fn();
        }
    });
}

function writeRequest(env, fn) {
    var amount = env.amount;
    var totaltime = env.totaltime;
    var interest =
        addRequest({
            userid: env.userid,
            bankcardid: env.bankcardid,
            amount: amount.toFixed(2),
            repayamount: Limit.calRepayamount(amount, totaltime),
            interest: Limit.calInterest(amount, totaltime),
            fee: Limit.calFee(amount, totaltime),
            totaltime: totaltime,
            info: env.info,
            status: requestStatus.MACHINE_ACCEPT
        }, function(err, result) {
            if (err) {
                fn(err);
                return;
            }
            if (!result) {
                fn("insert request/loanreq failed");
                return;
            }
            env.reqid = result.reqid;
            Limit.incSpent(env.userid, env.amount, function(err) {
                if (err) {
                    fn(err);
                    return;
                }
                fn();
            });
        });
}
module.exports.lendMoney = function(req, fn) {
    if (!req.body.amount || !req.body.totaltime || !req.body.bankcardid) {
        fn("no amount or totaltime");
        return;
    }
    if (req.user.status != 4) {
        fn("user not validated");
        return;
    }
    if (req.body.amount > req.user.limitamount - req.user.spent) {
        fn("no enough remainings", null, 3);
        return;
    }
    var userid = req.user._id;
    var bankcard;
    var reqid, tradeid;
    doSync([
        checkBillNoTopay,
        checkRequestNoProcessing,
        getBankCard,
        ensureWithdrawCard,
        writeRequest
    ], {
        info: req.body.info,
        userid: userid,
        bankcardid: req.body.bankcardid,
        user: req.user,
        amount: parseFloat(req.body.amount),
        totaltime: parseFloat(req.body.totaltime)
    }, function(err, env, errorCode, funcname) {
        if (err && err != "done") {
            console.log(funcname + " error");
            fn(err, env, errorCode);
            return;
        }
        var result = {};
        if (env.ticket) result.ticket = env.ticket;
        fn(null, result);
    });
};

function checkBillRepay(env, fn) {
    Bill.select({
        reqid: env.totradeid
    }, function(err, docs) {
        if (err) {
            fn(err);
            return;
        }
        var doc = docs[0];
        if (!docs) {
            fn("账单该项不存在");
            return;
        }
        if (doc.userid != env.userid) {
            fn("不能代替别人还款");
            return;
        }
        if (doc.status > 1) {
            fn("账单已经处理过了", null, 1);
            return;
        }
    });
}
module.exports.repayMoney = function(req, fn) {
    if (!req.body.amount || !req.body.totradeid || !req.body.bankcardid) {
        fn("no card_id, totradeid or amount");
        return;
    }
    var amount = req.body.amount;
    var repayAmount = amount;
    ToTrade.method.get(req.body.totradeid, {}, function(err, doc) {
        if (err) {
            fn(err);
            return;
        }
        if (doc.userid != req.user._id) {
            fn("not your card!!!!!");
            return;
        }
        if (!doc) {
            fn("no totradeid");
            return;
        }
        if (doc.status > 1) {
            fn("already in process or payed", null, 1);
            return;
        }
        var ttdoc = doc;
        var tradeno = SinaPay.genTradeNo();
        var tradeid;
        Trade.method.post({
            "reqid": ttdoc.reqid,
            "userid": ttdoc.userid,
            "bankcardid": req.body.bankcardid,
            "totradeid": req.body.totradeid,
            "tradeno": tradeno,
            "amount": amount,
            "status": tradeStatus.REPAY_START
        }, function(err, result) {
            if (err) {
                fn(err);
                return;
            }
            if (!result || !result.insertId) {
                fn("no insertId");
                return;
            }
            tradeid = result.insertId;
            //repay
            BankCard.method.get(req.body.bankcardid, function(err, card) {
                if (err) {
                    fn(err);
                    return;
                }
                if (!card) {
                    fn("card not exists");
                    return;
                }
                SinaPayUtils.quickDeposit({
                    out_trade_no: tradeno,
                    identity_id: req.user.identity_id,
                    payee_identity_id: mainAccountId,
                    amount: repayAmount,
                    bank_code: card.bank_code,
                    bank_account_no: card.bank_account_no,
                    real_name: req.user.realname,
                    card_type: card.card_type,
                    phone_no: card.phone_no,
                    action: req.body.totradeid
                }, function(err, result) {
                    if (err) {
                        Trade.methods.put(tradeid, {
                            status: tradeStatus.REPAY_DEPOSIT_FAILED
                        });
                        fn(err);
                        return;
                    }
                    if (!result.ticket) {
                        fn("no ticket");
                        return;
                    }
                    Trade.methods.put(tradeid, {
                        ticket: result.ticket
                    }, function(err) {
                        if (err) {
                            fn(err);
                            return;
                        }
                        fn(null, result);
                    });
                });
            });
        });

    });
}

function checkToTrade2() {}

module.exports.repayMoneyVerify = function(req, fn) {
    if (!req.body.ticket || !req.body.validate_code) {
        fn("param error");
        return;
    }
    var ttdoc;
    var lrdoc;
    var info;
    var tradeid;
    var amount;
    var action;
    var totradeid;
    var send = 0;
    async.series([function(cb) {
        Trade.methods.get({
            ticket: req.body.ticket
        }, {}, function(err, doc) {
            tradeid = doc._id;
            totradeid = action = doc.totradeid;
            amount = doc.amount;
            cb();
        });
    }, function(cb) {
        ToTrade.method.get(totradeid, {}, function(err, doc) {
            if (err) {
                cb(err);
                return;
            }
            if (!doc) {
                cb("no totradeid" + totradeid);
                return;
            }
            if (doc.status == totradeStatus.PROCESSING) {
                fn("already in process", null, 1);
                cb("done");
                return;
            }
            ToTrade.method.put(totradeid, {
                status: totradeStatus.PROCESSING
            }, function(err) {
                if (err) {
                    cb(err);
                    return;
                }
                ttdoc = doc;
                cb();
            });
        });
    }, function(cb) {
        LoanReq.method.get(ttdoc.reqid, {}, function(err, doc) {
            if (err) {
                cb(err);
                return;
            }
            if (!doc) {
                cb("no reqid " + ttdoc.reqid);
                return;
            }
            lrdoc = doc;
            cb();
        });
    }, function(cb) {
        SinaPayUtils.quickDepositAdvance({
            action: action,
            ticket: req.body.ticket,
            validate_code: req.body.validate_code
        }, function(err, result) {
            if (err) {
                if (err.message == "CREATE_DEPOSIT_ASYNC_TIMEOUT") {
                    //特殊情况，新浪响应太慢
                    //		fn(err, null, 3);
                    //		send = 1;
                    //		ToTrade.methods.put(totradeid, {status: 4});
                    //		cb("done");
                } else {
                    Trade.methods.put(tradeid, {
                        "status": tradeStatus.REPAY_DEPOSIT_FAILED
                    });
                    if (err.message == "ADVANCE_TICKET_VALIDATE_FAIL") {
                        fn(err, null, 2);
                        cb("done");
                    } else if (err.message == "ADVANCE_FAILED") {
                        fn(err, null, 1);
                        cb("done");
                    } else
                        cb(err);
                    return;
                }
            }
            info = result;
            //			amount = info.amount;
            send = 1;
            fn(null);
            cb();
        });
    }, function(cb) {
        Trade.methods.put(tradeid, {
            "status": tradeStatus.REPAY_DEPOSIT_SUCCESS
        }, function(err, result) {
            if (err) {
                cb(err);
                return;
            }
            cb();
            // can return user
        });
    }, function(cb) {
        ToTrade.method.get(totradeid, {}, function(err, totrade) {
            if (err) {
                cb(err);
                return;
            }
            // 如果还钱少于应还
            if (amount < totrade.repayamount) {
                ToTrade.method.put(totradeid, {
                    repayamount: (totrade.repayamount - amount).toFixed(2),
                    status: totradeStatus.TODO
                }, function(err, result) {
                    if (err) {
                        cb(err);
                        return;
                    }
                    cb();
                });
                //如果相等
            } else if (amount == totrade.repayamount) {
                if (err) {
                    cb(err);
                    return;
                }
                ToTrade.method.put(totradeid, {
                    status: totradeStatus.FINISHED
                }, function(err, result) {
                    Limit.incSpent(req.user._id, -ttdoc.amount, function() {});
                    if (err) {
                        cb(err);
                        return;
                    }
                    cb();
                });
            } else {
                cb("repay more");
            }
        });

    }, function(cb) {
        //calculate fees
        //		amount = parseFloat(info.amount);
        //		var dAmount = info.amount;

        SinaPayUtils.transferAll({
            "payer_identity_id": req.user.identity_id,
            "payee_identity_id": mainAccountId
                //			"amount": dAmount
        }, function(err, result) {
            if (err) {
                Trade.method.put(tradeid, {
                    status: tradeStatus.REPAY_TRANSFER_FAILED
                });
                console.error(err);
                cb(err);
                return;
            }
            Trade.method.put(tradeid, {
                status: tradeStatus.REPAY_SUCCESS
            }, function(err, result) {
                if (err) {
                    cb(err);
                    return;
                }
                if (!send)
                    fn(null, {
                        success: true
                    });
                cb();
            });
        });
    }], function(err) {
        if (err && err != "done") {
            if (!send)
                fn(err);
        }
    });
}