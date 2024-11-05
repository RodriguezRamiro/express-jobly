"use strict";

const request = require("supertest");
const app = require("../app");

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

/************************************** POST /auth/token */

describe("POST /auth/token", function () {
  test("works", async function () {
    const resp = await request(app)
      .post("/auth/token")
      .send({
        username: "u1",
        password: "password1",
      });
    expect(resp.body).toEqual({
      token: expect.any(String),
    });
  });

  test("unauth with non-existent user", async function () {
    const resp = await request(app)
      .post("/auth/token")
      .send({
        username: "no-such-user",
        password: "password1",
      });
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth with wrong password", async function () {
    const resp = await request(app)
      .post("/auth/token")
      .send({
        username: "u1",
        password: "nope",
      });
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/auth/token")
      .send({
        username: "u1",
      });
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/auth/token")
      .send({
        username: 42,
        password: "above-is-a-number",
      });
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** POST /auth/register */

describe("POST /auth/register", function () {
  test("works for anon", async function () {
    const resp = await request(app)
      .post("/auth/register")
      .send({
        username: "new",
        firstName: "first",
        lastName: "last",
        password: "password",
        email: "new@email.com",
      });
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      token: expect.any(String),
    });
  });

  test("bad request with missing fields", async function () {
    const resp = await request(app)
      .post("/auth/register")
      .send({
        username: "new",
      });
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/auth/register")
      .send({
        username: "new",
        firstName: "first",
        lastName: "last",
        password: "password",
        email: "not-an-email",
      });
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** Admin Routes Tests */

describe("Admin routes", function () {
  // Test case for creating a user as an admin
  test("Admin can create a user", async function () {
    const resp = await request(app)
      .post("/users")
      .set("Authorization", `Bearer ${adminJwt}`) // adminJwt is a token for an admin user
      .send({ username: "newuser", password: "password", email: "newuser@email.com", isAdmin: false });
    expect(resp.statusCode).toBe(201);
    expect(resp.body.user.username).toEqual("newuser");
  });

  // Test case for non-admin user trying to create a user
  test("Non-admin cannot create a user", async function () {
    const resp = await request(app)
      .post("/users")
      .set("Authorization", `Bearer ${nonAdminJwt}`) // nonAdminJwt is a token for a non-admin user
      .send({ username: "newuser", password: "password", email: "newuser@email.com", isAdmin: false });
    expect(resp.statusCode).toBe(403);
  });

  // Test case for getting the list of users as an admin
  test("Admin can get all users", async function () {
    const resp = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${adminJwt}`);
    expect(resp.statusCode).toBe(200);
    expect(Array.isArray(resp.body.users)).toBe(true);
  });

  // Test case for non-admin trying to get the list of users
  test("Non-admin cannot get all users", async function () {
    const resp = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${nonAdminJwt}`);
    expect(resp.statusCode).toBe(403);
  });

  // Test case for getting a user's info by the user
  test("User can get their own info", async function () {
    const resp = await request(app)
      .get(`/users/${testUser.username}`)
      .set("Authorization", `Bearer ${userJwt}`); // userJwt is a token for the user
    expect(resp.statusCode).toBe(200);
    expect(resp.body.user.username).toEqual(testUser.username);
  });

  // Test case for getting a user's info by an admin
  test("Admin can get any user's info", async function () {
    const resp = await request(app)
      .get(`/users/${testUser.username}`)
      .set("Authorization", `Bearer ${adminJwt}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body.user.username).toEqual(testUser.username);
  });

  // Test case for updating a user by the user
  test("User can update their own info", async function () {
    const resp = await request(app)
      .put(`/users/${testUser.username}`)
      .set("Authorization", `Bearer ${userJwt}`)
      .send({ password: "newpassword" });
    expect(resp.statusCode).toBe(200);
    expect(resp.body.user.username).toEqual(testUser.username);
  });

  // Test case for updating a user by an admin
  test("Admin can update any user", async function () {
    const resp = await request(app)
      .put(`/users/${testUser.username}`)
      .set("Authorization", `Bearer ${adminJwt}`)
      .send({ password: "newpassword" });
    expect(resp.statusCode).toBe(200);
    expect(resp.body.user.username).toEqual(testUser.username);
  });

  // Test case for deleting a user by the user
  test("User can delete their own account", async function () {
    const resp = await request(app)
      .delete(`/users/${testUser.username}`)
      .set("Authorization", `Bearer ${userJwt}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body.deleted).toEqual(testUser.username);
  });

  // Test case for deleting a user by an admin
  test("Admin can delete any user", async function () {
    const resp = await request(app)
      .delete(`/users/${testUser.username}`)
      .set("Authorization", `Bearer ${adminJwt}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body.deleted).toEqual(testUser.username);
  });
});
