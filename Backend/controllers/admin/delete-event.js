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
    let isValidInput = true;
    try {
        isValidInput = await schema.validateAsync(params);
    } catch (error) {
        isValidInput = false;
        response.code = 400;
        response.message = error.details[0]['message'];
    }
    if(!isValidInput) return responses.validationErrorResponseData(res, response.message, response.code);

    let isValidId = true;
    try {
        let admin = (await db.sequelize.query(`select * from events where id = ${params.id};`))[0][0];
        if(!admin) {
            isValidId = false;
            response.message = 'Invalid event id';
        }
    } catch (error) {
        isValidId = false;
        console.log(error);
    }
    if(!isValidId) return responses.errorResponseWithoutData(res, response.message, 0, 200);

    try {
        await db.sequelize.query(`delete from events where id = ${params.id};`);
        responses.successResponseWithoutData(res, 'Event deleted successfully', 1);
    } catch (error) {
        responses.errorResponseWithoutData(res, 'error.parent.sqlMessage', 0, 200);
    }
});