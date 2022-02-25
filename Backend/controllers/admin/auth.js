const db = require('../../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const responses = require('../responses');

module.exports = (async (req, res) => {
    let input = req.body;
    let response = {};

    const schema = Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required()
    });
    let isValidInput = true;
    try {
        isValidInput = await schema.validateAsync(input);
    }
    catch(error) {
        isValidInput = false;
        response.message = error.details[0]['message'];
    }
    if(!isValidInput) return responses.validationErrorResponseData(res, response.message, 400);
    
    let { username, password } = input;
    let email = null, adminId = null;
    if(username.includes('@')) email = username;
    else adminId = username;

    if(adminId) {
        adminId = parseInt(adminId);
        if(!adminId) return responses.validationErrorResponseData(res, `Wrong credential. Please correct and try again.`, 400);
    }

    let admin = null;
    try {
        if(email) admin = await db.Admin.findOne({ where: { email } });
        else admin = await db.Admin.findOne({ where: { adminId } });
    } catch (error) {
        console.log(error);
    }
    if(!admin) return responses.errorResponseWithoutData(res, 'Wrong credential. Please correct and try again.', 0, 200);

    let isValidPassword = await bcrypt.compare(password, admin.password);
    if(!(isValidPassword || (password === admin.password))) return responses.errorResponseWithoutData(res, 'The password that you have entered is incorrect.', 0, 200);

    const payload = {
        _id: admin._id,
        adminId: admin.adminId,
        email: admin.email,
        role: admin.role
    };
    const token = jwt.sign(payload, process.env.jwtPrivateKey);
    responses.successResponseData(res, payload, 1, 'Logged in successfully.', { token });
});