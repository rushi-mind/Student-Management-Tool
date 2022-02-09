const db = require('../../models');
const bcrypt = require('bcrypt');

module.exports = (async (req, res) => {
    let input = req.body;
    let rollNo = input.rollNo, firstName = input.firstName, lastName = input.lastName, email = input.email, 
                password = input.password, semester = input.semester, departmentId = input.departmentId;

    let salt = await bcrypt.genSalt(10);
    let hashedPassword = await bcrypt.hash(password, salt);
    
    let addQuery = 
        `INSERT INTO students(rollNo, firstName, lastName, email, password, semester, departmentId) VALUES(${rollNo}, "${firstName}", "${lastName}", "${email}", "${hashedPassword}", ${semester}, ${departmentId});`;

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