const db = require('../../models');
const Joi = require('joi');
const responses = require('../responses');

module.exports = (async (req, res) => {
    let input = req.body;
    let response = {};

    const schema = Joi.object({
        date: Joi.date().required(),
        presentIDs: Joi.array().required(),
        departmentId: Joi.number().integer().min(1).required(),
        semester: Joi.number().integer().min(1).max(8).required()
    });
    let isValidInput = true;
    try {
        isValidInput = await schema.validateAsync(input);
    } catch (error) {
        isValidInput = false;
        response.code = 400;
        response.message = error.details[0]['message'];
    }
    if(!isValidInput) return responses.validationErrorResponseData(res, response.message, response.code);


    let { date, presentIDs, departmentId, semester } = input;

    isValidInput = true;
    let absentIDs = [];
    try {
        let tempIDs = (await db.sequelize.query(`select id from students where semester = ${semester} and departmentId = ${departmentId} order by id;`))[0];
        tempIDs.forEach((current) => {
            absentIDs.push(current.id);
        });
    } catch (error) {
        isValidInput = false;
        response.message = error.parent.sqlMessage;
    }
    if(!isValidInput) return responses.errorResponseWithoutData(res, response.message, 0, 200);


    presentIDs.forEach(current => {
        let index = absentIDs.indexOf(current);
        if(index === -1) presentIDs.splice(presentIDs.indexOf(current), 1);
        else absentIDs.splice(index, 1);
    });

    let presentStudentsObject = [];
    let absentStudentsObject = [];

    presentIDs.forEach(current => {
        presentStudentsObject.push({ studentId: current, date, status: 1 });
    });
    absentIDs.forEach(current => {
        absentStudentsObject.push({ studentId: current, date, status: 0 });
    });

    try {
        await db.Attendance.bulkCreate(presentStudentsObject, { fields: ['studentId', 'date', 'status'] })
        .then(() => {});
        await db.Attendance.bulkCreate(absentStudentsObject, { fields: ['studentId', 'date', 'status'] })
        .then(() => {});
        responses.successResponseWithoutData(res, "Attendace inserted successfully", 1);
    } catch (error) {
        console.log(error);
        responses.errorResponseWithoutData(res, error.parent.sqlMessage, 0, 200);
    }
});