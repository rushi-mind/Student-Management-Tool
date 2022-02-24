const db = require('../../models');
const Joi = require('joi');
const responses = require('../responses');

/**************************** FILL ATTENDANCE ****************************/

// fill-attendance route handler
const fillAttendance = (async (req, res) => {
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



/**************************** CHECK ATTENDANCE ****************************/
const checkAttendance = (async (req, res) => {
    let input = req.query;
    let params = req.params;
    let response = {};

    const schemaParams = Joi.object({
        departmentId: Joi.number().integer().min(1).required(),
        semester: Joi.number().integer().min(1).max(8).required()
    });
    const schema = Joi.object({
        dateFrom: Joi.date().required(),
        dateTo: Joi.date().greater(Joi.ref('dateFrom')).required()
    });
    let isValidInput = true;
    try {
        isValidInput = await schema.validateAsync(input);
        isValidInput = await schemaParams.validateAsync(params);
    } catch (error) {
        isValidInput = false;
        response.code = 400;
        response.message = error.details[0]['message'];
    }
    if(!isValidInput) return responses.validationErrorResponseData(res, response.message, response.code);

    
    let { semester, departmentId } = params;
    let { dateFrom, dateTo } = input;

    let query = `
        SELECT students.rollNo, CONCAT(students.firstName, ' ', students.lastName) AS name, attendance.date, attendance.status 
        FROM attendance
        INNER JOIN students ON students.id = attendance.studentId
        WHERE students.semester = ${semester} AND students.departmentId = ${departmentId} AND attendance.date BETWEEN "${dateFrom}" AND "${dateTo}";
    `;
    try {
        let result = (await db.sequelize.query(query))[0];
        if(result.length) responses.successResponseData(res, result, 1, 'Attendance fetched successfully', null);
        else responses.successResponseData(res, result, 1, 'No data found', null);
    } catch (error) {
        console.log(error);
        responses.errorResponseWithoutData(res, error.parent.sqlMessage, 0, 200);
    }
});


/************************************************************************/
module.exports = {
    fillAttendance,
    checkAttendance
};