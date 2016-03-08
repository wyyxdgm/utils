var winston = require('winston');
var config = require('../config');


exports.thirdlogger = new winston.Logger({
    exitOnError: config.winston.exitOnError,
    transports: [
        new(winston.transports.Console)(config.winston.console),
        new(require('winston-daily-rotate-file'))(config.winston.dailyRotateFile)
    ]
});

["debug", "info", "error", "warn"].forEach(function(level) {
    exports[level] = function(logdata) {
        exports.thirdlogger[level].apply(exports.thirdlogger, arguments);
    };
});