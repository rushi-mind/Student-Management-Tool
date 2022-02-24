const Joi = require('joi');
const db = require('../../models');
const responses = require('../responses');
const bcrypt = require('bcrypt');

/**************************** ADD TEACHER ****************************/

// function to get departmentCode using departmentId
const getDepartmentCode = async (id) => {
    let departmentCode = null;
    try {
        let Departmnet = await db.Department.findOne({
            attributes: ['departmentCode'],
            where: { id }
        });
        departmentCode = Departmnet.departmentCode;
    } catch (error) {}
    return departmentCode;
}

// function to get very next available srNo for new teacher
const getSrNo = async (departmentId) => {
    let srNo = null;
    try {
        let temp = await db.Admin.findOne({
            attributes: [
                [db.Sequelize.fn('COUNT', db.Sequelize.col('_id')), 'total']
            ]
        });
        srNo = (await db.sequelize.query(`select count(_id) as total from admins where departmentId = ${departmentId};`))[0][0]['total'];
    } catch (error) {}
    return srNo+1;
}

// function to generate teacher id
const generateTeacherID = (departmentCode, srNo) => {
    let sr = ``;
    if(srNo.toString().length == 1) sr = `00${srNo}`;
    else if(srNo.toString().length == 2) sr = `0${srNo}`;
    else sr = `${sr}`;
    return parseInt(`${departmentCode}${sr}`);
}

// add-teacher route handler
const addTeacher = (async (req, res) => {

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

        let teacher = await db.Admin.create({
            adminId,
            name,
            email,
            role, 
            password: hashedPassword,
            departmentId
        }, {
            fields: ['adminId', 'name', 'email', 'role', 'password', 'departmentId']
        });

        teacher.dataValues.departmentCode = departmentCode;
        responses.successResponseData(res, { teacher }, 1, 'Teacher added successfully');
    } catch (error) {
        console.log(error);
        response.message = error.parent.sqlMessage;
        responses.errorResponseWithoutData(res, response.message, 0, 200);
    }
});



/**************************** EDIT TEACHER ****************************/

// edit-teacher route handler
const editTeacher = (async (req, res) => {
    if(req.admin.role !== 'admin') return responses.errorResponseWithoutData(res, 'Admin only can add/edit teachers', 0, 200);

    let input = req.body;
    let params = req.params;
    let response = {};

    const schemaParams = Joi.object({
        adminId: Joi.number().integer().min(1).required()
    });
    const schema = Joi.object({
        name: Joi.string().required()
    });
    let isValidInput = true;
    try {
        isValidInput = await schema.validateAsync(input);
        isValidInput = await schemaParams.validateAsync(params);
    } catch (error) {
        isValidInput = false;
        response.message = error.details[0]['message'];
    }
    if(!isValidInput) return responses.validationErrorResponseData(res, response.message, 400);

    let isValidAdminId = true;
    try {
        let admin = (await db.sequelize.query(`select * from admins where adminId = ${params.adminId};`))[0][0];
        if(!admin) {
            isValidAdminId = false;
            response.message = 'Invalid adminId';
        }
    } catch (error) {
        isValidAdminId = false;
        console.log(error);
    }
    if(!isValidAdminId) return responses.errorResponseWithoutData(res, response.message, 0, 200);

    let { name } = input;
    let { adminId }  = params;

    try {
        await db.sequelize.query(`update admins set name = "${name}" where adminId = ${adminId};`);
        response.message = 'Teacher edited successfully';
        responses.successResponseWithoutData(res, response.message, 1);
    } catch (error) {
        responses.errorResponseWithoutData(res, error.parent.sqlMessage, 0, 200);
    }
});



/**************************** GET TEACHER ****************************/

// get-teacher route handler
const getTeacher = (async (req, res) => {

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



/**************************** GET TEACHERS ****************************/

// get-teachers route handler
const getTeachers = (async (req, res) => {

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


/**************************** DELETE TEACHER ****************************/

// delete-teacher route handler
const deleteTeacher = (async (req, res) => {
    let params = req.params;
    let response = {};

    if(req.admin.role !== 'admin') return res.status(403).send({ status: 'fail', message: 'Only admin has access to perform this operation' });

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
    if(!isValidParams) return responses.validationErrorResponseData(res, response.message, 400);


    let isvalidId = true;
    try {
        let result = (await db.sequelize.query(`select * from admins where _id = ${params.id};`))[0][0];
        if(!result) isvalidId = false;
    } catch (error) {}

    if(!isvalidId) return responses.errorResponseWithoutData(res, 'Invalid admin id', 0, 200);

    try {
        await db.sequelize.query(`delete from admins where _id = ${params.id};`);
        responses.successResponseWithoutData(res, 'Teacher deleted successfully', 1);
    } catch (error) {
        responses.errorResponseWithoutData(res, error.parent.sqlMessage, 0, 200);
    }
});



/************************************************************************/

module.exports = {
    addTeacher,
    editTeacher,
    getTeacher,
    getTeachers,
    deleteTeacher
};