const Joi = require('joi');
const db = require('../../models');
const fs = require('fs');
const responses = require('../responses');

module.exports = (async (req, res) => {
    let params = req.params;
    let response = {};
    let schema = Joi.object({
        id: Joi.number().integer().min(1).required()
    });
    let isValidParams = true;
    try {
        isValidParams = await schema.validateAsync(params);
    } catch (error) {
        isValidParams = false;
        response.message = error.details[0]['message'];
    }
    if(!isValidParams) return responses.validationErrorResponseData(res, response.message, 400);

    let assignment = null;
    try {
        let result = (await db.sequelize.query(`select * from assignments where id = ${params.id};`))[0][0];
        assignment = result;
    } catch (error) {}
    if(!assignment) return responses.errorResponseWithoutData(res, 'Assignment not found', 0, 200);

    try {
        fs.unlinkSync(`public/assignments/${assignment.filePath}`)
    } catch (error) {}

    try {
        await db.sequelize.query(`delete from assignments where id = ${params.id};`);
        responses.successResponseWithoutData(res, 'Assignment deleted successfully', 1);
    } catch (error) {
        responses.errorResponseWithoutData(res, error.parent.sqlMessage, 0, 200);
    }
});