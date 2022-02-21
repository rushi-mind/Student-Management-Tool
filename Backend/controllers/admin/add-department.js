const db = require('../../models');
const Joi = require('joi');
const responses = require('../responses');

module.exports = (async (req, res) => {
    let input = req.body;
    let response = {};

    if(req.admin.role !== 'admin') return responses.errorResponseWithoutData(res, 'Only admin has access to perform this operation', 0, 200);

    const schema = Joi.object({
        name: Joi.string().required()
    });
    let isValidInput = true;
    try {
        isValidInput = await schema.validateAsync(input);
    } catch (error) {
        isValidInput = false;
        response.message = error.details[0]['message'];
    }
    if(!isValidInput) return responses.validationErrorResponseData(res, response.message, response.code);


    try {
        await db.Department.create({
            name: input.name
        }, {
            fields: ['name']
        });
        response.message = 'Department added successfully';
        responses.successResponseWithoutData(res, response.message, 1);
    } catch (error) {
        responses.errorResponseWithoutData(res, error.parent.sqlMessage, 0, 200);
    }
})