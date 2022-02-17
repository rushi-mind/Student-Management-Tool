const db = require('../../models');
const Joi = require('joi');
const fs = require('fs');
const responses = require('../responses');

module.exports = async (req, res) => {
    let input = req.body;
    let response = {};

    const schema = Joi.object({
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
        response.code = 400;
        response.message = error.details[0]['message'];
        try {
            fs.unlinkSync(`public/assignments/${req.file.filename}`);
        } catch(error) {
            console.log(error);
        }
    }
    if(!isValidInput) return responses.validationErrorResponseData(res, response.message, response.code);




    let { name, semester, departmentId, deadline } = input;
    let query = ``;
    if(req.file) query = `INSERT INTO assignments(name, semester, departmentId, deadline, filePath) VALUES("${name}", ${semester}, ${departmentId}, "${deadline}", "${req.file.filename}");`;
    else query = `INSERT INTO assignments(name, semester, departmentId, deadline) VALUES("${name}", ${semester}, ${departmentId}, "${deadline}");`;
    
    try {
        await db.sequelize.query(query);
        response.message = 'Assignment inserted successfully';
        response.code = 1;
        responses.successResponseWithoutData(res, response.message, response.code);
    } catch(error) {
        response.message = error.parent.sqlMessage;
        response.code = 0;
        response.status = 200;
        responses.errorResponseWithoutData(res, response.message, response.code, response.status);
    }
};