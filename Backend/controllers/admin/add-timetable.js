const db = require('../../models');

module.exports = (async (req, res) => {
    let input = req.body;
    let departmentId = input.departmentId, semester = input.semester, lectures = input.lectures;

    let response = {};
    lectures.forEach(async (lecture) => {
        let obj = {
            departmentId: departmentId,
            semester: semester,
            lectureNo: lecture.lectureNo,
            Monday: lecture.Monday,
            Tuesday: lecture.Tuesday,
            Wednesday: lecture.Wednesday,
            Thursday: lecture.Thursday,
            Friday: lecture.Friday
        };
        try {
            let temp = await db.Timetable.create(obj, { fields: ['departmentId', 'semester', 'lectureNo', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] });
        } catch (error) {
            res.status(400);
            response.status = 'fail';
            response.message = error.parent.sqlMessage;
            res.send(response);
            return;
        }
    });
    response.status = 'ok';
    response.message = 'Timetalbe uploaded sucessfully.';

    res.send(response);
});