// express-jobly/models/job.js


"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");

class Job {
  static async create({ title, salary, equity, companyHandle }) {
    const result = await db.query(
      `INSERT INTO jobs (title, salary, equity, company_handle)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
      [title, salary, equity, companyHandle]
    );

    const job = result.rows[0];
    return job;
  }

  static async findAll() {
    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
       FROM jobs`
    );

    return result.rows;
  }

  static async get(id) {
    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
       FROM jobs
       WHERE id = $1`,
      [id]
    );

    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      title: "title",
      salary: "salary",
      equity: "equity",
    });
    const idVar = `$${values.length + 1}`;
    const querySql = `UPDATE jobs SET ${setCols} WHERE id = ${idVar} RETURNING id, title, salary, equity, company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);

    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  static async remove(id) {
    const result = await db.query(
      `DELETE FROM jobs WHERE id = $1 RETURNING id`,
      [id]
    );

    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);
  }

  // Filter jobs based on criteria
  static async filter(filters) {
    const { title, minSalary, hasEquity } = filters;

    let query = `SELECT id, title, salary, equity, company_handle AS "companyHandle" FROM jobs WHERE 1=1`;
    const values = [];

    if (title) {
      values.push(`%${title}%`);
      query += ` AND title ILIKE $${values.length}`;
    }

    if (minSalary) {
      values.push(minSalary);
      query += ` AND salary >= $${values.length}`;
    }

    if (hasEquity !== undefined) {
      query += hasEquity ? ` AND equity > 0` : ` AND equity IS NOT NULL`;
    }

    const result = await db.query(query, values);
    return result.rows;
  }
}

module.exports = Job;
