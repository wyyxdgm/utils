/*example*/
// var invocation = {
// 	source: result,
// 	result: result,
// 	select: "admins",
// 	selectKey: "_id",
// 	mapObj: null,
// 	mapKey: "cuserid",
// 	newKey: "cuser",
//	selectMany: false,
// 	nexti: 0
// }
// if (result) {
// 	var select = require("../lib/select");
// 	select.join(invocation, function(err, result) {
// 		if (err) {
// 			fn(err);
// 			return;
// 		}
// 		if (result && result.length > 0) {
// 			for (var i in result) {
// 				var date = result[i].create_time;
// 				if (date) {
// 					var y = date.getFullYear();
// 					var m = date.getMonth() + 1;
// 					var d = date.getDate();
// 					var h = date.getHours();
// 					var mi = date.getMinutes();
// 					var str = y + "-" + m + "-" + d + " " + h + ":" + mi;
// 					result[i].create_time = str;
// 				}
// 			}
// 		}
// 		fn(null, result);
// 	});
// }
var coreDb = require("../core/db");

function fillPro(invocation, fn) {
    if (invocation.nexti >= invocation.source.length) { /*nexti shuld not be avalible*/
        fn(null, invocation.result);
    } else {
        var model = coreDb.getModel(invocation.select);
        var _id = -1;
        if (invocation.mapObj) {
            if (invocation.source[invocation.nexti][invocation.mapObj] && invocation.source[invocation.nexti][invocation.mapObj][invocation.mapKey]) {
                _id = invocation.source[invocation.nexti][invocation.mapObj][invocation.mapKey];
            }
        } else {
            if (invocation.source[invocation.nexti] && invocation.source[invocation.nexti][invocation.mapKey]) {
                _id = invocation.source[invocation.nexti][invocation.mapKey];
            }
        }
        if (_id == -1) {
            invocation.result[invocation.nexti][invocation.newKey] = {};
            invocation.nexti++;
            fillPro(invocation, fn);
        } else {
            if (invocation.isSelectKeyString) {
                _id += "";
            }
            var where = {};
            where[invocation["selectKey"]] = _id;
            if (invocation["selectMany"]) {
                var selectOption = {};
                if (invocation.selectOption) {
                    selectOption = invocation.selectOption;
                }
                model.bselect(where, selectOption, function(err, result) {
                    invocation.result[invocation.nexti] = invocation.source[invocation.nexti];
                    if (!err && result) { /*has data*/
                        invocation.result[invocation.nexti][invocation.newKey] = result;
                    } else {
                        invocation.result[invocation.nexti][invocation.newKey] = {};
                    }
                    invocation.nexti++;
                    fillPro(invocation, fn);
                });
            } else {
                model.select(where, function(err, result) {
                    invocation.result[invocation.nexti] = invocation.source[invocation.nexti];
                    if (!err && result) { /*has data*/
                        invocation.result[invocation.nexti][invocation.newKey] = result;
                    } else {
                        invocation.result[invocation.nexti][invocation.newKey] = {};
                    }
                    invocation.nexti++;
                    fillPro(invocation, fn);
                });
            }

        }

    }
}
module.exports.join = module.exports.fillPro = fillPro;


// test
// function pro(fn){
//     var coreDb = require("../core/db");
//     var loaninfos = coreDb.getModel("loaninfos");
//     loaninfos.bselect({},function(err,result){
//         if(err){fn(err); return;}
//         var invocation = {
//             source:result,
//             result:[],
//             select:"loanrequests",
//             selectKey:"_id",
//             mapObj:null,
//             mapKey:"_id",
//             newKey:"loanrequest",
//             nexti:0
//         }
//         if(result){
//             fillPro(invocation,function(err,result){
//                 if(err){fn(err); return;}
//                 var invocation = {
//                     source:result,
//                     result:[],
//                     select:"accounts",
//                     selectKey:"_id",
//                     mapObj:"loanrequest",
//                     mapKey:"userid",
//                     newKey:"account",
//                     nexti:0
//                 }
//                 if(result){
//                     fillPro(invocation,function(err,result){
//                         if(err){fn(err); return;}
//                         fn(null, result);
//                     });
//                 }
//             });
//         }
//     });
// }

// var coreDb = require("../core/db");
// function fillPro(invocation,fn){
//     if(invocation.nexti >= invocation.source.length){/*nexti shuld not be avalible*/
//         fn(null, invocation.result);
//     }else{
//         var model = coreDb.getModel(invocation.select);
//         var _id = invocation.mapObj ? (invocation.source[invocation.nexti][invocation.mapObj] && invocation.source[invocation.nexti][invocation.mapObj][invocation.mapKey]?invocation.source[invocation.nexti][invocation.mapObj][invocation.mapKey]:-1):(invocation.source[invocation.nexti][invocation.mapKey]?invocation.source[invocation.nexti][invocation.mapKey]:-1);
//         model.select({_id:_id},function(err,result){
//             invocation.result[invocation.nexti] = invocation.source[invocation.nexti];
//             if(!err && result){/*has data*/
//                 invocation.result[invocation.nexti][invocation.newKey] = result;
//             }else{
//                 invocation.result[invocation.nexti][invocation.newKey] = {};
//             }
//             invocation.nexti++;
//             fillPro(invocation,fn);
//         });
//     }
// }
// coreDb.connect(function(){
//     pro(function(err,result){
//     });
// });