const db = require('../../models');

module.exports = (async (req, res) => {
    let input = req.body;
    let response = {};
    let query = `SELECT rollNo, firstName, lastName, email, semester, departmentId FROM students WHERE rollNo = ${input.rollNo}`;

    try {
        let [result, metadata] = await db.sequelize.query(query);
        if(!result.length) {
            res.status(400);
            response.status = 'fail';
            response.message = 'Student does not exist.';
            res.send(response);
            return;
        }
        response = result[0];
    } catch (error) {
        res.status(400);
        response.status = 'fail';
        response.message = 'Invalid JSON input.';
        res.send(response);
        return;
    }
    let department = (await db.sequelize.query(`select name from departments where id = ${response['departmentId']};`))[0];
    response.department = department[0].name;

    res.send(response);
});