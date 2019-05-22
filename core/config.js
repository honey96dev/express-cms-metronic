module.exports = {
    server: {
        port: 3000,
        baseUrl: 'http://127.0.0.1:3000/',
        name: 'CMS',
    },
    mysql: {
        connectionLimit: 10,
        host: '127.0.0.1',
        user: 'root',
        password: '',
        database: 'express_cms',
        port: 3306
    },
    session: {
        secret: 'expresscmstoken@@'
    },
    smtp: {
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        user: 'honey96dev@gmail.com',
        pass: 'skdmlEmail@123456',
    }
};
