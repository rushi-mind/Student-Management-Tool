const db = require('../../models');
const Joi = require('joi');
const responses = require('../responses');

/**************************** ADD DEPARTMENT ****************************/

// function to generate slug of name of department
const generateSulg = (name) => {
    name = name.toLowerCase();
    name = name.replaceAll(' ', '-');
    return name;
}

// add-department route handler
const addDepartment = (async (req, res) => {
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



/**************************** GET DEPARTMENTS ****************************/

// get-departments route handler
const getDepartments = (async (req, res) => {
    let response = {};
    try {
        let result = (await db.sequelize.query(`select * from departments;`))[0];
        if(result.length) responses.successResponseData(res, result, 1, 'Departments fetched successfully', null);
        else responses.successResponseData(res, result, 1, 'No departments found', null);
    } catch (error) {
        responses.errorResponseWithoutData(res, error.parent.sqlMessage, 0, 200);
    }
}); 



/**************************** DELETE DEPARTMENT ****************************/

// delete-department route handler
const deleteDepartment = (async (req, res) => {
    let params = req.params;
    let response = {};

    if(req.admin.role !== 'admin') return responses.errorResponseWithoutData(res, 'Only admin has access to perform this operation', 0, 200);

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
    if(!isValidParams) return responses.validationErrorResponseData(res, response.message, response.code);

    let isValidId = true;
    try {
        let department = (await db.sequelize.query(`select * from departments where id = ${params.id};`))[0][0];
        if(!department) {
            isValidId = false;
            response.message = 'Invalid department id';
        }
    } catch (error) {
        isValidId = false;
        console.log(error);
    }
    if(!isValidId) return responses.errorResponseWithoutData(res, response.message, 0, 200);

    try {
        await db.sequelize.query(`delete from departments where id = ${params.id};`);
        responses.successResponseWithoutData(res, 'Department deleted successfully', 1);
    } catch (error) {
        responses.errorResponseWithoutData(res, error.parent.sqlMessage, 0, 200);
    }
});



/************************************************************************/

module.exports = {
    addDepartment,
    getDepartments,
    deleteDepartment
};