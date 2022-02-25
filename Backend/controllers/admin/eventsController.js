const Joi = require('joi');
const db = require('../../models');
const responses = require('../responses');

/**************************** ADD EVENT ****************************/

// add-event route handler
const addEvent = (async (req, res) => {
    let input = req.body;
    let response = {};

    if(req.admin.role !== 'admin') return responses.validationErrorResponseData(res, 'Access Denied.', 400);
    if(!req.file) return responses.validationErrorResponseData(res, 'Image not found.', 400);

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
        let event = await db.Event.create({
            name,
            date,
            imagePath: req.file.filename
        });
        responses.successResponseData(res, event, 1, 'Event added successfully.', null);
    } catch (error) {
        response.message = error.parent.sqlMessage;
        responses.errorResponseWithoutData(res, response.message, 0, 200);
    }
});

/**************************** DELETE EVENT ****************************/

// delete-event route handler
const deleteEvent = (async (req, res) => {
    let params = req.params;
    let response = {};

    if(req.admin.role !== 'admin') return responses.errorResponseWithoutData(res, 'Access Denied.', 0, 200);

    const schema = Joi.object({
        id: Joi.number().integer().required()
    });
    let isValidInput = true;
    try {
        isValidInput = await schema.validateAsync(params);
    } catch (error) {
        isValidInput = false;
        response.code = 400;
        response.message = error.details[0]['message'];
    }
    if(!isValidInput) return responses.validationErrorResponseData(res, response.message, response.code);

    let isValidId = true;
    try {
        let event = await db.Event.findOne({ where: { id: params.id } });
        if(!event) {
            isValidId = false;
            response.message = 'Invalid Event-ID.';
        }
    } catch (error) {
        isValidId = false;
        console.log(error);
    }
    if(!isValidId) return responses.errorResponseWithoutData(res, response.message, 0, 200);

    try {
        await db.Event.destroy({ where: { id: params.id } });
        responses.successResponseWithoutData(res, 'Event deleted successfully.', 1);
    } catch (error) {
        responses.errorResponseWithoutData(res, error.parent.sqlMessage, 0, 200);
    }
});

/************************************************************************/
module.exports = {
    addEvent,
    deleteEvent
};