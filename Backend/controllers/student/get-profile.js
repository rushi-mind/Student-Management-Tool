const db = require('../../models');
const Joi = require('joi');

module.exports = (async (req, res) => {
    let input = req.body;

    if(input.rollNo !== req.student.rollNo) return res.status(400).send('Invalid auth token');

    const schema = Joi.object({
        rollNo: Joi.number().integer().required()
    });
    let isValid = true;
    try {
        isValid = await schema.validateAsync(input);
    } catch (error) {
        isValid = false;
    }
    if(!isValid) return res.status(400).send('Invalid JSON input');

    let response = {};


    let query = `SELECT rollNo, firstName, lastName, email, semester, departmentId, address, bloodGroup, profileImagePath FROM students WHERE rollNo = ${input.rollNo};`;

    try {
        let [result, metadata] = await db.sequelize.query(query);
        if(!result.length) {
            res.status(400);
            response.status = 'fail';
            response.message = 'Student does not exist';
            res.send(response);
            return;
        }
        response.rollNo = result[0].rollNo;
        response.firstName = result[0].firstName;
        response.lastName = result[0].lastName;
        response.email = result[0].email;
        response.semester = result[0].semester;
        response.address = result[0].address;
        response.bloodGroup = result[0].bloodGroup;
        let department = (await db.sequelize.query(`select name from departments where id = ${result[0]['departmentId']};`))[0];
        response.department = department[0].name;
        if(!result[0].profileImagePath) response.profileImage = `http://192.168.1.169:5000/profile-images/default.png`;
        else response.profileImage = `http://192.168.1.169:5000/profile-images/students/${result[0].profileImagePath}`;
    } catch (error) {
        res.status(400);
        response.status = 'fail';
        response.message = 'Invalid JSON input';
        res.send(response);
        return;
    }

    res.send(response);
});