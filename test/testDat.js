var fs = require('fs');
var Dat = require('../lib/dat');
var ip = '223.166.91.113';
var dat = new Dat(fs.readFileSync(__dirname + '/../17monipdb.dat'));
var ipInfo = dat.lookup(ip);
console.log(ipInfo);