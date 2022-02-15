const db = require('../../models');
const Joi = require('joi');
const fs = require('fs');

module.exports = (async (req, res) => {
    let input = req.body;
    let response = {};

    const schema = Joi.object({
        rollNo: Joi.number().integer().required()
    });
    let isValidInput = true;
    try {
        isValidInput = await schema.validateAsync(input);
    } catch (error) {
        isValidInput = false;
        response.status = 'fail';
        response.message = error.details[0]['message'];
    }
    if(!isValidInput) return res.status(400).send(response);

    let query = `DELETE FROM students WHERE rollNo = ${input.rollNo};`;

    try {
        let student = (await db.sequelize.query(`select rollNo, firstName, lastName, semester, departmentId from students where rollNo = ${input.rollNo}`))[0][0];
        if(student) {
            await db.sequelize.query(query);
            res.status(200);
            response.status = 'ok';
            response.message = 'Student deleted successfully.';
            response.student = student;
            try {
                fs.unlinkSync(`public/profile-images/students/${student.rollNo}.jpg`);
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