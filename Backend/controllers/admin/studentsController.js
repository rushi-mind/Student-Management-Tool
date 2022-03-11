// require('dotenv').config();
const db = require('../../models');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const responses = require('../responses');
const fs = require('fs');


/**************************** ADD STUDENT ****************************/

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

// function to get very next available srNo for new student
const getSrNo = async (semester, departmentId) => {
    let srNo = null;
    try {
        let temp = await db.Student.findOne({
            attributes: [
                [db.Sequelize.fn('COUNT', db.Sequelize.col('rollNo')), 'total']
            ],
            where: {
                semester,
                departmentId
            }
        });
        console.log(temp);
        srNo = temp.dataValues.total + 1;
        console.log(srNo);
    } catch (error) {}
    return srNo;
}

// function to generate rollNo of new student
const generateRollNo = (year, departmentCode, srNo) => {
    let sr = ``;
    if(srNo.toString().length == 1) sr = `00${srNo}`;
    else if(srNo.toString().length == 2) sr = `0${srNo}`;
    else sr = `${sr}`;
    return parseInt(`${year}${departmentCode}${sr}`);
}

// add-student route handler
const addStudent = (async (req, res) => {
    let input = req.body;
    let response = {};

    console.log('body', input);

    if(req.admin.role !== 'admin') return res.status(403).send({ status: 'fail', message: 'Access Denied.' });

    const schema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        joiningYear: Joi.number().integer().required(),
        semester: Joi.number().integer().min(1).max(8).required(),
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
    if(!departmentCode) return responses.errorResponseWithoutData(res, 'Department-ID is invalid.', 0, 200);
    let srNo = await getSrNo(semester, departmentId);

    let rollNo = generateRollNo(joiningYear, departmentCode, srNo);
    let email = `${rollNo}@smt.com`;
    let password = `${rollNo}`;

    let salt = await bcrypt.genSalt(10);
    let hashedPassword = await bcrypt.hash(password, salt);

    try {
        let student = await db.Student.create({
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

        response.message = 'Student added successfully.';
        response.code = 1;
        student.departmentCode = departmentCode;
        delete student.departmentId;
        delete student.password;
        responses.successResponseData(res, { student }, 1, response.message);
    } catch(error) {
        response.message = error.parent.sqlMessage;
        response.code = 0;
        response.status = 200;
        responses.errorResponseWithoutData(res, response.message, response.code, response.status);
    }
});


/**************************** EDIT STUDENT ****************************/

// edit-student route handler
const editStudent = (async (req, res) => {
    if(req.admin.role !== 'admin') return responses.errorResponseWithoutData(res, 'Access Denied.', 0, 200);

    let input = req.body;
    let response = {};
    let rollNo = req.params.rollNo;
    rollNo = parseInt(rollNo);
    if(!rollNo) return responses.validationErrorResponseData(res, 'Roll-No should be the number only.', 400);

    const schema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
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
        response.message = error.details[0]['message'];
    }
    if(!isValidInput) return responses.validationErrorResponseData(res, response.message, 400);

    let { firstName, lastName, semester, departmentId, address, bloodGroup } = input;

    let isValidRollNo = true;
    try{
        let student = await db.Student.findOne({ where: { rollNo } });
        if(!student) {
            isValidRollNo = false;
            response.message = 'Entered Roll-No is invalid.';
        }
    } catch(error) {
        isValidRollNo = false;
        console.log(error);
    }
    if(!isValidRollNo) return responses.errorResponseWithoutData(res, response.message, 0, 200);

    try {
        await db.Student.update({
            firstName,
            lastName,
            semester,
            departmentId,
            address,
            bloodGroup
        }, {
            where: { rollNo }
        });
        response.message = 'Details have been updated successfully.';
        responses.successResponseWithoutData(res, response.message, 1);
    } catch(error) {
        response.message = error.parent.sqlMessage;
        responses.errorResponseWithoutData(res, response.message, 0, 200);
    }
});


/**************************** GET STUDENTS ****************************/

// get-students route handler
const getStudents = (async (req, res) => {
    let input = req.query;
    let params = req.params;
    let response = {};

    const schemaParams = Joi.object({
        semester: Joi.number().integer().min(1).max(8).required(),
        departmentId: Joi.number().integer().min(1).required()
    });
    const schemaInput = Joi.object({
        pageNumber: Joi.number().integer().min(1),
        pageSize: Joi.number().integer().min(1),
        sortType: Joi.string(),
        sortBy: Joi.string()
    });
    let isValidInput = true;
    try {
        isValidInput = await schemaParams.validateAsync(params);
        isValidInput = await schemaInput.validateAsync(input);
    } catch (error) {
        isValidInput = false;
        response.message = error.details[0]['message'];
    }
    if(!isValidInput) return responses.validationErrorResponseData(res, response.message, 400);

    let { pageNumber, pageSize, sortType, sortBy } = input;
    if(!pageNumber) pageNumber = 1;
    if(!pageSize) pageSize = 7;
    if(!sortType) sortType = 'ASC';
    if(!sortBy) sortBy = 'rollNo';

    pageNumber = parseInt(pageNumber);
    pageSize = parseInt(pageSize);

    let { departmentId, semester } = params;

    let query = `SELECT rollNo, firstName, lastName, email, semester, departmentId, address, bloodGroup, CONCAT('${process.env.URL}profile-images/students/',profileImagePath) AS profileImage FROM students WHERE semester = ${semester} AND departmentId = ${departmentId} ORDER BY ${sortBy} ${sortType} LIMIT ${pageSize} OFFSET ${pageSize*(pageNumber-1)};`;

    try {
        const students = (await db.sequelize.query(query))[0];
        students.map((cur) => {
            if(!cur.profileImage) cur.profileImage = `${process.env.URL}profile-images/default.png`;
        });
        const totalRecords = (await db.sequelize.query(`select count(id) as total from students where semester = ${semester} and departmentId = ${departmentId};`))[0][0]['total'];
        if(students.length) response.message = `Students fetched successfully.`;
        else response.message = `Data not found.`;
        responses.successResponseData(res, students, 1, response.message, { totalRecords, pageNumber, pageSize });
    } catch (error) {
        response.message = error.parent.sqlMessage;
        responses.errorResponseWithoutData(res, response.message, 0, 200);
    }
});


/**************************** GET STUDENT ****************************/

// get-student route handler
const getStudent = (async (req, res) => {
    let input = req.params;
    let response = {};

    const schema = Joi.object({
        rollNo: Joi.number().integer().min(1).required()
    });
    let isValidInput = true;
    try {
        isValidInput = await schema.validateAsync(input);
    } catch (error) {
        isValidInput = false;
        response.message = error.details[0]['message'];
    }
    if(!isValidInput) return responses.validationErrorResponseData(res, response.message, 400);

    let student = null;
    try {
        student = await db.Student.findOne({
            attributes: ['id', 'rollNo', 'firstName', 'lastName', 'email', 'semester', 'departmentId', 'address', 'bloodGroup', 'profileImagePath'],
            where: { rollNo: input.rollNo }
        });
        if(!student) throw 'invalid';
        if(!student.profileImagePath) student.profileImagePath = `${process.env.URL}profile-images/default.png`;
    } catch (error) {}
    if(!student) return responses.errorResponseWithoutData(res, 'Invalid RollNo', 0, 200);

    responses.successResponseData(res, student, 1, 'Student fetched successfully', null);
});


/**************************** DELETE STUDENT ****************************/

// delete-student route handler
const deleteStudent = (async (req, res) => {
    if(req.admin.role !== 'admin') return res.status(403).send({ status: 'fail', message: 'Only admin has access to perform this operation' });
    let input = req.params;
    let response = {};

    const schema = Joi.object({
        rollNo: Joi.number().integer().required()
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

    try {
        let student = await db.Student.findOne({
            attributes: ['rollNo', 'firstName', 'lastName', 'semester', 'departmentId'],
            where: { rollNo: input.rollNo }
        });
        if(student) {
            await db.Student.destroy({ where: { rollNo: input.rollNo } });
            response.message = 'Student deleted successfully.';
            responses.successResponseWithoutData(res, response.message, 1);
            try {
                fs.unlinkSync(`public/profile-images/students/${student.profileImagePath}`);
            } catch (error) {}
        }
        else throw 'invalid';
    } catch (error) {
        if(error === 'invalid') responses.errorResponseWithoutData(res, `Student does not exist.`, 400);
        else responses.errorResponseWithoutData(res, error.parent.sqlMessage, 400);
    }
});

/************************************************************************/
module.exports = { 
    addStudent, 
    editStudent, 
    getStudents, 
    getStudent, 
    deleteStudent
};