const db = require('../../models');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const responses = require('../responses');

/**************************** GET PROFILE ****************************/

// get-profile handler
const getProfile = (async (req, res) => {
    let input = req.params;
    let response = {};

    if (parseInt(input.rollNo )!== req.student.rollNo) return responses.validationErrorResponseData(res, 'Invalid auth token', 400);

    const schema = Joi.object({
        rollNo: Joi.number().integer().required()
    });
    let isValid = true;
    try {
        isValid = await schema.validateAsync(input);
    } catch (error) {
        isValid = false;
        responses.message = error.details[0]['message'];
    }
    if (!isValid) return responses.validationErrorResponseData(res, response.message, 400);


    let query = `SELECT rollNo, firstName, lastName, email, semester, departmentId, address, bloodGroup, profileImagePath FROM students WHERE rollNo = ${input.rollNo};`;

    try {
        let result = (await db.sequelize.query(query))[0][0];
        if (result) {
            let department = (await db.sequelize.query(`select name from departments where id = ${result.departmentId};`))[0][0]['name'];
            result.department = department;

            if (result.profileImagePath) result.profileImagePath = `http://192.168.1.169:5000/profile-images/students/${result.profileImagePath}`;
            else result.profileImagePath = `http://192.168.1.169:5000/profile-images/default.png`;

            responses.successResponseData(res, result, 1, 'Pfofile fetched successfully', null);
        }
        else responses.errorResponseWithoutData(res, 'Invalid RollNo Entered', 0, 200);
    } catch (error) {
        response.message = error.parent.sqlMessage;
        responses.errorResponseWithoutData(res, response.message, 0, 200);
    }
});


/**************************** EDIT PROFILE IMAGE ****************************/

// edit-profile-image handler
const editProfileImage = (async (req, res) => {
    try {
        db.sequelize.query(`update students set profileImagepath = "${req.file.filename}" where rollNo = ${req.student.rollNo};`);
        responses.successResponseWithoutData(res, 'Profile picture updated successfully', 1);
    } catch (error) {
        console.log(error);
        responses.errorResponseWithoutData(res, 'Something went wrong. Please try again', 0, 200);
    }
});


/**************************** DELETE PROFILE IMAGE ****************************/

// delete-profile-image handler
const deleteProfileImage = (async (req, res) => {
    try {
        db.sequelize.query(`update students set profileImagepath = null where rollNo = ${req.student.rollNo};`);
        responses.successResponseWithoutData(res, 'Profile picture deleted successfully', 1);
    } catch (error) {
        console.log(error);
        responses.errorResponseWithoutData(res, 'Something went wrong. Please try again', 0, 200);
    }
});

/*******************************************************************************/
module.exports = {
    getProfile,
    editProfileImage,
    deleteProfileImage
};