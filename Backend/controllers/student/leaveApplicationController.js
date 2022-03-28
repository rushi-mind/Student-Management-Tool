const db = require('../../models');
const Joi = require('joi');
const responses = require('../responses');

// function to count duration between two dates in days
const getDateDifferenceInDays = async (dateFrom, dateTo) => {
    let duration = null;
    try {
        duration = (await db.sequelize.query(`select DATEDIFF("${dateTo}", "${dateFrom}") as duration;`))[0][0].duration;
    } catch (error) {
        console.log(error);
    }
    return duration+1;
}

const applyForLeave = (async (req, res) => {
    let input = req.body;
    let response = {};

    let { date, reason } = input;
    let dateFrom = date.from, dateTo = date.to;

    const schema = Joi.object({
        date: Joi.object({
            from: Joi.date().greater('now').required(),
            to: Joi.date().min(Joi.ref('from')).required()
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
    try {
        await db.LeaveApplication.create({
            studentId: req.student.id,
            dateFrom,
            dateTo,
            duration,
            reason
        }, {
            fields: ['studentId', 'dateFrom', 'dateTo', 'duration', 'reason']
        });
        response.message = `Applied for leave successfully from ${dateFrom} to ${dateTo}`;
        responses.successResponseWithoutData(res, response.message, 1);
    } catch (error) {
        response.message = error.parent.sqlMessage;
        responses.errorResponseWithoutData(res, response.message, 0, 200);
    }
});


const getApplications = (async (req, res) => {
    let studentId = req.student.id;
    let filter = req.params.filter;
    let data = null;

    if(filter === 'all') data = await db.LeaveApplication.findAll({ where: { studentId } });
    else if(filter === 'approved') data = await db.LeaveApplication.findAll({ where: { studentId, isApproved: 1 } });
    else if(filter === 'rejected') data = await db.LeaveApplication.findAll({ where: { studentId, isApproved: 0 } });
    else if(filter === 'pending') data = await db.LeaveApplication.findAll({ where: { studentId, isApproved: null } });
    else return responses.errorResponseWithoutData(res, 'Invalid request parameter', 0, 200);

    const totalRecords = data.length;
    responses.successResponseData(res, data, 1, 'Leave Applications fetched successfully.', { totalRecords });
});

module.exports = { applyForLeave, getApplications };