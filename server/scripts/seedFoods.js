//preload common foods

const pool = require("../db");
const { searchFoods, getFood, toRow} = require("../usda");
const { saveFood } = require("../foodStore");
const Queries = require("./starterFoods");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
    if (!process.env.USDA_API_KEY) {
        console.error("USDA_API_KEY is missing from .env");
        process.exit(1);
    }

    const failed = [];
    const suspicious = [];

    for (const [i, q] of Queries.entries()) {
        try {
            const data = await searchFoods(q, 1, { pageSize: 1, dataType: "SR Legacy,Foundation"});
            const hit = data.foods?.[0];
            if (!hit) {
                failed.push(q + " (no match)");
                continue;
            }

            const row = toRow(await getFood(hit.fdcId));
            await saveFood(row);

            const flag = row.calories === 0? " <-- CHECK: 0 calories" : "";
            if (flag) suspicious.push(row.name);
            console.log(`[${i + 1}/${Queries.length}] ${q} -> ${row.name} (${row.calories} kcal)${flag}`);

        } catch (err) {
            failed.push(q + " (" + err.message + ")");
            if (err.message.includes("429")) {
                console.error("Hit the USDA rate limit. Wait an hour and run again (finished foods are just updated).");
                break;
            }
        }
        await sleep(150); 
    }
    const { rows } = await pool.query("SELECT count(*) FROM foods");
    console.log(`\nDone. foods table now has ${rows[0].count} rows.`);
    if (suspicious.length) console.log("Zero-calorie matches to review:", suspicious);
    if (failed.length) console.log("Failed/unmatched queries:", failed);

    await pool.end();
}

main();