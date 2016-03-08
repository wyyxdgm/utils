var nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport({
    "pool": true,
    "host": "smtp.163.com",
    "secure": true,
    "port": 465,
    "auth": {
        "user": "testmailer001@163.com",
        "pass": "testmailer"
    }
});

// setup e-mail data with unicode symbols
var mailOptions = {
    from: '"Fred Foo " <jiekuandgm@163.com>', // sender address
    to: 'jiekuandgm@163.com', // list of receivers
    subject: 'Hello ', // Subject line
    text: 'Hello world ', // plaintext body
    html: '<p style="color:blue;">Hello world </p><b>Hello world </b>', // html body
    "attachments": [{
        "filename": "testMailer.js",
        "path": __dirname + "/testMailer.js"
    }]
};

// send mail with defined transport object
transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
});