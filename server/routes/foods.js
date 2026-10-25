const router = require("express").Router();
const pool = require("../db");
const { searchFoods, getFood, toRow } = require("../usda");
const { saveFood } = require("../foodStore");

//part of food search function that will talk to fontend
//may have to reorganize based on the frontend requirements4

router.get("/search", async (req, res) => {
    const q = (req.query.q || "").trim();
    if (!q) return res.status(400).json({ error: "q is required" });
    const data = await searchFoods(q, Number(req.query.page) || 1);
    res.json(
        data.foods.map((f) => ({
            fdc_id: f.fdcId,
            name: f.description,
            brand: f.brandOwner || null,
            data_type: f.dataType,
        }))
    );
});

router.get("/saved", async (req, res) => {
    const q = (req.query.q || "").trim();
    const { rows } =await pool.query(
        "SELECT * FROM foods WHERE name ILIKE $1 ORDER BY name LIMIT 25",
        ["%" + q + "%"]
    );
    res.json(rows);
});

router.post("/import", async (req, res) => {
    const fdcId = Number(req.body.fdc_id);
    if (!Number.isInteger(fdcId)) return res.status(400).json({ error: "fdc_id must be an integer"

    });

    const existing = await pool.query("SELECT * FROM foods WHERE fdc_id = $1", [fdcId]);
    if (existing.rows.length) return res.json(existing.rows[0]);

    const saved = await saveFood(toRow(await getFood(fdcId)));
    res.status(201).json(saved);
});


router.get("/:id", async (req, res) => {
    const { rows } = await pool.query("SELECT * FROM foods WHERE id = $1", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "not found"});
    res.json(rows[0]);
});

module.exports = router;
