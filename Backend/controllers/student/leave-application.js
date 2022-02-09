const db = require('../../models');

module.exports = (async (req, res) => {
    let input = req.body;
    let studentId = input.studentId, date = input.date, reason = input.reason, isApproved = null;

    if(studentId !== req.student.id) return res.status(400).send('Invalid auth token.');

    let response = {};
    let query = `INSERT INTO leaveApplications(studentId, date, reason, isApproved) VALUES(${studentId},"${date}", "${reason}", null);`;

    try {
        let [result, metadata] = await db.sequelize.query(query);
        response.status = 'ok';
        response.message = 'Applied for leave on ' + date;
    } catch (error) {
        res.status(400);
        response.status = 'fail';
        response.message = error.parent.sqlMessage;
    }

    res.send(response);
});