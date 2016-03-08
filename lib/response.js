var fs = require("fs");

function sendErr(res, msg, code) {
    if (typeof msg == "object")
        msg = JSON.stringify(msg, undefined);
    if (code)
        res.send({
            error: msg,
            errorCode: code
        });
    else
        res.send({
            error: msg
        });
}

function sendJson(res, json) {
    res.send(json);
}

function sendFile(res, file) {
    if (!fs.existsSync(file))
        res.status(404).send({
            message: "not found"
        });
    else
        fs.createReadStream(file).pipe(res);
}

function sendImage(res, file) {
    sendFile(res, file);
}

module.exports.sendErr = sendErr;
module.exports.sendJson = sendJson
module.exports.sendFile = sendFile;
module.exports.sendImage = sendImage;