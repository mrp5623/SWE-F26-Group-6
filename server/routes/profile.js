const express = require("express");
const pool = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  const result = await pool.query("SELECT height_cm, weight_kg, age, sex, goal, role FROM users WHERE id = $1", [req.userId]);
  res.json(result.rows[0]);
});

router.put("/", async (req, res) => {
  const { height_cm, weight_kg, age, sex, goal } = req.body;

  if (!["lose", "maintain", "gain"].includes(goal)) {
    return res.status(400).json({error: "goal must be lose, maintain, or gain"});
  }

  if (!["male", "female"].includes(sex)) {
    return res.status(400).json({error: "sex must be male or female"});
  }

  const result = await pool.query(
    "UPDATE users SET height_cm = $1, weight_kg = $2, age = $3, sex = $4, goal = $5 WHERE id = $6 RETURNING height_cm, weight_kg, age, sex, goal, role",
    [height_cm, weight_kg, age, sex, goal, req.userId]
  );
  res.json(result.rows[0]);
});

module.exports = router;