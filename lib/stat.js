 var db = require("../core/db");

 /*根据id进行分组，id为null表示统计记录数，此外统计count的和*/
 /*_id是一个数组，statX表示_id的长度*/
 /* var json = {
     "model": "websitestats",
     "_id" : [null, "$date", {"date": "$date", "src": "$src"}],
     "count": "$count"
 };*/
 function stat3(json, fn) {
     var where = {};
     if (json.where) {
         where = json.where;
     }
     var result = [];
     db.connect(function() {
         var D = db.getModel(json.model);
         D.bselect(where, function(err, doc) {
             D.group({
                 _id: json._id[0],
                 totalCount: {
                     $sum: json.count
                 },
                 count: {
                     $sum: 1
                 }
             }, function(err, doc) {
                 result[0] = doc;
                 D.group({
                     _id: json._id[1],
                     totalCount: {
                         $sum: json.count
                     },
                     count: {
                         $sum: 1
                     }
                 }, function(err, doc) {
                     result[1] = doc;
                     D.group({
                         _id: json._id[2],
                         totalCount: {
                             $sum: json.count
                         },
                         count: {
                             $sum: 1
                         }
                     }, function(err, doc) {
                         result[2] = doc;
                         fn(null, result);
                     });
                 });
             });
         });
     });
 }
 /*根据id进行分组，id为null表示统计记录数，此外统计count的和*/
 /*_id是一个数组，statX表示_id的长度*/
 /* var json = {
     "model": "websitestats",
     "_id" : [null, {"date": "$date", "src": "$src"}],
     "count": "$count"
 };*/
 function stat2(json, fn) {
     var where = {};
     if (json.where) {
         where = json.where;
     }
     var result = [];
     db.connect(function() {
         var D = db.getModel(json.model);
         D.bselect(where, function(err, doc) {
             D.group({
                 _id: json._id[0],
                 totalCount: {
                     $sum: json.count
                 },
                 count: {
                     $sum: 1
                 }
             }, function(err, doc) {
                 result[0] = doc;
                 D.group({
                     _id: json._id[1],
                     totalCount: {
                         $sum: json.count
                     },
                     count: {
                         $sum: 1
                     }
                 }, function(err, doc) {
                     result[1] = doc;
                     fn(null, result);
                 });
             });
         });
     });
 }
 /*根据id进行分组，id为null表示统计记录数，此外统计count的和*/
 /*_id是一个数组，statX表示_id的长度*/
 /* var json = {
     "model": "websitestats",
     "_id" : [{"date": "$date", "src": "$src"}],
     "count": "$count"
 };*/
 function stat1(json, fn) {
     var where = {};
     if (json.where) {
         where = json.where;
     }
     var result = [];
     db.connect(function() {
         var D = db.getModel(json.model);
         D.bselect(where, function(err, doc) {
             D.group({
                 _id: json._id[0],
                 totalCount: {
                     $sum: json.count
                 },
                 count: {
                     $sum: 1
                 }
             }, function(err, doc) {
                 result[0] = doc;
                 fn(null, result);
             });
         });
     });
 }

 /*resolved by length of json*/
 function statn(json, fn) {
     var where = {};
     if (json.where) {
         where = json.where;
     }
     if (json && json._id && json._id.length && json.model && json.count) {
         var invocation = {
             nexti: 0,
             result: [],
             source: json
         };
         db.connect(function() {
             var D = db.getModel(invocation.source.model);
             D.bselect(where, function(err, doc) {
                 invocation.D = D;
                 recursion(invocation, fn);
             });
         });
     } else {
         fn(null, []);
     }
 }

 function recursion(invocation, fn) {
     if (invocation.source._id.length > 0) {
         if (invocation.nexti >= invocation.source._id.length) { // invalibal nexti
             fn(null, invocation.result);
         } else {
             invocation.D.group({
                 _id: invocation.source._id[invocation.nexti],
                 totalCount: {
                     $sum: invocation.source.count
                 },
                 count: {
                     $sum: 1
                 }
             }, function(err, doc) {
                 if (!err && doc) {
                     invocation.result[invocation.nexti] = doc;
                 } else {
                     invocation.result[invocation.nexti] = {};
                 }
                 invocation.nexti++;
                 recursion(invocation, fn);
             });
         }
     } else {
         fn(null, []);
     }
 }
 module.exports.stat1 = stat1;
 module.exports.stat2 = stat2;
 module.exports.stat3 = stat3;
 module.exports.statn = statn;


 /* var json = {
     "model": "websitestats",
     "_id" : [null, "$date", {"date": "$date", "src": "$src"}],
     "count": "$count"
 };*/
 /*util = require('util'); 
 stat1(json,function(err,result){
     console.log(util.inspect(result,false,3));d
     console.log("message");
 });
 stat2(json,function(err,result){
     console.log(util.inspect(result,false,3));
     console.log("message");
 });
 stat3(json,function(err,result){
     console.log(util.inspect(result,false,3));
     console.log("message");
 });*/