const db = require('../../models');

module.exports = (async (req, res) => {
    let input = req.body;

    if(req.admin.role !== 'admin') return res.status(403).send(`Teacher cannot add/edit timetable`);

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