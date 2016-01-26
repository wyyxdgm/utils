/**
 * 异步递归处理文件,文件夹
 * @author daiguimao
 * @DateTime 2016-01-26T13:13:37+0800
 * @param    {string}                       path            路径
 * @param    {int}                          floor           层数
 * @param    {function(path,floor)}         handleFile      文件夹处理函数
 * @return   {none}
 */

module.exports.walk = walk;

function walk(path, floor, handleFile) {
    handleFile(path, floor);
    floor++;
    fs.readdir(path, function(err, files) {
        if (err) {
            console.log('read dir error!');
        } else {
            files.forEach(function(item) {
                var tmpPath = path + '/' + item;
                fs.stat(tmpPath, function(err1, stats) {
                    if (err1) {
                        console.log('stat error');
                    } else {
                        if (stats.isDirectory()) {
                            walk(tmpPath, floor, handleFile);
                        } else {
                            handleFile(tmpPath, floor);
                        }
                    }
                });
            });
        }
    });
}

/**
 * 同步递归处理文件,文件夹
 * @author daiguimao
 * @DateTime 2016-01-26T13:13:37+0800
 * @param    {string}                       path            路径
 * @param    {int}                          floor           层数
 * @param    {function(path,floor)}         handleFile      文件夹处理函数
 * @return   {none}
 */
module.exports.walkSync = walkSync;

function walkSync(path, floor, handleFileSync) {
    handleFileSync(path, floor);
    floor++;
    var files = fs.readdirSync(path);
    for (var i = 0; i < files.length; i++) {
        var item = files[i];
        var tmpPath = path + '/' + item;
        var stats = fs.statSync(tmpPath);
        if (stats.isDirectory()) {
            walkSync(tmpPath, floor, handleFileSync);
        } else {
            handleFileSync(tmpPath, floor);
        }
    }
}