const Joi = require('joi');
const db = require('../../models');
const responses = require('../responses');

module.exports = (async (req, res) => {
    let params = req.params;
    let response = {};

    if(req.admin.role !== 'admin') return responses.errorResponseWithoutData(res, 'Only admin has access to perform this operation', 0, 200);

    const schema = Joi.object({
        id: Joi.number().integer().required()
    });
    let isValidParams = true;
    try {
        isValidParams = await schema.validateAsync(params);
    } catch (error) {
        isValidParams = false;
        response.message = error.details[0]['message'];
    }
    if(!isValidParams) return responses.validationErrorResponseData(res, response.message, response.code);

    let isValidId = true;
    try {
        let department = (await db.sequelize.query(`select * from departments where id = ${params.id};`))[0][0];
        if(!department) {
            isValidId = false;
            response.message = 'Invalid department id';
        }
    } catch (error) {
        isValidId = false;
        console.log(error);
    }
    if(!isValidId) return responses.errorResponseWithoutData(res, response.message, 0, 200);

    try {
        await db.sequelize.query(`delete from departments where id = ${params.id};`);
        responses.successResponseWithoutData(res, 'Department deleted successfully', 1);
    } catch (error) {
        responses.errorResponseWithoutData(res, error.parent.sqlMessage, 0, 200);
    }
})