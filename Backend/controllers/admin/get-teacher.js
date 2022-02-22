const db = require('../../models');
const Joi = require('joi');
const responses = require('../responses');

module.exports = (async (req, res) => {

    if(req.admin.role !== 'admin') return responses.errorResponseWithoutData(res, 'Admin only can add/edit/get teachers', 0, 200);


    let params = req.params;
    let response = {};

    const schemaParams = Joi.object({
        adminId: Joi.number().integer().required(),
    });
    let isValidInput = true;
    try {
        isValidInput = await schemaParams.validateAsync(params);
    } catch (error) {
        isValidInput = false;
        response.message = error.details[0]['message'];
    }
    if(!isValidInput) return responses.validationErrorResponseData(res, response.message, 400);


    let { adminId } = params;

    let query = `SELECT adminId, name, email, role, departmentId FROM admins WHERE adminId = ${adminId};`;

    try {
        const teacher = (await db.sequelize.query(query))[0][0];
        if(!teacher) throw "invalid";
        let responseData = {
            adminId: teacher.adminId,
            name: teacher.name,
            email: teacher.email,
            role: teacher.role
        };
        let departmentName = (await db.sequelize.query(`select name from departments where id = ${teacher.departmentId};`))[0][0]['name'];
        responseData.department = departmentName;
        responses.successResponseData(res, responseData, 1, 'Students fetched successfully', null);
    } catch (error) {
        if(error === 'invalid') response.message = `Invalid teacher id entered`;
        else response.message = error.parent.sqlMessage;
        responses.errorResponseWithoutData(res, response.message, 0, 200);
    }
});