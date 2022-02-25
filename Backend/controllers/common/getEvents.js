const db = require('../../models');
const responses = require('../responses');

module.exports = (async (req, res) => {
    try {
        let result = await db.Event.findAll();
        let totalRecords = result.length;
        if(result.length) responses.successResponseData(res, result, 1, 'Events fetched successfully.', { totalRecords });
        else responses.successResponseData(res, result, 1, 'No Data Found.', null);
    } catch (error) {
        responses.errorResponseWithoutData(res, error.parent.sqlMessage, 0, 200);
    }
}); 