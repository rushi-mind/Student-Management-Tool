const jwt = require('jsonwebtoken');
const responses = require('../controllers/responses');
const db = require('../models');

module.exports = async (req, res, next) => {
    let token = req.header('Authorization');
    if(!token) return responses.validationErrorResponseData(res, 'Access denied. Token is not provided.', 400);
    token = token.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.jwtPrivateKey);
        if(!decoded.rollNo) throw 'error';
        let student = await db.Student.findOne({ where: { rollNo: decoded.rollNo } });
        if(!student) throw 'error';
        req.student = student;
        next();
    } catch (error) {
        if(error === 'error') res.send('invalid auth token');
        else res.status(401).send({
            message: 'Invalid Auth Token',
            code: -1
        });
    }
}