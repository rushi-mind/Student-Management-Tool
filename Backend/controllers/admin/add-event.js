const db = require('../../models');
const Joi = require('joi');
const responses = require('../responses');

module.exports = (async (req, res) => {
    let input = req.body;
    let response = {};

    if(req.admin.role !== 'admin') return responses.validationErrorResponseData(res, 'Admin only can add new event', 400);
    if(!req.file) return responses.validationErrorResponseData(res, 'Image not found', 400);

    const schema = Joi.object({
        name: Joi.string().required(),
        date: Joi.date().required()
    });
    let isValidInput = true;
    try {
        isValidInput = await schema.validateAsync(input);
    } catch (error) {
        isValidInput = false;
        response.message = error.details[0]['message'];
    }
    if(!isValidInput) return responses.validationErrorResponseData(res, response.message, 400);


    let { name, date } = input;
    try {
        await db.sequelize.query(`insert into events(name, date, imagePath) values("${name}", "${date}", "${req.file.filename}");`);
        responses.successResponseWithoutData(res, 'Event added successfully', 1);
    } catch (error) {
        response.message = error.parent.sqlMessage;
        responses.errorResponseWithoutData(res, response.message, 0, 200);
    }
});