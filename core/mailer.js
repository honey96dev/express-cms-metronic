import nodemailer from 'nodemailer';
import emailTemplates from 'email-templates';
import {server, smtp} from './config';
import sprintfJs from 'sprintf-js';
// const EmailTemplate = emailTemplates.EmailTemplate;


// let transporter = nodeMailer.createTransport({
//     host: smtp.host,
//     port: smtp.port,
//     secure: smtp.secure,
//     auth: {
//         user: smtp.user,
//         pass: smtp.pass
//     }
// });
// let sendVerificationMail = transporter.templateSender(
//     new EmailTemplate('../email_templates/email_verify'), {
//         from: smtp.user,
//     });

const email = new emailTemplates({
    message: {
        from: {
            address: smtp.user,
            name: server.name,
        },
    },
    transport: {
        jsonTransport: true,
    }
});

exports.sendVerificationMail = (to, name, tokenUrl, siteName) => {
    email.render('../email_templates/email_verify/html.pug', {
            name: name,
            tokenUrl: tokenUrl,
        })
        .then((html) => {
            console.log(tokenUrl);
            console.log(html);
            let transporter = nodemailer.createTransport({
                // service: smtp.service,
                host: smtp.host,
                port: smtp.port,
                secure: smtp.secure,
                auth: {
                    user: siteName == "inquilinos" ? smtp.userinquilinos : smtp.userpropietarios, //generated by Mailtrap
                    pass: smtp.pass //generated by Mailtrap
                },
                // tls: {
                //     rejectUnauthorized: false,
                // }
            });

            const mailOptions = {
                from: site == "inquilinos" ? 'Inquilinos Alquilerista' : 'Propietarios Alquilerista',
                to: to,
                subject: '¡Bienvenido a Alquilerista!',
                html: html,
                // text: 'Verify your account',
            };

            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + JSON.stringify(info));
                }
            });
        })
        .catch(console.error);
};

exports.sendResetPasswordMail = (to, name, tokenUrl, site = "") => {
    email.render('../email_templates/reset_password/html.pug', {
            name: name,
            tokenUrl: tokenUrl,
        })
        .then((html) => {
            console.log(tokenUrl);
            console.log(html);
            let transporter = nodemailer.createTransport({
                // service: smtp.service,
                host: smtp.host,
                port: smtp.port,
                secure: smtp.secure,
                auth: {
                    user: site == "inquilinos" ? smtp.userinquilinos : smtp.userpropietarios, //generated by Mailtrap
                    pass: smtp.pass //generated by Mailtrap
                },
                // tls: {
                //     rejectUnauthorized: false,
                // }
            });

            const mailOptions = {
                from:  site == "inquilinos" ? 'Inquilinos Alquilerista' : 'Propietarios Alquilerista',
                to: to,
                subject: '¡Bienvenido a Alquilerista!',
                html: html,
                // text: 'Verify your account',
            };

            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + JSON.stringify(info));
                }
            });
        })
        .catch(console.error);
};
