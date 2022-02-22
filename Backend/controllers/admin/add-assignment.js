const db = require('../../models');
const Joi = require('joi');
const fs = require('fs');
const responses = require('../responses');

module.exports = async (req, res) => {
    let input = req.body;
    let params = req.params;
    let response = {};

    const schemaParams = Joi.object({
        departmentId: Joi.number().integer().min(1).required(),
        semester: Joi.number().integer().min(1).max(8).required()
    });
    const schema = Joi.object({
        name: Joi.string().required(),
        deadline: Joi.date().greater('now').required()
    });
    let isValidInput = true;
    try {
        isValidInput = await schema.validateAsync(input);
        isValidInput = await schemaParams.validateAsync(params);
    }
    catch(error) {
        isValidInput = false;
        response.code = 400;
        response.message = error.details[0]['message'];
        try {
            fs.unlinkSync(`public/assignments/${req.file.filename}`);
        } catch(error) {}
    }
    if(!isValidInput) return responses.validationErrorResponseData(res, response.message, response.code);


    let { name, deadline } = input;
    let { semester, departmentId } = params;
    let query = ``;
    if(req.file) query = `INSERT INTO assignments(name, semester, departmentId, deadline, filePath) VALUES("${name}", ${semester}, ${departmentId}, "${deadline}", "${req.file.filename}");`;
    else query = `INSERT INTO assignments(name, semester, departmentId, deadline) VALUES("${name}", ${semester}, ${departmentId}, "${deadline}");`;
    
    try {
        await db.sequelize.query(query);
        response.message = 'Assignment inserted successfully';
        response.code = 1;
        responses.successResponseWithoutData(res, response.message, response.code);
    } catch(error) {
        try {
            fs.unlinkSync(`public/assignments/${req.file.filename}`);
            fs.unlinkSync(`public/assignments/temp.pdf`);
        } catch(error) {}
        response.message = error.parent.sqlMessage;
        response.code = 0;
        response.status = 200;
        responses.errorResponseWithoutData(res, response.message, response.code, response.status);
    }
};