const db = require('../../models');

module.exports = (async (req, res) => {
    let input = req.body;
    let rollNo = input.rollNo, firstName = input.firstName, lastName = input.lastName, email = input.email, 
                password = input.password, semester = input.semester, departmentId = input.departmentId;
    let addQuery = 
        `INSERT INTO students(rollNo, firstName, lastName, email, password, semester, departmentId) VALUES(${rollNo}, "${firstName}", "${lastName}", "${email}", "${password}", ${semester}, ${departmentId});`;

    let response = {};

    try {
        const [result, metadata] = await db.sequelize.query(addQuery);
        console.log(result, metadata);
        res.status(200);
        response.status = 'ok';
        response.input = input;
    } catch (error) {
        res.status(400);
        response.status = 'fail';
        response.error = error.errors;
    }
    res.send(response);
});