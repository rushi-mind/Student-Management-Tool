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
        response.code = 400;
        response.message = error.details[0]['message'];
    }
    if(!isValidInput) return responses.validationErrorResponseData(res, response.message, response.code);



    let { departmentId, semester, lectures } = input;

    isValidInput = true;
    try {
        let temp = (await db.sequelize.query(`select * from timetable where departmentId = ${departmentId} and semester = ${semester};`))[0];
        if(temp.length) throw new Error('Timetable already exists');
    } catch (error) {
        isValidInput = false;    
    }
    if(!isValidInput) return responses.errorResponseWithoutData(res, 'Timetable already exists', 0, 200);
    
    let timetableArray = [];
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
        timetableArray.push(obj);
    });

    try {
        db.Timetable.bulkCreate(
            timetableArray, 
            { 
                fields: [
                    'departmentId', 'semester', 'lectureNo', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
                ] 
            }
        );
        responses.successResponseWithoutData(res, 'Timetalbe uploaded sucessfully', 1);
    } catch (error) {
        responses.errorResponseWithoutData(res, error.parent.sqlMessage, 0, 200);
    }
});