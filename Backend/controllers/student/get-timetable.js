const db = require('../../models');

module.exports = (async (req, res) => {
    let input = req.body;
    let semester = input.semester, departmentId = input.departmentId;
    let response = {};
    let query = `SELECT lectureNo, Monday, Tuesday, Wednesday, Thursday, Friday FROM timetable WHERE semester = ${semester} AND departmentId = ${departmentId};`;

    try {
        let [result, metadata] = await db.sequelize.query(query);
        response = result;
    } catch (error) {
        res.status(400);
        response.status = 'fail';
        response.message = error.parent.sqlMessage;
    }

    res.send(response);
});