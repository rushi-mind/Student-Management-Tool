const db = require('../../models');
const responses = require('../responses');

module.exports = (async (req, res) => {
    let response = {};
    try {
        let result = (await db.sequelize.query(`select * from departments;`))[0];
        if(result.length) responses.successResponseData(res, result, 1, 'Departments fetched successfully', null);
        else responses.successResponseData(res, result, 1, 'No departments found', null);
    } catch (error) {
        responses.errorResponseWithoutData(res, error.parent.sqlMessage, 0, 200);
    }
}); 