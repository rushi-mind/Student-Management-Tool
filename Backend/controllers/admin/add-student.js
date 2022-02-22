const db = require('../../models');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const responses = require('../responses');

const getDepartmentCode = async (id) => {
    let departmentCode = null;
    try {
        departmentCode = (await db.sequelize.query(`select departmentCode from departments where id = ${id};`))[0][0]['departmentCode'];
    } catch (error) {}
    return departmentCode;
}

const getSrNo = async (semester, departmentId) => {
    let srNo = null;
    try {
        srNo = (await db.sequelize.query(`select count(rollNo) as total from students where semester = ${semester} and departmentId = ${departmentId};`))[0][0]['total'];
    } catch (error) {}
    return srNo+1;
}

const generateRollNo = (year, departmentCode, srNo) => {
    let sr = ``;
    let digits = srNo.toString().length;
    if(digits == 1) sr = `00${srNo}`;
    else if(digits == 2) sr = `0${srNo}`
    else sr = `${sr}`
    return parseInt(`${year}${departmentCode}${sr}`);
}

module.exports = (async (req, res) => {
    let input = req.body;
    let response = {};

    if(req.admin.role !== 'admin') return res.status(403).send({ status: 'fail', message: 'Only admin has access to perform this operation' });

    const schema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        joiningYear: Joi.number().integer().required(),
        semester: Joi.number().integer().min(1).max(8),
        departmentId: Joi.number().integer().min(1),
        address: Joi.string().required(),
        bloodGroup: Joi.string().required()
    });
    let isValidInput = true;
    try {
        isValidInput = await schema.validateAsync(input);
    } catch (error) {
        isValidInput = false;
        response.code = 400;
        response.message = error.details[0]['message'];
    }
    if(!isValidInput) return responses.validationErrorResponseData(res, response.message, response.code);


    let { firstName, lastName, joiningYear, semester, departmentId, address, bloodGroup } = input;

    let departmentCode = await getDepartmentCode(departmentId);
    if(!departmentCode) return responses.errorResponseWithoutData(res, 'Invalid Department ID entered', 0, 200);
    let srNo = await getSrNo(semester, departmentId);

    let rollNo = generateRollNo(joiningYear, departmentCode, srNo);
    let email = `${rollNo}@smt.com`;
    let password = `${rollNo}`;

    let salt = await bcrypt.genSalt(10);
    let hashedPassword = await bcrypt.hash(password, salt);

    try {
        await db.Student.create({
            rollNo,
            firstName,
            lastName,
            email,
            password: hashedPassword,
            semester,
            departmentId,
            address,
            bloodGroup
        }, { 
            fields: [
                'rollNo', 'firstName', 'lastName', 'email', 'password', 'semester', 'departmentId', 'address', 'bloodGroup'
            ] 
        });

        let student = (await db.sequelize.query(`select id, rollNo, firstName, lastName, email, semester from students where rollNo = ${rollNo};`))[0][0];
        response.message = 'Student added successfully';
        response.code = 1;
        student.departmentCode = departmentCode;
        responses.successResponseData(res, { student }, 1, response.message);
    } catch(error) {
        response.message = error.parent.sqlMessage;
        response.code = 0;
        response.status = 200;
        responses.errorResponseWithoutData(res, response.message, response.code, response.status);
    }
});