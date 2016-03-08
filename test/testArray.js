var array = require('../lib/array');
var arr = [1, 2, 3, 4, 5];
array.pushIfNotExists(arr, 1);
console.log(arr);
array.pushIfNotExists(arr, 's');
console.log(arr);
var index = array.indexOf(arr, 3);
console.log(index);