const db = require('../../models');
const Joi = require('joi');
const responses = require('../responses');

module.exports = (async (req, res) => {
    let input = req.params;
    let response = {};

    const schema = Joi.object({
        departmentId: Joi.number().integer().min(1).required(),
        semester: Joi.number().integer().min(1).max(8).required()
    });
    let isValidInput = true;
    try {
        isValidInput = await schema.validateAsync(input);
    } catch (error) {
        isValidInput = false;
        response.message = error.details[0]['message'];
    }
    if(!isValidInput) return responses.validationErrorResponseData(res, response.message, 400);


    let { departmentId, semester } = input; 
    try {
        let assignments = await db.Assignment.findAll({
            attributes: [
                'name',
                'semester',
                'departmentId',
                'deadline',
                'filePath'
            ],
            where:{
                semester,
                departmentId,
            },
        });
        let totalRecords = assignments.length;
        if(assignments.length) responses.successResponseData(res, assignments, 1, 'Assignments fetched successfully', { totalRecords });
        else responses.successResponseWithoutData(res, 'No assignments found', 1);


    } catch (error) {
        console.log(error);
        response.message = error.parent.sqlMessage;
        responses.errorResponseWithoutData(res, response.message, 0, 200);
    }
});