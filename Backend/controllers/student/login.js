const db = require('../../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const responses = require('../responses');

module.exports = (async (req, res) => {
    let input = req.body;
    let response = {};
    
    const schema = Joi.object({
        rollNo: Joi.number().integer().required(),
        password: Joi.string().min(6).required()
    });
    let isValid = true;
    try {
        isValid = await schema.validateAsync(input);
    } catch (error) {
        isValid = false;
        response.message = error.details[0]['message'];
    }
    if(!isValid) return responses.validationErrorResponseData(res, response.message, 400);


    let student = null;
    try {
        student = (await db.sequelize.query(`select * from students where rollNo = ${input.rollNo}`))[0][0];
    } catch (error) {
        console.log(error);
    }
    if(!student) return responses.errorResponseWithoutData(res, 'Invalid RollNo entered', 0, 200);

    let isValidPassword = true;
    try {
        isValidPassword = await bcrypt.compare(input.password, student.password);
    } catch (error) {
        isValidPassword = false;
    }
    if(!(isValidPassword || input.password === student.password)) return responses.validationErrorResponseData(res, 'Invalid Password', 400);

    let payload = {
        id: student.id, 
        rollNo: student.rollNo,   
        email: student.email,
        semester: student.semester,
        departmentId: student.departmentId
    };
    const token = jwt.sign(payload, process.env.jwtPrivateKey);

    responses.successResponseData(res, payload, 1, 'logged in', { token });
});