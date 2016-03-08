'use strict';

var HEADER_SIZE = 0x400;
var IP_MASK = 0xFF000000;
var BLOCK_SIZE = 8;
var PARTITION_FACTOR = 22;
var LEN_OFFSET = 7;

/**
 * driver for dat format provided by ipip.net
 * @param {Buffer} buffer file content
 */
var Dat = function Dat(buffer) {
    this.buffer = buffer;
    this.len = buffer.readInt32BE(0);
};

function ipToInt(IP){
    return parseInt(IP.replace(/\d+\.?/ig,function(a){
        a = parseInt(a);
        return (a > 15 ? "" : "0") + a.toString(16);
    }),16);
}



/**
 * lookup an ip
 * @param  {Integer} ip IPv4 address in int
 * @return {Array}    lookup result
 */
Dat.prototype.lookup = function(ip) {
    if(typeof ip == "string"){
        ip = ipToInt(ip);
    }
    var partition = (ip & IP_MASK) >>> PARTITION_FACTOR;

    var floor = this.buffer.readInt32LE(partition + 4) * BLOCK_SIZE + HEADER_SIZE;
    var ceil = this.len - HEADER_SIZE - 4;

    // binary search
    var low = 0;
    var high = Math.floor((ceil - floor) / BLOCK_SIZE);
    var mid;

    while (low <= high) {
        mid = (low + high) >>> 1;
        var offset = floor + mid * BLOCK_SIZE + 4;
        var a = this.buffer.readInt32BE(offset) >>> 0;
        var b = this.buffer.readInt32BE(offset + BLOCK_SIZE) >>> 0;

        if (b < ip) {
            low = mid + 1;
        } else if (a > ip) {
            high = mid - 1;
        } else {
            // found
            offset += BLOCK_SIZE;
            var index = this.buffer.readInt32LE(offset + 4) >>> 0;
            var recordOffset = (index & 0x00FFFFFF) + this.len - HEADER_SIZE;
            var recordLength = this.buffer.readUInt8(offset + LEN_OFFSET);
            return this.buffer.slice(recordOffset, recordOffset + recordLength).toString().split('\t');
        }
    }

    return null;
};

/**
 * record columns
 * @type {Array}
 */
Dat.prototype.columns = ['country', 'province', 'city', 'organization'];

module.exports = Dat;
