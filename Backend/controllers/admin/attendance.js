const db = require('../../models');

module.exports = (async (req, res) => {
    let input = req.body;
    let studentId = input.studentId, date = input.date, status = input.status;

    let query = `INSERT INTO attendance(studentId, date, status) VALUES(${studentId}, "${date}", ${status});`;

    let response = {};
    try {
        let [result, metadata] = await db.sequelize.query(query);
        res.status(200);
        response.status = 'ok';
        response.message = "Inserted successfully!";
    } catch (error) {
        res.status(400);
        response.status = "fail";
        response.message = error.parent.sqlMessage;
    }
    res.send(response);
});