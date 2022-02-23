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
    let filePath = null;
    if(req.file) filePath = `http://192.168.1.169:5000/assignments/${req.file.filename}`;
    
    try {
        let assignment = await db.Assignment.create({
            name,
            semester,
            departmentId,
            deadline,
            filePath
        }, {
            fields: ['name', 'semester', 'departmentId', 'deadline', 'filePath']
        });
        response.message = 'Assignment inserted successfully';
        responses.successResponseData(res, assignment, 1, response.message);
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