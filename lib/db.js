var libDate = require("./date");
var MongoClient = require('mongodb').MongoClient;
var db;
var redis = require("redis"),
    redisClient = redis.createClient();
redisClient.on("error", function(err) {
    console.log("REDIS Error " + err);
});

module.exports.redisClient = redisClient;

module.exports.connect = function(cb) {
    var url = 'mongodb://127.0.0.1:27017/basic';
    if (!db) {
        MongoClient.connect(url, function(err, client) {
            if (err) return cb(err);
            module.exports.client = client;
            db = client;
            cb(err, client);
        });
    } else {
        cb(null);
    }
};
module.exports.getModel = getModel;

function getModel(cname) {
    if (!db) {
        console.log("db connection closed!!");
        return null;
    }
    var model = {};
    var origin = db.collection(cname);
    model.origin = origin;
    /*
	 criteria:
	 $or,$and,$nor: [exp]
	 exp:
	 field: $not:exp,$gt,$lt,$gte,$lte,$eq,$ne,$exists,$in,$nin
	 */
    model.insert = function(doc, fn) {
        //fn: function(err, result)
        //result: {insertedId: "abcdedf"}
        if (!doc) return fn("no doc");
        origin.insertOne(doc, fn);
    };
    model.update = function(criteria, doc, fn) {
        //fn: function(err, result)
        //result: {n: 1}
        origin.updateOne(criteria, {
            $set: doc
        }, function(err, result) {
            var rtn;
            if (result) rtn = result.result;
            else rtn = {
                n: 0
            };
            if (fn) fn(err, rtn);
        });
    };
    model.delete = function(criteria, fn) {
        //fn: function(err, result)
        //result: {n: 1}
        if (!criteria) return fn("no criteria");
        origin.deleteOne(criteria, fn);
    };
    model.select = function(criteria, fn) {
        //fn: function(err, result)
        //result: doc
        origin.findOne(criteria, fn);
    };
    model.binsert = function(docs, fn) {
        //fn: function(err, result)
        //result: {n: 10}
        origin.insertMany(docs, fn);
    };
    model.bupdate = function(criteria, doc, fn) {
        origin.updateMany(criteria, {
            $set: doc
        }, function(err, result) {
            var rtn;
            if (result) rtn = result.result;
            else rtn = {
                n: 0
            };
            if (fn) fn(err, rtn);
        });
    };
    model.bdelete = function(criteria, fn) {
        if (!criteria) {
            fn = criteria;
            criteria = {};
        }
        origin.deleteMany(criteria, fn);
    };
    model.bselect = function(criteria, selectOptions, fn) {
        if (!fn) {
            fn = selectOptions;
            selectOptions = {};
        };
        var aggrarr = [{
            $match: criteria
        }];
        if (selectOptions.$sort && Object.keys(selectOptions.$sort).length > 0)
            aggrarr.push({
                $sort: selectOptions.$sort
            });
        if (selectOptions.$skip)
            aggrarr.push({
                $skip: parseInt(selectOptions.$skip)
            });
        if (selectOptions.$limit)
            aggrarr.push({
                $limit: parseInt(selectOptions.$limit)
            });
        if (selectOptions.$project && Object.keys(selectOptions.$project).length > 0)
            aggrarr.push({
                $project: selectOptions.$project
            });
        origin.aggregate(aggrarr, fn);
    };
    model.count = function(criteria, fn) {
        origin.count(criteria, fn);
    };
    model.bcolect = function(criteria, selectOptions, fn) {
        if (!fn) {
            fn = selectOptions;
            selectOptions = {};
        };
        model.count(criteria, function(err, count) {
            if (err) return fn(err);
            model.bselect(criteria, selectOptions, function(err, data) {
                if (err) return fn(err);
                fn(err, {
                    data: data,
                    count: count
                });
            });
        });
    };
    model.upsert = function(criteria, doc, fn) {
        origin.updateOne(criteria, {
            $set: doc
        }, {
            upsert: true
        }, function(err, result) {
            var rtn;
            if (result) rtn = result.result;
            else rtn = {
                n: 0
            };
            if (fn) fn(err, rtn);
        });
    };
    model.sedate = function(criteria, doc, fn) {
        origin.findAndModify(criteria, [], {
            $set: doc
        }, function(err, doc) {
            if (err) return fn(err);
            if (!doc) return fn(null, doc);
            if (fn) fn(err, doc.value);
        });
    };
    model.update2 = function(criteria, updateParam, fn) {
        origin.updateOne(criteria, updateParam, function(err, result) {
            var rtn;
            if (result) rtn = result.result;
            else rtn = {
                n: 0
            };
            if (fn) fn(err, rtn);
        });
    };
    model.upsert2 = function(criteria, updateParam, fn) {
        origin.updateOne(criteria, updateParam, {
            upsert: true
        }, function(err, result) {
            var rtn;
            if (result) rtn = result.result;
            else rtn = {
                n: 0
            };
            if (fn) fn(err, rtn);
        });
    };
    model.bupdate2 = function(criteria, updateParam, fn) {
        origin.updateMany(criteria, updateParam, function(err, result) {
            var rtn;
            if (result) rtn = result.result;
            else rtn = {
                n: 0
            };
            if (fn) fn(err, rtn);
        });
    };
    model.sedate2 = function(criteria, updateParam, fn) {
        origin.findAndModify(criteria, [], updateParam, function(err, doc) {
            if (err) return fn(err);
            if (!doc) return fn(null, doc);
            if (fn) fn(err, doc.value);
        });
    };


    /*[{a:1},{a:1},{a:2},{a:3}] distinct a:[1,2,3]*/
    model.distinct = function(criteria, fn) {
        origin.distinct(criteria, fn);
    };
    model.group = function(criteria, groupOptions, fn) {
        var aggr;
        if (!fn) {
            aggr = [{
                $group: criteria
            }];
            fn = groupOptions;
        } else {
            aggr = [{
                $match: criteria
            }, {
                $group: groupOptions
            }];
        }
        origin.aggregate(aggr, fn);
    };
    return model;
}