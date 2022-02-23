const db = require('../../models');
const Joi = require('joi');
const responses = require('../responses');

const generateSulg = (name) => {
    name = name.toLowerCase();
    name = name.replaceAll(' ', '-');
    return name;
}

module.exports = (async (req, res) => {
    let input = req.body;
    let response = {};

    if(req.admin.role !== 'admin') return responses.errorResponseWithoutData(res, 'Only admin has access to perform this operation', 0, 200);

    const schema = Joi.object({
        name: Joi.string().required(),
        departmentCode: Joi.number().integer().required()
    });
    let isValidInput = true;
    try {
        isValidInput = await schema.validateAsync(input);
        if(input.departmentCode.toString().length !== 3) throw '3';
    } catch (error) {
        isValidInput = false;
        if(error == '3') response.message = `Department Code must be 3 digits only`;
        else response.message = error.details[0]['message'];
    }
    if(!isValidInput) return responses.validationErrorResponseData(res, response.message, response.code);


    let { name, departmentCode } = input;
    let departmentNameSlug = generateSulg(name);

    try {
        await db.Department.create({
            name,
            departmentCode,
            departmentNameSlug
        }, {
            fields: ['name', 'departmentCode', 'departmentNameSlug']
        });
        response.message = 'Department added successfully';
        responses.successResponseWithoutData(res, response.message, 1);
    } catch (error) {
        responses.errorResponseWithoutData(res, error.parent.sqlMessage, 0, 200);
    }
});