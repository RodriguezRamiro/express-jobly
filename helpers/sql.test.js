"use strict";

const { sqlForPartialUpdate } = require("./sql");
const { BadRequestError } = require("../expressError");

describe("sqlForPartialUpdate", function () {

  test("works: correct data for a partial update", function () {
    const result = sqlForPartialUpdate(
      { firstName: "John", age: 30 },
      { firstName: "first_name" }
    );
    expect(result).toEqual({
      setCols: '"first_name"=$1, "age"=$2',
      values: ["John", 30],
    });
  });

  test("works: no jsToSql mappings", function () {
    const result = sqlForPartialUpdate(
      { firstName: "John", age: 30 },
      {}
    );
    expect(result).toEqual({
      setCols: '"firstName"=$1, "age"=$2',
      values: ["John", 30],
    });
  });

  test("works: with partial jsToSql mapping", function () {
    const result = sqlForPartialUpdate(
      { firstName: "John", age: 30 },
      { firstName: "first_name" }
    );
    expect(result).toEqual({
      setCols: '"first_name"=$1, "age"=$2',
      values: ["John", 30],
    });
  });

  test("throws BadRequestError if no data", function () {
    try {
      sqlForPartialUpdate({}, { firstName: "first_name" });
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  test("works: handles SQL reserved keywords", function () {
    const result = sqlForPartialUpdate(
      { order: "ASC" },
      { order: '"order"' }
    );
    expect(result).toEqual({
      setCols: '"order"=$1',
      values: ["ASC"],
    });
  });
});
