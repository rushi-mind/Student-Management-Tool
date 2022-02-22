const db = require('../../models');
const Joi = require('joi');
const responses = require('../responses');

module.exports = (async (req, res) => {

    if(req.admin.role !== 'admin') return responses.errorResponseWithoutData(res, 'Admin only can add/edit/get teachers', 0, 200);


    let params = req.params;
    let response = {};

    const schemaParams = Joi.object({
        departmentId: Joi.number().integer().min(1).required()
    });
    let isValidInput = true;
    try {
        isValidInput = await schemaParams.validateAsync(params);
    } catch (error) {
        isValidInput = false;
        response.message = error.details[0]['message'];
    }
    if(!isValidInput) return responses.validationErrorResponseData(res, response.message, 400);


    let { departmentId } = params;

    let query = `SELECT adminId, name, email, role FROM admins WHERE departmentId = ${departmentId};`;

    try {
        const teachers = (await db.sequelize.query(query))[0];
        const totalRecords = (await db.sequelize.query(`select count(adminId) as total from admins where departmentId = ${departmentId};`))[0][0]['total'];
        responses.successResponseData(res, teachers, 1, 'Teachers fetched successfully', { totalRecords });
    } catch (error) {
        response.message = error.parent.sqlMessage;
        responses.errorResponseWithoutData(res, response.message, 0, 200);
    }
});