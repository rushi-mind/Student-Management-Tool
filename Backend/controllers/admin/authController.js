const db = require('../../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const responses = require('../responses');


/**************************** LOGIN ****************************/

const login = (async (req, res) => {
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
        if(!adminId) return responses.errorResponseWithoutData(res, `Wrong credential. Please correct and try again.`, 0, 200);
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


/**************************** CHANGE PASSWORD ****************************/

const changePassword = (async (req, res) => {
    let input = req.body;
    let response = {};

    const schema = Joi.object({
        oldPassword: Joi.string().min(6).required(),
        newPassword: Joi.string().min(6).required()
    });
    let isValidInput = true;
    try {
        isValidInput = await schema.validateAsync(input);
    } catch (error) {
        isValidInput = false;
        response.message = error.details[0]['message'];
    }
    if(!isValidInput) return responses.validationErrorResponseData(res, response.message, 400);

    let { oldPassword, newPassword } = input;
    
    let actualPassword = await db.Admin.findOne({
        attributes: ['password'],
        where: { adminId: req.admin.adminId }
    });

    let isValidPassword = await bcrypt.compare(oldPassword, actualPassword.password);

    if(isValidPassword) {
        let salt = await bcrypt.genSalt(10);
        let hashedPassword = await bcrypt.hash(newPassword, salt);

        try {
            await db.Admin.update({ password: hashedPassword }, 
                { where: { adminId: req.admin.adminId } 
            });
            response.message = 'Your password has been changed successfully.';
            responses.successResponseWithoutData(res, response.message, 1);
        } catch (error) {
            response.message = error.parent.sqlMessage;
            responses.errorResponseWithoutData(res, response.message, 0, 200);
        }
    }
    else {
        return responses.errorResponseWithoutData(res, 'Old password is wrong. Please enter correct old password.', 0, 200);
    }
});

module.exports = { login, changePassword };