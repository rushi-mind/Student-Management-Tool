const db = require('../../models');
const responses = require('../responses');

module.exports = (async (req, res) => {
    try {
        db.sequelize.query(`update students set profileImagepath = null where rollNo = ${req.student.rollNo};`);
        responses.successResponseWithoutData(res, 'Profile picture deleted successfully', 1);
    } catch (error) {
        console.log(error);
        responses.errorResponseWithoutData(res, 'Something went wrong. Please try again', 0, 200);
    }
});