const db = require('../../models');

module.exports = (async (req, res) => {
    let input = req.body;
    let query = `SELECT rollNo, firstName, lastName, email, semester, departmentId FROM students`;
    if(input.semester && input.departmentId) query += ` WHERE semester = ${input.semester} AND departmentId = ${input.departmentId};`;
    else if(input.semester) query += ` WHERE semester = ${input.semester};`;
    else if(input.departmentId) query += ` WHERE departmentId = ${input.departmentId};`;
    else query += `;`; 

    let response = {};
    try {
        const students = (await db.sequelize.query(query))[0];
        response = students;
    } catch (error) {
        res.status(400);
        response.status = 'fail';
        response.message = error.parent.sqlMessage;
    }
    res.send(response);
});