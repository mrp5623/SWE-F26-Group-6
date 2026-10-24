const { test } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const app = require("../app");
const { requireAdmin } = require("../middleware/auth");

test("GET /me without a token returns 401", async () => {
  const res = await request(app).get("/me");
  assert.equal(res.status, 401);
});

test("requireAdmin blocks members with 403", () => {
  const req = { role: "member" };

  let statusCode;
  const res = {
    status(code) { statusCode = code; return this; },
    json() {},
  };

  let adminPass = false;
  requireAdmin(req, res, () => { adminPass = true; });

  assert.equal(statusCode, 403);
  assert.equal(adminPass, false);
});

test("requireAdmin lets admins through", () => {
  const req = { userRole: "admin" };
  let adminPass = false;
  requireAdmin(req, {}, () => { adminPass = true; });
  assert.equal(adminPass, true);
});