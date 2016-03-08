var fs = require('fs');
var _ = require('underscore');
var path = require('path');
var gutil = require('gulp-util');
var chalk = require('chalk');
/*
递归处理文件,文件夹
path 路径
floor 层数
handleFile 文件,文件夹处理函数
*/

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

function handleFileSync(path, floor) {
    var blankStr = '';
    for (var i = 0; i < floor; i++) {
        blankStr += '    ';
    }
    var stats = fs.statSync(path);
    if (stats.isDirectory()) {
        // gutil.log('+' + blankStr + path);
    } else {
        // gutil.log('-' + blankStr + path);
        concatByHtml(path);
    }
}

function resolveSrc(dir) {
    walkSync(dir, 0, handleFileSync);
}

var cssReg = /<\!--\s+build:css\s+([^\?\s]+)\s*-->\s*((<link\s+[^><]*href=(\"([^\"]+)\"|\'([^\']+)\')[^><]*\/?>\s*)*)<!--\s+\/build\s+-->/g;
var jsReg = /<\!--\s+build:js\s+([^\?\s]+)\s*-->\s*((<script\s+[^><]*src=(\"([^\"]+)\"|\'([^\']+)\')[^><]*><\/script>\s*)*)<!--\s+\/build\s+-->/g;
var regScript = /<script\s+[^><]*src=(\"([^\"]+)\"|\'([^\']+)\')[^><]*><\/script>\s*/g;
var regLink = /<link\s+[^><]*href=(\"([^\"]+)\"|\'([^\']+)\')[^><]*\/?>\s*/g;
var cssMin = {};
var jsMin = {};
var minFromHtmlMap = {};
var ignoreCheckMin = {};
var warning = {};
var hasErrInMinFromHtmlMap = false;
var buildDir = path.resolve(__dirname, '../static/build/html/');
var sourceDir = path.resolve(__dirname, '../static/public/html/');
module.exports.concat = function(p_sourceDir, p_buildDir) {
    if (!fs.existsSync(p_sourceDir)) {
        gutil.log("error p_sourceDir:" + p_sourceDir);
        return false;
    }
    console.log(p_buildDir)
    if (!fs.existsSync(p_buildDir)) fs.mkdirSync(p_buildDir);
    buildDir = p_buildDir;
    sourceDir = p_sourceDir;
    resolveSrc(p_sourceDir);
    gutil.log("done!");
    gutil.log("=======================================================");
    gutil.log("-----------------------cssMin------------------------");
    gutil.log(cssMin);
    gutil.log();
    gutil.log("=======================================================")
    gutil.log("-----------------------jsMin------------------------");
    gutil.log(jsMin);
    gutil.log();
    gutil.log("=======================================================")
    if (Object.keys(warning).length) {
        gutil.log("warning for use \"'\" -----------------------------------")
        gutil.log(warning);
        gutil.log();
        gutil.log("=======================================================")
    }
    checkAndShowMinFromHtmlMap();
    return {
        css: cssMin,
        js: jsMin
    }
}

module.exports.check = function(config, keyDir, valueDir) {
    valueDir = valueDir || keyDir;
    var success = true;
    console.log("check source ==> " + keyDir);
    ["css", "js"].forEach(function(cj) {
        var cjconfig = config[cj];
        for (var key in cjconfig) {
            if (!fs.existsSync(path.join(keyDir, key))) {
                success = false;
                console.log("no exists: " + key);
            }
            for (var value in cjconfig[key]) {
                if (!fs.existsSync(path.join(valueDir, value))) {
                    success = false;
                    console.log("no exists: " + value);
                }
            }
        }
    });
    console.log('complete ==> ' + (success ? chalk.blue('success!') : chalk.red('fail!!!')));
}

module.exports.checkResourceByHtml = function(staticPath, buildDir) {
    // TO DO
}


function addWarning(path, minName, minPart) {
    if (!warning[path]) warning[path] = {};
    if (!warning[path][minName]) warning[path][minName] = {};
    warning[path][minName][minPart] = 1;
}

function addMinFromHtmlMap(path, minName, minMap) {
    var pushedWithoutError = false;
    if (!minFromHtmlMap[minName]) minFromHtmlMap[minName] = {};
    var keys = Object.keys(minFromHtmlMap[minName]); //minMap:path
    if (keys.length) {
        for (var i in keys) {
            var _minMap = keys[i];
            if (_.isEqual(_minMap, minMap)) {
                minFromHtmlMap[minName][JSON.stringify(_minMap)].push(path);
                pushedWithoutError = true;
            }
        }
        if (!pushedWithoutError) {
            minFromHtmlMap[minName][JSON.stringify(minMap)] = [path];
            hasErrInMinFromHtmlMap = true;
        }
    } else {
        minFromHtmlMap[minName][JSON.stringify(minMap)] = [path];
        pushedWithoutError = true;
    }
    return pushedWithoutError;
}

function checkAndShowMinFromHtmlMap() {
    if (hasErrInMinFromHtmlMap) {
        gutil.log("\x1b[1;36m发现错误的配置,一个min文件在多个html中配置不一样!!\x1b[0m\n");
        for (var minName in minFromHtmlMap) {
            var minMapPath = minFromHtmlMap[minName];
            var minMapArr = Object.keys(minMapPath);
            if (minMapArr.length > 1) {
                gutil.log("----------------------------------------------------");
                gutil.log("\x1b[1;36m" + minName + "\x1b[0m\n");
                for (var i in minMapArr) {
                    var _minMapStr = i + "\t[" + Object.keys(JSON.parse(minMapArr[i])).join(", ") + "] <-- " + minMapPath[minMapArr[i]].join(", ");
                    gutil.log(_minMapStr);
                }
            }
        }
    }
}

function concatByHtml(htmlPath) {
    var html = fs.readFileSync(htmlPath, "utf-8");
    var cssResult;
    var jsResult;
    var scriptResult;
    var linkResult;
    var isReplaceHtml = true;
    while (cssResult = cssReg.exec(html)) {
        html = html.replace(cssReg, "<link type=\"text/css\" rel=\"stylesheet\" href=\"$1\" />");
        var hasDefined = !!cssMin[cssResult[1]];
        if (hasDefined) {
            var o = {};
            while (linkResult = regLink.exec(cssResult[2])) {
                o[linkResult[2] || linkResult[3]] = 1;
                if (linkResult[3]) {
                    addWarning(htmlPath, cssResult[1], linkResult[3]);
                }
                if (!(linkResult[2] || linkResult[3])) gutil.log("err: ==============================" + cssResult[1])
            }
            // if (!_.isEqual(o, cssMin[cssResult[1]])) {
            //     gutil.log(htmlPath + " !!!");
            //     gutil.log(cssMin[cssResult[1]], o);
            // }
            isReplaceHtml = addMinFromHtmlMap(htmlPath, cssResult[1], o) && isReplaceHtml;
        } else {
            if (!cssMin[cssResult[1]]) cssMin[cssResult[1]] = {};
            while (linkResult = regLink.exec(cssResult[2])) {
                cssMin[cssResult[1]][linkResult[2] || linkResult[3]] = 1;
                if (linkResult[3]) {
                    addWarning(htmlPath, cssResult[1], linkResult[3]);
                }
                if (!(linkResult[2] || linkResult[3])) gutil.log("err: ==============================" + cssResult[1])
            }
            isReplaceHtml = addMinFromHtmlMap(htmlPath, cssResult[1], cssMin[cssResult[1]]) && isReplaceHtml;
        }
    }
    // gutil.log(cssMin);
    while (jsResult = jsReg.exec(html)) {
        html = html.replace(jsReg, "<script type=\"text/javascript\" src=\"$1\"></script>");
        var hasDefined = !!jsMin[jsResult[1]];
        if (hasDefined) {
            var o = {};
            while (scriptResult = regScript.exec(jsResult[2])) {
                o[scriptResult[2] || scriptResult[3]] = 1;
                if (scriptResult[3]) {
                    addWarning(htmlPath, jsResult[1], scriptResult[3]);
                }
                if (!(scriptResult[2] || scriptResult[3])) gutil.log("err: ==============================" + jsResult[1])
            }
            // if (!_.isEqual(o, jsMin[jsResult[1]])) {
            //     gutil.log(htmlPath + " !!!");
            //     gutil.log(jsMin[jsResult[1]], o);
            // }
            isReplaceHtml = addMinFromHtmlMap(htmlPath, jsResult[1], o) && isReplaceHtml;
        } else {
            if (!jsMin[jsResult[1]]) jsMin[jsResult[1]] = {};
            while (scriptResult = regScript.exec(jsResult[2])) {
                jsMin[jsResult[1]][scriptResult[2] || scriptResult[3]] = 1;
                if (scriptResult[3]) {
                    addWarning(htmlPath, jsResult[1], scriptResult[3]);
                }
                if (!(scriptResult[2] || scriptResult[3])) gutil.log("err: ==============================" + jsResult[1])
            }
            isReplaceHtml = addMinFromHtmlMap(htmlPath, jsResult[1], jsMin[jsResult[1]]) && isReplaceHtml;
        }
    }
    var buildHtmlPath = htmlPath.replace(sourceDir, buildDir);
    var dirname = path.dirname(buildHtmlPath);
    if (!fs.existsSync(dirname)) fs.mkdirSync(dirname);
    if (!fs.existsSync(path.dirname(buildHtmlPath))) fs.mkdir(path.dirname(buildHtmlPath));
    if (isReplaceHtml) fs.writeFileSync(buildHtmlPath, html);
    else fs.writeFileSync(buildHtmlPath, fs.readFileSync(htmlPath, 'utf-8'));
}