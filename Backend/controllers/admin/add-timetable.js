const db = require('../../models');
const Joi = require('joi');

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
        response.status = 'fail';
        response.message = error.details[0]['message'];
    }
    if(!isValidInput) return res.status(400).send(response);

    let { departmentId, semester, lectures } = input;

    isValidInput = true;
    try {
        let temp = (await db.sequelize.query(`select * from timetable where departmentId = ${departmentId} and semester = ${semester};`))[0];
        if(temp.length) throw new Error('Timetable already exists');
    } catch (error) {
        isValidInput = false;
        response.status = 'fail';
        response.message = 'Timetable already exists';
    }
    if(!isValidInput) return res.status(400).send(response);
    
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
        let isSuccess = true;
        try {
            let temp = await db.Timetable.create(obj, { fields: ['departmentId', 'semester', 'lectureNo', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] });
        } catch (error) {
            isSuccess = false;
            res.status(400);
            response.status = 'fail';
            response.message = error.parent.sqlMessage;
        }
        if(!isSuccess) return res.status(400).send(response);
    });
    response.status = 'ok';
    response.message = 'Timetalbe uploaded sucessfully.';

    res.send(response);
});