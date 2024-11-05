const { BadRequestError } = require("../expressError");

 /**
 * Generate SQL for a partial update.
*
* This helper function is used to dynamically create the SQL query string
* and values needed for a partial update in a SQL database. This is useful for
* updating only the fields provided by the user in a request, without
* requiring them to submit every field for an object.
*
* @param {Object} dataToUpdate - An object containing the fields to be updated and their new values.
* Example: { firstName: 'John', age: 30 }
*
* @param {Object} jsToSql - Maps JavaScript-style object keys to the corresponding SQL column names.
* Example: { firstName: 'first_name', age: 'age' }
*
* @returns {Object} - An object containing:
*  - `setCols`: A string of column names and placeholders for updating the query.
*  - `values`: An array of values to be passed into the SQL query.
*
* @throws {BadRequestError} - If `dataToUpdate` is empty, meaning no fields were provided for updating.
*
* Example:
*   sqlForPartialUpdate(
*     { firstName: 'John', age: 30 },
*     { firstName: 'first_name' }
*   )
*   => {
*        setCols: '"first_name"=$1, "age"=$2',
*        values: ['John', 30]
*      }
*/

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
