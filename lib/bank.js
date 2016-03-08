var User = require("../models/account");
var Card = require("../models/bankcard");
var Request = require("../models/loanrequest");
var Record = require("../models/trade");
var Bill = require("../models/totrade");

var max_time = 6;
function reqLend(userid, cardid, amount, time, fn){
	if(time > max_time) return fn("最多只能借"+max_time+"期");
	User.methods.get(userid, {}, function(err, user){
		if(err) return fn(err);
		if(user.limitamout - user.spent < amount)
			return fn("额度不足");
		Card.methods.get(cardid, {}, function(err, card){
			if(err) return fn(err);
			if(!card)
				return fn("银行卡不存在");
			Request.methods.insert({
				
			}, function(err ,result){
				
				fn(null, {
					user: user,
					card: card
				});
			});
		});
	});
}
function doLend(user, card, amount, time, dofn, fn){
	
	
}
function finLend(){
}
function reqRepay(){
}
function doRepay(){
}
function finRepay(){
}

function reqPay(){
}
function doPay(){
}
function finPay(){
}
function reqDepo(){
}
function doDepo(){
}
function finDepo(){
}

function hostDepo(){
}
