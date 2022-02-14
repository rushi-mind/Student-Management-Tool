const db = require('../../models');
const Joi = require('joi');
const fs = require('fs');

module.exports = (async (req, res) => {
    let input = req.body;

    const schema = Joi.object({
        rollNo: Joi.number().integer().required()
    });
    let isValidInput = true;
    try {
        isValidInput = await schema.validateAsync(input);
    } catch (error) {
        isValidInput = false;
    }
    if(!isValidInput) return res.status(400).send('Invalid JSON input');

    let query = `DELETE FROM students WHERE rollNo = ${input.rollNo};`;

    let response = {};
    try {
        let student = (await db.sequelize.query(`select * from students where rollNo = ${input.rollNo}`))[0];
        if(student.length) {
            let [result, metadata] = await db.sequelize.query(query);
            console.log(result, metadata);
            res.status(200);
            response.status = 'ok';
            response.message = 'Student deleted successfully.';
            response.student = {};
            response.student.rollNo = student.rollNo;
            response.student.firstName = student.firstName;
            response.student.lastName = student.lastName;
            response.student.semester = student.semester;
            response.student.departmentId = student.departmentId;

            try {
                fs.unlinkSync(`public/profile-images/students/${rollNo}.jpg`);
            } catch (error) {
                console.log(error);
            }
        }
        else {
            res.status(400);
            response.status = 'fail';
            response.message = `${input.rollNo}: Student does not exist.`;
        }
    } catch (error) {
        res.status(400);
        response.status = 'fail';
        response.message = error.parent.sqlMessage;
    }
    res.send(response);
});