// express-jobly/routes/jobs.test.js
"use strict";

const request = require("supertest");
const app = require("../app");
const db = require("../db");
const { createToken } = require("../helpers/tokens");
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

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("works without filters", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: "Job 1",
          salary: 50000,
          equity: 0.1,
          companyHandle: "c1",
        },
        // ... other jobs as per setup
      ],
    });
  });

  test("works with title filter", async function () {
    const resp = await request(app).get("/jobs?title=Job 1");
    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: "Job 1",
          salary: 50000,
          equity: 0.1,
          companyHandle: "c1",
        },
      ],
    });
  });

  test("works with minSalary filter", async function () {
    const resp = await request(app).get("/jobs?minSalary=60000");
    expect(resp.body.jobs).toEqual([
      // ...expected jobs with salary >= 60000
    ]);
  });

  test("works with hasEquity filter", async function () {
    const resp = await request(app).get("/jobs?hasEquity=true");
    expect(resp.body.jobs).toEqual([
      // ...expected jobs with equity > 0
    ]);
  });
});

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "New Job",
    salary: 60000,
    equity: 0.1,
    companyHandle: "c1",
  };

  test("works for admin", async function () {
    const token = createToken({ username: "admin", isAdmin: true });
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("Authorization", `Bearer ${token}`);
    expect(resp.statusCode).toBe(201);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "New Job",
        salary: 60000,
        equity: 0.1,
        companyHandle: "c1",
      },
    });
  });

  test("unauth for non-admin", async function () {
    const token = createToken({ username: "user", isAdmin: false });
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("Authorization", `Bearer ${token}`);
    expect(resp.statusCode).toBe(401);
  });

  test("bad request for missing data", async function () {
    const token = createToken({ username: "admin", isAdmin: true });
    const resp = await request(app)
      .post("/jobs")
      .send({ title: "New Job" }) // missing other fields
      .set("Authorization", `Bearer ${token}`);
    expect(resp.statusCode).toBe(400);
  });
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  const updateData = {
    title: "Updated Job",
    salary: 70000,
    equity: 0.2,
  };

  test("works for admin", async function () {
    const token = createToken({ username: "admin", isAdmin: true });
    const resp = await request(app)
      .patch("/jobs/1") // assuming job with ID 1 exists
      .send(updateData)
      .set("Authorization", `Bearer ${token}`);
    expect(resp.body).toEqual({
      job: {
        id: 1,
        title: "Updated Job",
        salary: 70000,
        equity: 0.2,
        companyHandle: "c1", // unchanged
      },
    });
  });

  test("unauth for non-admin", async function () {
    const token = createToken({ username: "user", isAdmin: false });
    const resp = await request(app)
      .patch("/jobs/1")
      .send(updateData)
      .set("Authorization", `Bearer ${token}`);
    expect(resp.statusCode).toBe(401);
  });

  test("not found if no such job", async function () {
    const token = createToken({ username: "admin", isAdmin: true });
    const resp = await request(app)
      .patch("/jobs/999") // assuming no job with ID 999
      .send(updateData)
      .set("Authorization", `Bearer ${token}`);
    expect(resp.statusCode).toBe(404);
  });
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
  test("works for admin", async function () {
    const token = createToken({ username: "admin", isAdmin: true });
    const resp = await request(app)
      .delete("/jobs/1") // assuming job with ID 1 exists
      .set("Authorization", `Bearer ${token}`);
    expect(resp.body).toEqual({ deleted: "1" });
  });

  test("unauth for non-admin", async function () {
    const token = createToken({ username: "user", isAdmin: false });
    const resp = await request(app)
      .delete("/jobs/1")
      .set("Authorization", `Bearer ${token}`);
    expect(resp.statusCode).toBe(401);
  });

  test("not found if no such job", async function () {
    const token = createToken({ username: "admin", isAdmin: true });
    const resp = await request(app)
      .delete("/jobs/999") // assuming no job with ID 999
      .set("Authorization", `Bearer ${token}`);
    expect(resp.statusCode).toBe(404);
  });
});
