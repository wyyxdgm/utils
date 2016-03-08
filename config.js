var libDate = require('../lib/date');
var config = {
    winston: {
        exitOnError: false,
        console: {
            colorize: true,
            level: 'debug',
            handleExceptions: true,
            humanReadableUnhandledException: true,
            timestamp: function() {
                return libDate.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss.S');
            },
            formatter: function(options) {
                return options.timestamp() + ' ' + options.level.toUpperCase() + ' ' + (undefined !== options.message ? options.message : '') +
                    (options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '');
            }
        },
        dailyRotateFile: {
            filename: 'log/winston',
            datePattern: '.yyyy-MM-dd.log',
            level: 'debug',
            json: false,
            handleExceptions: true,
            humanReadableUnhandledException: true,
            timestamp: function() {
                return libDate.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss.S');
            }
        }
    }
};
module.exports = config;