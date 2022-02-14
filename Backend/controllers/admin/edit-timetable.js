const db = require('../../models');

module.exports = (async (req, res) => {
    let input = req.body;

    if(req.admin.role !== 'admin') return res.status(403).send(`Teacher cannot add/edit timetable`);

    let semester = input.semester, departmentId = input.departmentId, lectures = input.lectures;
    let response = {};
    let IDs = [];
    let tempIDs;
    try {
        tempIDs = (await db.sequelize.query(`select id from timetable where semester = ${semester} and departmentId = ${departmentId};`))[0];
    } catch (error) {
        res.status(400);
        response.status = 'fail';
        response.message = "Invalid JSON input";
        res.send(response);
        return;
    }
    
    if(!IDs.length) {
        res.status(400);
        response.status = 'fail';
        response.message = "Timetable does not exist.";
        res.send(response);
        return;
    }

    let i = 0;
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
            await db.Timetable.update(obj, {where: {id:IDs[i++]}});
        } catch (error) {
            res.status(400);
            response.status = 'fail';
            response.message = error;
            console.log(error);
            res.send(response);
            return;
        }
    });
    response.status = 'ok';
    response.message = 'Timetalbe updated successfully.';

    res.send(response);
});