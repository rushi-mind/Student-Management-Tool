const Joi = require('joi');
const db = require('../../models');
const responses = require('../responses');

module.exports = (async (req, res) => {
    if(req.admin.role !== 'admin') return responses.errorResponseWithoutData(res, 'Admin only can add/edit teachers', 0, 200);

    let input = req.body;
    let params = req.params;
    let response = {};

    const schemaParams = Joi.object({
        adminId: Joi.number().integer().min(1).required()
    });
    const schema = Joi.object({
        name: Joi.string().required()
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
        let admin = (await db.sequelize.query(`select * from admins where adminId = ${params.adminId};`))[0][0];
        if(!admin) {
            isValidAdminId = false;
            response.message = 'Invalid adminId';
        }
    } catch (error) {
        isValidAdminId = false;
        console.log(error);
    }
    if(!isValidAdminId) return responses.errorResponseWithoutData(res, response.message, 0, 200);

    let { name } = input;
    let { adminId }  = params;

    try {
        await db.sequelize.query(`update admins set name = "${name}" where adminId = ${adminId};`);
        response.message = 'Teacher edited successfully';
        responses.successResponseWithoutData(res, response.message, 1);
    } catch (error) {
        responses.errorResponseWithoutData(res, error.parent.sqlMessage, 0, 200);
    }
});