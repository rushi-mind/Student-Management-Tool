const Joi = require('joi');
const db = require('../../models');
const fs = require('fs');
const responses = require('../responses');

module.exports = (async (req, res) => {
    let input = req.body;
    let response = {};
    
    const schema = Joi.object({
        id: Joi.number().integer().required(),
        name: Joi.string().required(),
        semester: Joi.number().integer().min(1).max(8).required(),
        departmentId: Joi.number().integer().required(),
        deadline: Joi.date().greater('now').required()
    });
    let isValidInput = true;
    try {
        isValidInput = await schema.validateAsync(input);
    }
    catch(error) {
        isValidInput = false;
        response.message = error.details[0]['message'];
        try {
            fs.unlinkSync(`public/assignments/${req.file.filename}`);
        } catch(error) {
            console.log(error);
        }
    }
    if(!isValidInput) return responses.validationErrorResponseData(res, response.message, 400);



    let obj = (await db.sequelize.query(`select * from assignments where id = ${input.id};`))[0];
    if(!obj.length) {
        try {
            fs.unlinkSync(`public/assignments/${req.file.filename}`);
        } catch(error) {
            console.log(error);
        }
        return responses.errorResponseWithoutData(res, 'Invalid assignment id', 0, 200);
    }

    let { id, name, semester, departmentId, deadline } = input;
    let query = ``;
    if(req.file) query = `UPDATE assignments SET name = "${name}", semester = ${semester}, departmentId = ${departmentId}, deadline = "${deadline}", filePath = "${req.file.filename}" WHERE id = ${id};`;
    else query = `UPDATE assignments SET name = "${name}", semester = ${semester}, departmentId = ${departmentId}, deadline = "${deadline}" WHERE id = ${id};`;

    try {
        await db.sequelize.query(query);
        response.message = 'Assignment updated successfully.';
        responses.successResponseWithoutData(res, response.message, 1);
    } catch (error) {
        response.message = error.parent.sqlMessage;
        responses.errorResponseWithoutData(res, response.message, 0, 200);
    }
});