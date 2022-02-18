const Joi = require('joi');
const db = require('../../models');
const responses = require('../responses');

module.exports = (async (req, res) => {
    if(req.admin.role !== 'admin') return responses.errorResponseWithoutData(res, 'Admin only can add/edit teachers', 0, 200);

    let input = req.body;
    let params = req.params;
    let response = {};

    const schemaParams = Joi.object({
        id: Joi.number().integer().min(1).required()
    });
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        role: Joi.string().required(),
        departmentId: Joi.number().integer().min(1).required(),
    });
    let isValidInput = true;
    try {
        isValidInput = await schema.validateAsync(input);
        isValidInput = await schemaParams.validateAsync(params);
    } catch (error) {
        isValidInput = false;
        response.message = error.details[0]['message'];
    }
    if(!isValidInput) return responses.validationErrorResponseData(res, response.message, 400);

    let isValidAdminId = true;
    try {
        let admin = (await db.sequelize.query(`select * from admins where _id = ${params.id};`))[0][0];
        if(!admin) {
            isValidAdminId = false;
            response.message = 'Invalid admin id';
        }
    } catch (error) {
        isValidAdminId = false;
        console.log(error);
    }
    if(!isValidAdminId) return responses.errorResponseWithoutData(res, response.message, 0, 200);

    let { name, email, role, departmentId } = input;
    let { id }  = params;

    try {
        await db.Admin.update({
            name, email, role, departmentId
        }, {
            where: {
                _id: id
            }
        });
        response.message = 'Teacher edited successfully';
        responses.successResponseWithoutData(res, response.message, 1);
    } catch (error) {
        responses.errorResponseWithoutData(res, error.parent.sqlMessage, 0, 200);
    }
});