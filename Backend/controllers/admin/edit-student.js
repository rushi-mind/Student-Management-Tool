const db = require('../../models');
const Joi = require('joi');
const responses = require('../responses');

module.exports = (async (req, res) => {
    if(req.admin.role !== 'admin') return responses.errorResponseWithoutData(res, 'Only admin has access to perform this operation', 0, 200);

    let input = req.body;
    let response = {};
    let rollNo = req.params.rollNo;
    try {
        rollNo = parseInt(rollNo);
    } catch (error) {}
    if(!rollNo) return responses.validationErrorResponseData(res, 'RollNo should be number only', 400);


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
        let student = (await db.sequelize.query(`select * from students where rollNo = ${rollNo};`))[0][0];
        if(!student) {
            isValidRollNo = false;
            response.message = 'Invalid RollNo';
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
        },
        {
            where: {
                rollNo
            }
        });
        response.message = 'Student updated successfully.';
        responses.successResponseWithoutData(res, response.message, 1);
    } catch(error) {
        response.message = error.parent.sqlMessage;
        responses.errorResponseWithoutData(res, response.message, 0, 200);
    }
});