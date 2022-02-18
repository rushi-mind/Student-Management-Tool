const Joi = require('joi');
const db = require('../../models');
const responses = require('../responses');
const bcrypt = require('bcrypt');

module.exports = (async (req, res) => {

    if(req.admin.role !== 'admin') return responses.errorResponseWithoutData(res, 'Admin only can add/edit teachers', 0, 200);

    let input = req.body;
    let response = {};

    const schema = Joi.object({
        adminId: Joi.number().integer().min(1).required(),
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        role: Joi.string().required(),
        password: Joi.string().required(),
        departmentId: Joi.number().integer().min(1).required(),
    });
    let isValidInput = true;
    try {
        isValidInput = await schema.validateAsync(input);
    } catch (error) {
        isValidInput = false;
        response.message = error.details[0]['message'];
    }
    if(!isValidInput) return responses.validationErrorResponseData(res, response.message, 400);


    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(input.password, salt);

        await db.Admin.create({
            adminId: input.adminId,
            name: input.name,
            email: input.email,
            role: input.role, 
            password: hashedPassword,
            departmentId: input.departmentId
        }, {fields: ['adminId', 'name', 'email', 'role', 'password', 'departmentId']});

        let teacher = (await db.sequelize.query(`select _id, adminId, name, email, role, departmentId from admins where adminId = ${input.adminId};`))[0][0]; 

        responses.successResponseData(res, teacher, 1, 'Teacher added successfully');
    } catch (error) {
        console.log(error);
        response.message = error.parent.sqlMessage;
        responses.errorResponseWithoutData(res, response.message, 0, 200);
    }
});