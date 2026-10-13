const express = require("express"); //import express
const pool = require("./db"); //import the shared connection from db.js

const app = express(); //create the server
app.use(express.json()); //read JSON request bodies into req.body

app.get("/test", async (req, res) => {
  const result = await pool.query("SELECT now()");
  res.json({ ok: true, dbTime: result.rows[0].now });
});

app.listen(3000, () => console.log("Server on port " + 3000));