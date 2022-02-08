const db = require('../../models');

module.exports = (async (req, res) => {
    let input = req.body;
    let id = input.id, updateFields = input.updateFields;
    let query = `UPDATE assignments SET`;
    if(updateFields.name) query += ` name = "${updateFields.name}",`;
    if(updateFields.deadline) query += ` deadline = "${updateFields.deadline}",`;
    if(updateFields.departmentId) query += ` departmentId = ${updateFields.departmentId},`;
    if(updateFields.semester) query += ` semester = ${updateFields.semester},`;
    query = query.substring(0, query.length-1);
    query += ` WHERE id = ${id};`;

    let response = {};
    try {
        let [result, metadata] = await db.sequelize.query(query);
        response.status = 'ok';
        response.message = 'Assignment updated successfully.';
    } catch (error) {
        res.status(400);
        response.status = 'fail';
        response.message = error.parent.sqlMessage;
    }

    res.send(response);
});