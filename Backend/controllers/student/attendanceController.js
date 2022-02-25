const db = require('../../models');
const Joi = require('joi');
const responses = require('../responses');

module.exports = (async (req, res) => {
    let input = req.query;
    let response = {};

    const schema = Joi.object({
        from: Joi.date().required(),
        to: Joi.date().greater(Joi.ref('from')).required()
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
        let result = await db.Attendance.findAll({
            attributes: ['date', 'status'],
            where: {
                studentId: req.student.id,
                date: { [db.Sequelize.Op.between]: [input.from, input.to] }
            }
        });
        let totalRecords = result.length;
        response.data = result;
        responses.successResponseData(res, result, 1, 'Attendance fetched successfully', { totalRecords });
    } catch (error) {
        response.message = error.parent.sqlMessage;
        responses.errorResponseWithoutData(res, response.message, 0, 200);
    }
});