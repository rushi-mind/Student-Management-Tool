const db = require('../../models');
const responses = require('../responses');
const Joi = require('joi');

const getApplications = (async (req, res) => {
    let filter = req.params.filter;
    let sql = ``;
    if(filter === 'all') {
        sql = 
        `SELECT leaveApplications.id, leaveApplications.studentId, CONCAT(students.firstName, ' ', students.lastName) as name, students.semester, dateFrom, dateTo, duration, reason, isApproved FROM leaveApplications JOIN students ON students.id = leaveApplications.studentId;`;
    }
    else if(filter === 'approved') {
        sql = 
        `SELECT leaveApplications.id, leaveApplications.studentId, CONCAT(students.firstName, ' ', students.lastName) as name, students.semester, dateFrom, dateTo, duration, reason, isApproved FROM leaveApplications JOIN students ON students.id = leaveApplications.studentId WHERE isApproved = 1;`;
    }
    else if(filter === 'rejected') {
        sql = 
        `SELECT leaveApplications.id, leaveApplications.studentId, CONCAT(students.firstName, ' ', students.lastName) as name, students.semester, dateFrom, dateTo, duration, reason, isApproved FROM leaveApplications JOIN students ON students.id = leaveApplications.studentId WHERE isApproved = 0;`;
    }
    else if(filter === 'pending') {
        sql = 
        `SELECT leaveApplications.id, leaveApplications.studentId, CONCAT(students.firstName, ' ', students.lastName) as name, students.semester, dateFrom, dateTo, duration, reason, isApproved FROM leaveApplications JOIN students ON students.id = leaveApplications.studentId  WHERE isApproved IS NULL;`;
    }
    else return responses.errorResponseWithoutData(res, 'Invalid request parameter', 0, 200);

    let data = null;
    let totalRecords = null;
    try {
        data = (await db.sequelize.query(sql))[0];
        totalRecords = data.length;
    } catch (error) {
        console.log(error);
    }

    if(!data) return responses.errorResponseWithoutData(res, 'Something went wrong. Please try again.', 0, 200);

    responses.successResponseData(res, data, 1, 'Applications fetched successfully.', { totalRecords });
});

const approveOrRejectApplications = (async (req, res) => {
    let input = req.body;
    let response = {};
    const schema = Joi.object({
        IDs: Joi.array().required(),
        action: Joi.boolean().required()
    });
    let isValidInput = true;
    try {
        isValidInput = await schema.validateAsync(input);
    } catch (error) {
        isValidInput = null;
        response.message = error.details[0]['message'];
    }
    if(!isValidInput) return responses.validationErrorResponseData(res, response.message, 400);

    let { IDs, action } = input;
    if(action) action = 1;
    else action = 0;
    try {
        await db.LeaveApplication.update({
                isApproved: action
            }, {
                where: { id: IDs }
            }
        );
        response.message = 'Operation performed successfully.';
        responses.successResponseWithoutData(res, response.message, 1);
    } catch (error) {
        console.log(error);
        response.message = 'Something went wrong. Please try again.';
        responses.errorResponseWithoutData(res, response.message, 0, 200);
    }
});

module.exports = { getApplications, approveOrRejectApplications };