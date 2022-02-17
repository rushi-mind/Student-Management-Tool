const db = require('../../models');
const Joi = require('joi');
const responses = require('../responses');

module.exports = (async (req, res) => {
    let input = req.body;
    let response = {};

    if(req.admin.role !== 'admin') return res.status(403).send({ status: 'fail', message: 'Admin only can ADD/EDIT timetables' });

    const schema = Joi.object({
        departmentId: Joi.number().integer().min(1).required(),
        semester: Joi.number().integer().min(1).max(8).required(),
        lectures: Joi.array().required()
    });
    let isValidInput = true;
    try {
        isValidInput = await schema.validateAsync(input); 
    } catch (error) {
        isValidInput = false;
        response.message = error.details[0]['message'];
    }
    if(!isValidInput) return responses.validationErrorResponseData(res, response.message, 400);


    let { departmentId, semester, lectures } = input;
    let IDs = [];
    let tempIDs;

    isValidInput = true;
    try {
        tempIDs = (await db.sequelize.query(`select id from timetable where semester = ${semester} and departmentId = ${departmentId};`))[0];
    } catch (error) {
        isValidInput = false;
        response.message = "Invalid JSON input";
    }
    if(!isValidInput) return responses.errorResponseWithoutData(res, response.message, 0, 200);
    
    tempIDs.forEach(current => {
        IDs.push(current.id);
    });
    
    if(!IDs.length) {
        response.message = "Timetable does not exist.";
        return responses.errorResponseWithoutData(res, response.message, 0, 200);
    }

    let i = 0;
    lectures.forEach(async (lecture) => {
        let obj = {
            departmentId,
            semester,
            lectureNo: lecture.lectureNo,
            Monday: lecture.Monday,
            Tuesday: lecture.Tuesday,
            Wednesday: lecture.Wednesday,
            Thursday: lecture.Thursday,
            Friday: lecture.Friday
        };
        await db.Timetable.update(obj, {where: {id:IDs[i++]}});
    });
    response.message = 'Timetalbe updated successfully.';
    return responses.successResponseWithoutData(res, response.message, 1);
});