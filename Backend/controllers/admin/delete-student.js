const db = require('../../models');
const Joi = require('joi');
const fs = require('fs');
const responses = require('../responses');

module.exports = (async (req, res) => {
    let input = req.params;
    let response = {};

    if(req.admin.role !== 'admin') return res.status(403).send({ status: 'fail', message: 'Only admin has access to perform this operation' });

    const schema = Joi.object({
        rollNo: Joi.number().integer().required()
    });
    let isValidInput = true;
    try {
        isValidInput = await schema.validateAsync(input);
    } catch (error) {
        isValidInput = false;
        response.code = 400;
        response.message = error.details[0]['message'];
    }
    if(!isValidInput) return responses.validationErrorResponseData(res, response.message, response.code);



    let query = `DELETE FROM students WHERE rollNo = ${input.rollNo};`;

    try {
        let student = (await db.sequelize.query(`select rollNo, firstName, lastName, semester, departmentId from students where rollNo = ${input.rollNo}`))[0][0];
        if(student) {
            await db.sequelize.query(query);
            response.message = 'Student deleted successfully';
            responses.successResponseWithoutData(res, response.message, 1);
            try {
                fs.unlinkSync(`public/profile-images/students/${student.profileImagePath}`);
            } catch (error) {}
        }
        else {
            response.message = `${input.rollNo}: Student does not exist.`;
            responses.errorResponseWithoutData(res, response.message, 0, 200);
        }
    } catch (error) {
        response.message = error.parent.sqlMessage;
        responses.errorResponseWithoutData(res, response.message, 400);
    }
});