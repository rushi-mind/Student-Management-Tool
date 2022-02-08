const db = require('../../models');

module.exports = (async (req, res) => {
    let input = req.body;
    let dateRange = input.dateRange, studentId = input.studentId;
    console.log(dateRange, studentId);

    let query = `SELECT * FROM attendance WHERE studentId = ${studentId}`;
    if(dateRange) {
        let from = dateRange.from, to = dateRange.to;
        query += ` AND date BETWEEN "${from}" AND "${to}";`;
    }

    let response = {};
    try {
        let [result, metadata] = await db.sequelize.query(query);
        console.log(result, metadata);
        res.status(200);
        response = result;
    } catch (error) {
        res.status(400);
        response.status = "fail";
        response.message = error.parent.sqlMessage;
    }
    res.send(response);
});