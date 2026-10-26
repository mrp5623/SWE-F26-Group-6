const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const request = require("supertest");
const pool = require("../db");
const profileRouter = require("../routes/profile");

let testUserId;

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  req.userId = testUserId;
  req.role = "member";
  next();
});
app.use("/profile", profileRouter);

before(async () => {
  await pool.query("DELETE FROM users WHERE clerk_id = 'test-profile-user'");
  const result = await pool.query("INSERT INTO users (clerk_id, role) VALUES ('test-profile-user', 'member') RETURNING id");
  testUserId = result.rows[0].id;
});

test("GET /profile returns empty fields for a new user", async () => {
  const res = await request(app).get("/profile");
  assert.equal(res.status, 200);
  assert.equal(res.body.weight_kg, null);
});

test("PUT /profile saves the profile and GET returns it", async () => {
  const profile = {height_cm: 180, weight_kg: 80, age: 20, sex: "male", goal: "maintain"};

  const putRes = await request(app).put("/profile").send(profile);
  assert.equal(putRes.status, 200);

  const getRes = await request(app).get("/profile");
  assert.deepEqual(getRes.body, { ...profile, role: "member" });
});

test("PUT /profile with an invalid goal returns 400", async () => {
  const profile = {height_cm: 180, weight_kg: 80, age: 20, sex: "male", goal: "maintai"};

  const res = await request(app).put("/profile").send(profile);
  assert.equal(res.status, 400);
});

after(async () => {
  await pool.query("DELETE FROM users WHERE id = $1", [testUserId]);
  await pool.end();
});