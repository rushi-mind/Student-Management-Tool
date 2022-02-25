const db = require('../../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const responses = require('../responses');

/**************************** LOGIN ****************************/
const login = (async (req, res) => {
    let input = req.body;
    let response = {};
    
    const schema = Joi.object({
        rollNo: Joi.number().integer().required(),
        password: Joi.string().min(6).required()
    });
    let isValid = true;
    try {
        isValid = await schema.validateAsync(input);
    } catch (error) {
        isValid = false;
        response.message = error.details[0]['message'];
    }
    if(!isValid) return responses.validationErrorResponseData(res, response.message, 400);

    let student = null;
    try {
        student = await db.Student.findOne({ where: { rollNo: input.rollNo } });
    } catch (error) {
        console.log(error);
    }
    if(!student) return responses.errorResponseWithoutData(res, 'Invalid Roll-No.', 0, 200);

    let isValidPassword = true;
    try {
        isValidPassword = await bcrypt.compare(input.password, student.password);
    } catch (error) {
        isValidPassword = false;
    }
    if(!isValidPassword) return responses.validationErrorResponseData(res, 'The password that you have entered is incorrect.', 400);

    let payload = {
        id: student.id, 
        rollNo: student.rollNo,   
        email: student.email,
        semester: student.semester,
        departmentId: student.departmentId
    };
    const token = jwt.sign(payload, process.env.jwtPrivateKey);

    responses.successResponseData(res, payload, 1, 'Logged in successfully.', { token });
});

/**************************** CHANGE PASSWORD ****************************/

// change-password handler
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
    
    let actualPassword = await db.Student.findOne({
        attributes: ['password'],
        where: { rollNo: req.student.rollNo }
    });

    let isValidPassword = await bcrypt.compare(oldPassword, actualPassword.password);

    if(isValidPassword) {
        let salt = await bcrypt.genSalt(10);
        let hashedPassword = await bcrypt.hash(newPassword, salt);

        try {
            await db.Student.update({ password: hashedPassword }, 
                { where: { rollNo: req.student.rollNo } 
            });
            response.message = 'Your password has been changed successfully.';
            responses.successResponseWithoutData(res, response.message, 1);
        } catch (error) {
            response.message = error.parent.sqlMessage;
            responses.errorResponseWithoutData(res, response.message, 0, 200);
        }
    }
    else {
        return responses.validationErrorResponseData(res, 'Old password is wrong. Please enter correct old password.', 400);
    }
});

module.exports = {
    login,
    changePassword
}