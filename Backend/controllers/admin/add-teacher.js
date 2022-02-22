const Joi = require('joi');
const db = require('../../models');
const responses = require('../responses');
const bcrypt = require('bcrypt');


const getDepartmentCode = async (id) => {
    let departmentCode = null;
    try {
        departmentCode = (await db.sequelize.query(`select departmentCode from departments where id = ${id};`))[0][0]['departmentCode'];
    } catch (error) {}
    return departmentCode;
}

const getSrNo = async (departmentId) => {
    let srNo = null;
    try {
        srNo = (await db.sequelize.query(`select count(_id) as total from admins where departmentId = ${departmentId};`))[0][0]['total'];
    } catch (error) {}
    return srNo+1;
}

const generateTeacherID = (departmentCode, srNo) => {
    let sr = ``;
    let digits = srNo.toString().length;
    if(digits == 1) sr = `00${srNo}`;
    else if(digits == 2) sr = `0${srNo}`
    else sr = `${sr}`
    return parseInt(`${departmentCode}${sr}`);
}

module.exports = (async (req, res) => {

    if(req.admin.role !== 'admin') return responses.errorResponseWithoutData(res, 'Admin only can add/edit teachers', 0, 200);

    let input = req.body;
    let response = {};

    const schema = Joi.object({
        name: Joi.string().required(),
        role: Joi.string().required(),
        departmentId: Joi.number().integer().min(1).required(),
    });
    let isValidInput = true;
    try {
        isValidInput = await schema.validateAsync(input);
    } catch (error) {
        isValidInput = false;
        response.message = error.details[0]['message'];
    }
    if(!isValidInput) return responses.validationErrorResponseData(res, response.message, 400);

    let { name, role, departmentId } = input;

    let departmentCode = await getDepartmentCode(departmentId);
    if(!departmentCode) return responses.errorResponseWithoutData(res, 'Invalid Department ID entered', 0, 200);

    let srNo = await getSrNo(departmentId);

    let adminId = generateTeacherID(departmentCode, srNo);
    let email = `${adminId}@smt.ac.com`;
    let password = `${adminId}`;

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await db.Admin.create({
            adminId,
            name,
            email,
            role, 
            password: hashedPassword,
            departmentId
        }, {fields: ['adminId', 'name', 'email', 'role', 'password', 'departmentId']});

        let teacher = (await db.sequelize.query(`select _id, adminId, name, email, role from admins where adminId = ${adminId};`))[0][0]; 

        teacher.departmentCode = departmentCode;

        responses.successResponseData(res, { teacher }, 1, 'Teacher added successfully');
    } catch (error) {
        console.log(error);
        response.message = error.parent.sqlMessage;
        responses.errorResponseWithoutData(res, response.message, 0, 200);
    }
});