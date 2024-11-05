// express-jobly/models/job.test.js
"use strict";

const db = require("../db");
const Job = require("./job");
const { BadRequestError, NotFoundError } = require("../expressError");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "New Job",
    salary: 60000,
    equity: 0.1,
    companyHandle: "c1",
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
      id: expect.any(Number),
      title: "New Job",
      salary: 60000,
      equity: 0.1,
      companyHandle: "c1",
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
       FROM jobs
       WHERE title = 'New Job'`
    );
    expect(result.rows).toEqual([
      {
        id: expect.any(Number),
        title: "New Job",
        salary: 60000,
        equity: 0.1,
        companyHandle: "c1",
      },
    ]);
  });

  test("bad request with invalid data", async function () {
    try {
      await Job.create({ title: "Invalid Job" }); // missing other fields
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "Job 1",
        salary: 50000,
        equity: 0.1,
        companyHandle: "c1",
      },
      // ... more jobs as per your setup
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get(1); // assuming job with ID 1 exists
    expect(job).toEqual({
      id: 1,
      title: "Job 1",
      salary: 50000,
      equity: 0.1,
      companyHandle: "c1",
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(999); // assuming no job with ID 999
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    title: "Updated Job",
    salary: 70000,
    equity: 0.2,
  };

  test("works", async function () {
    let job = await Job.update(1, updateData); // assuming job with ID 1 exists
    expect(job).toEqual({
      id: 1,
      ...updateData,
      companyHandle: "c1", // unchanged
    });

    const result = await db.query(
      `SELECT id, title, salary, equity
       FROM jobs
       WHERE id = 1`
    );
    expect(result.rows).toEqual([{
      id: 1,
      title: "Updated Job",
      salary: 70000,
      equity: 0.2,
    }]);
  });

  test("not found if no such job", async function () {
    try {
      await Job.update(999, updateData); // assuming no job with ID 999
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with invalid data", async function () {
    try {
      await Job.update(1, { salary: "not-a-number" }); // invalid salary
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(1); // assuming job with ID 1 exists
    const res = await db.query(`SELECT id FROM jobs WHERE id = 1`);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(999); // assuming no job with ID 999
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** filter */

describe("filter", function () {
  test("works with title filter", async function () {
    const jobs = await Job.filter({ title: "Job 1" });
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "Job 1",
        salary: 50000,
        equity: 0.1,
        companyHandle: "c1",
      },
    ]);
  });

  test("works with minSalary filter", async function () {
    const jobs = await Job.filter({ minSalary: 60000 });
    expect(jobs).toEqual([
      // ...expected jobs with salary >= 60000
    ]);
  });

  test("works with hasEquity filter", async function () {
    const jobs = await Job.filter({ hasEquity: true });
    expect(jobs).toEqual([
      // ...expected jobs with equity > 0
    ]);
  });

  test("works with multiple filters", async function () {
    const jobs = await Job.filter({ title: "Job", minSalary: 50000, hasEquity: true });
    expect(jobs).toEqual([
      // ...expected jobs based on combined filters
    ]);
  });
});
