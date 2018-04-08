const nodemailer = require('nodemailer');

const send = (data, resolve, reject) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'pizukurof@gmail.com',
            pass: 'Temp@123'
        }
    });

    // setup email data with unicode symbols
    const mailOptions = {
        from: 'Turvo video renderer',
        to: data.sendTo,
        subject: 'Hello ✔',
        text: 'Hello world?',
        html: '<b>Hello world? Here is your attachment:</b>',
        attachments: [
            {
                filename: 'video.mp4',
                path: data.videoPath
            }
        ]
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            reject(error);
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        resolve(info);
    });
};

module.exports = (data) => new Promise((resolve, reject) => send(data, resolve, reject));
