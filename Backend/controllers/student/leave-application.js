const db = require('../../models');
const Joi = require('joi');
const responses = require('../responses');

const getDateDifferenceInDays = async (dateFrom, dateTo) => {
    let duration = null;
    try {
        duration = (await db.sequelize.query(`select DATEDIFF("${dateTo}", "${dateFrom}") as duration;`))[0][0].duration;
    } catch (error) {
        console.log(error);
    }
    return duration+1;
}

module.exports = (async (req, res) => {
    let input = req.body;
    let response = {};

    let { date, reason } = input;
    let dateFrom = date.from, dateTo = date.to;

    const schema = Joi.object({
        date: Joi.object({
            from: Joi.date().greater('now').required(),
            to: Joi.date().greater(Joi.ref('from')).required()
        }).required(),
        reason: Joi.string().required()
    });
    let isValidInput = true;
    try {
        isValidInput = await schema.validateAsync(input);
    } catch (error) {
        isValidInput = false;
        response.message = error.details[0]['message'];
    }
    if(!isValidInput) return responses.validationErrorResponseData(res, response.message, 400);


    const duration = await getDateDifferenceInDays(dateFrom, dateTo);

    let query = `INSERT INTO leaveApplications(studentId, dateFrom, dateTo, duration, reason, isApproved) VALUES(${req.student.id},"${dateFrom}", "${dateTo}", ${duration}, "${reason}", null);`;

    try {
        await db.sequelize.query(query);
        response.message = `Applied for leave from ${dateFrom} to ${dateTo}`;
        responses.successResponseWithoutData(res, response.message, 1);
    } catch (error) {
        response.message = error.parent.sqlMessage;
        responses.errorResponseWithoutData(res, response.message, 0, 200);
    }
});