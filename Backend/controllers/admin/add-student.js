const db = require('../../models');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const responses = require('../responses');

module.exports = (async (req, res) => {
    let input = req.body;
    let response = {};

    if(req.admin.role !== 'admin') return res.status(403).send({ status: 'fail', message: 'Only admin has access to perform this operation' });

    const schema = Joi.object({
        rollNo: Joi.number().integer().required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        semester: Joi.number().integer().min(1).max(8),
        departmentId: Joi.number().integer().min(1),
        address: Joi.string().required(),
        bloodGroup: Joi.string().required()
    });
    let isValidInput = true;
    try {
        isValidInput = await schema.validateAsync(input);
    } catch (error) {
        isValidInput = false;
        response.code = 400;
        response.message = error.details[0]['message'];
    }
    if(!isValidInput) return responses.validationErrorResponseData(res, response.message, response.code);



    let { rollNo, firstName, lastName, email, password, semester, departmentId, address, bloodGroup } = input;

    let salt = await bcrypt.genSalt(10);
    let hashedPassword = await bcrypt.hash(password, salt);

    try {
        await db.Student.create({
            rollNo,
            firstName,
            lastName,
            email,
            password: hashedPassword,
            semester,
            departmentId,
            address,
            bloodGroup
        }, { 
            fields: [
                'rollNo', 'firstName', 'lastName', 'email', 'password', 'semester', 'departmentId', 'address', 'bloodGroup'
            ] 
        });
        response.message = 'Student added successfully';
        response.code = 1;
        responses.successResponseWithoutData(res, response.message, response.code);
    } catch(error) {
        response.message = error.parent.sqlMessage;
        response.code = 0;
        response.status = 200;
        responses.errorResponseWithoutData(res, response.message, response.code, response.status);
    }
});