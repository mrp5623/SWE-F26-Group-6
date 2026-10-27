const express = require("express"); //import express
const pool = require("./db"); //import the shared connection from db.js
const { clerkMiddleware } = require("@clerk/express");
const cors = require("cors");
const { requireUser, requireAdmin } = require("./middleware/auth");
const profileRouter = require("./routes/profile");

const app = express(); //create the server
app.use(cors());
app.use(express.json()); //read JSON request bodies into req.body
app.use(clerkMiddleware());
app.use("/profile", requireUser, profileRouter);

app.get("/test", async (req, res) => {
  const result = await pool.query("SELECT now()");
  res.json({ ok: true, dbTime: result.rows[0].now });
});

app.get("/me", requireUser, (req, res) => {
  res.json({ userId: req.userId, role: req.role });
});

app.get("/admin/test", requireUser, requireAdmin, (req, res) => {
  res.json({ ok: true });
});

module.exports = app;