const db = require('../../models');

module.exports = (async (req, res) => {
    let input = req.body;
    let response = {};
    let query = `SELECT date, status FROM attendance WHERE studentId = ${input.studentId}`;

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