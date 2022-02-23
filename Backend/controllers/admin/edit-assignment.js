const Joi = require('joi');
const db = require('../../models');
const fs = require('fs');
const responses = require('../responses');

module.exports = (async (req, res) => {
    let input = req.body;
    let params = req.params;
    let response = {};    

    const schemaParams = Joi.object({
        id: Joi.number().integer().required()
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
        response.message = error.details[0]['message'];
        try {
            fs.unlinkSync(`public/assignments/${req.file.filename}`);
        } catch(error) {}
    }
    if(!isValidInput) return responses.validationErrorResponseData(res, response.message, 400);


    let obj = (await db.sequelize.query(`select * from assignments where id = ${params.id};`))[0];
    if(!obj.length) {
        try {
            fs.unlinkSync(`public/assignments/${req.file.filename}`);
        } catch(error) {}
        return responses.errorResponseWithoutData(res, 'Invalid assignment id', 0, 200);
    }

    let { name, deadline } = input;
    let filePath = null;
    if(req.file) filePath = `http://192.168.1.169:5000/assignments/${req.file.filename}`;

    try {
        await db.Assignment.update({
            name,
            deadline,
            filePath
        }, {
            where: {
                id: params.id
            }
        });
        response.message = 'Assignment updated successfully';
        responses.successResponseWithoutData(res, response.message, 1);
    } catch (error) {
        response.message = error.parent.sqlMessage;
        responses.errorResponseWithoutData(res, response.message, 0, 200);
    }
});