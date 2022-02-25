const Joi = require('joi');
const db = require('../../models');
const fs = require('fs');
const responses = require('../responses');

/**************************** ADD ASSIGNMENT ****************************/

// add-assignment route handler
const addAssignment = (async (req, res) => {
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
        response.message = 'Assignment inserted successfully.';
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
});

/**************************** EDIT ASSIGNMENT ****************************/

// edit-assignment route handler
const editAssignment = (async (req, res) => {
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


    let obj = await db.Assignment.findOne({ where: { id: params.id } });
    if(!obj.length) {
        try {
            fs.unlinkSync(`public/assignments/${req.file.filename}`);
        } catch(error) {}
        return responses.errorResponseWithoutData(res, 'Invalid Assignment-ID', 0, 200);
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
        response.message = 'Assignment updated successfully.';
        responses.successResponseWithoutData(res, response.message, 1);
    } catch (error) {
        response.message = error.parent.sqlMessage;
        responses.errorResponseWithoutData(res, response.message, 0, 200);
    }
});

/**************************** GET ASSIGNMENT ****************************/

// get-assignment route handler
const getAssignment = (async (req, res) => {
    let params = req.params;
    let response = {};
    const schema = Joi.object({
        id: Joi.number().integer().required()
    });
    let isValidParams = true;
    try {
        isValidParams = await schema.validateAsync(params);
    } catch (error) {
        isValidParams = false;
        response.message = error.details[0]['message'];
    }
    if(!isValidParams) responses.validationErrorResponseData(res, response.message, 400);

    let { id } = params;
    try {
        let assignment = await db.Assignment.findOne({ where: { id } });
        if(!assignment) responses.errorResponseWithoutData(res, 'Invalid Assignment-ID', 0, 200);
        else responses.successResponseData(res, assignment, 1, 'Assignment fetched successfully.', null);
    } catch (error) {
        response.message = error.parent.sqlMessage;
        responses.errorResponseWithoutData(res, response.message, 0, 200);
    }
});

/**************************** DELETE ASSIGNMENT ****************************/

// delete-assignment route handler
const deleteAssignment = (async (req, res) => {
    let params = req.params;
    let response = {};
    let schema = Joi.object({
        id: Joi.number().integer().min(1).required()
    });
    let isValidParams = true;
    try {
        isValidParams = await schema.validateAsync(params);
    } catch (error) {
        isValidParams = false;
        response.message = error.details[0]['message'];
    }
    if(!isValidParams) return responses.validationErrorResponseData(res, response.message, 400);

    let assignment = null;
    try {
        assignment = await db.Assignment.findOne({ where: { id: params.id } }); 
    } catch (error) {}
    if(!assignment) return responses.errorResponseWithoutData(res, 'Invalid Assignment-ID.', 0, 200);

    try {
        fs.unlinkSync(`public/assignments/${assignment.filePath}`)
    } catch (error) {}

    try {
        await db.Assignment.destroy({ where: { id: params.id } });
        responses.successResponseWithoutData(res, 'Assignment deleted successfully.', 1);
    } catch (error) {
        responses.errorResponseWithoutData(res, error.parent.sqlMessage, 0, 200);
    }
});

/************************************************************************/
module.exports = {
    addAssignment,
    editAssignment,
    getAssignment,
    deleteAssignment
};