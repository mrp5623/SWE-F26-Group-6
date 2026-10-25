const pool = require("./db");

//takes organized information from toRow function and stores it in table, returns stored row

async function saveFood(f) {
    const { rows } = await pool.query(
        `INSERT INTO foods (fdc_id, name, calories, protein, carbs, fat)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (fdc_id) DO UPDATE SET 
            name= EXCLUDED.name,
            calories= EXCLUDED.calories,
            protein= EXCLUDED.protein,
            carbs= EXCLUDED.carbs,
            fat= EXCLUDED.fat
        RETURNING *`,
        [f.fdc_id, f.name, f.calories, f.protein, f.carbs, f.fat]

    );
    return rows[0];
}

module.exports = { saveFood };