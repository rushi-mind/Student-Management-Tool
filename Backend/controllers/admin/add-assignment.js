const db = require('../../models');

module.exports = async (req, res) => {
    let input = req.body;
    let name = input.name, semester = input.semester, departmentId = input.departmentId, deadline = input.deadline;

    let query = `INSERT INTO assignments(name, semester, departmentId, deadline) VALUES("${name}", ${semester}, ${departmentId}, "${deadline}");`;
    let response = {};
    try {
        const [result, metadata] = await db.sequelize.query(query);
        console.log(result, metadata);
        response.status = 'ok';
        response.input = input;
        res.status(200);
    } catch(error) {
        res.status(400);
        response.status = 'fail';
        response.message = 'Invalid JSON input';
        response.error = error.parent.sqlMessage;
    }
    res.send(response);
};