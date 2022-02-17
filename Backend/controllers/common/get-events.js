const db = require('../../models');
const responses = require('../responses');

module.exports = (async (req, res) => {
    let response = {};
    try {
        let result = (await db.sequelize.query(`select * from events;`))[0];
        if(result.length) responses.successResponseData(res, result, 1, 'Events fetched successfully', null);
        else responses.successResponseData(res, result, 1, 'No events found', null);
    } catch (error) {
        responses.errorResponseWithoutData(res, error.parent.sqlMessage, 0, 200);
    }
}); 