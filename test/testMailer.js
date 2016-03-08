var nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport({
    "pool": true,
    "host": "smtp.163.com",
    "secure": true,
    "port": 465,
    "auth": {
        "user": "wyyxdgm@163.com",
        "pass": "228209"
    }
});

// setup e-mail data with unicode symbols
var mailOptions = {
    from: '"Fred Foo " <wyyxdgm@163.com>', // sender address
    to: 'jiekuandgm@163.com, wyyxdgm@163.com', // list of receivers
    subject: 'Hello ', // Subject line
    text: 'Hello world ', // plaintext body
    html: '<p style="color:blue;">Hello world </p><b>Hello world </b>', // html body
    "attachments": [{
        "filename": "app.js",
        "path": "./app.js"
    }]
};

// send mail with defined transport object
transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
});