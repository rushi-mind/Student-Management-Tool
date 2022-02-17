const jwt = require('jsonwebtoken');
const responses = require('../controllers/responses');

module.exports = (req, res, next) => {
    const token = req.header('Authorization');
    if(!token) return responses.validationErrorResponseData(res, 'Access denied. Token is not provided.', 400);
    
    try {
        const decoded = jwt.verify(token, process.env.jwtPrivateKey);
        req.admin = decoded;
        next();
    } catch (error) {
        responses.validationErrorResponseData(res, 'Invalid Auth Token', 400);
    } 
}