const jwt = require('jsonwebtoken');
const responses = require('../controllers/responses');

module.exports = (req, res, next) => {
    let token = req.header('Authorization');
    if(!token) return responses.validationErrorResponseData(res, 'Access denied. Token is not provided.', 400);
    token = token.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.jwtPrivateKey);
        if(!decoded.adminId) throw 'error';
        req.admin = decoded;
        next();
    } catch (error) {
        res.status(401).send({
            message: 'Invalid Auth Token',
            temp: 'temp',
            code: -1
        });
    } 
}