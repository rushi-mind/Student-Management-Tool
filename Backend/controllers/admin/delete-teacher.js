const Joi = require('joi');
const db = require('../../models');
const responses = require('../responses');

module.exports = (async (req, res) => {
    let params = req.params;
    let response = {};

    if(req.admin.role !== 'admin') return res.status(403).send({ status: 'fail', message: 'Only admin has access to perform this operation' });

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
    if(!isValidParams) return responses.validationErrorResponseData(res, response.message, 400);


    let isvalidId = true;
    try {
        let result = (await db.sequelize.query(`select * from admins where _id = ${params.id};`))[0][0];
        if(!result) isvalidId = false;
    } catch (error) {}

    if(!isvalidId) return responses.errorResponseWithoutData(res, 'Invalid admin id', 0, 200);

    try {
        await db.sequelize.query(`delete from admins where _id = ${params.id};`);
        responses.successResponseWithoutData(res, 'Teacher deleted successfully', 1);
    } catch (error) {
        responses.errorResponseWithoutData(res, error.parent.sqlMessage, 0, 200);
    }
});