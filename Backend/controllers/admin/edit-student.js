const db = require('../../models');
const Joi = require('joi');
const responses = require('../responses');

module.exports = (async (req, res) => {
    let input = req.body;
    let response = {};

    if(req.admin.role !== 'admin') return res.status(403).send({ status: 'fail', message: 'Only admin has access to perform this operation' });

    const schema = Joi.object({
        rollNo: Joi.number().integer().required(),
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



    let { rollNo, firstName, lastName, semester, departmentId, address, bloodGroup } = input;

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