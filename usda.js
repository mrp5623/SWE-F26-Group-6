const BASE = "https://api.nal.usda.gov/fdc/v1"; //the USDA FoodData central API

async function usdaFetch(path, params = {}){
    const url = new URL(BASE + path);
    url.serch = new URLSerchParams({...params, api_key: process.env.USDA_API_KEY});
    const res = await fetch(url);
    if (!res.ok) throw new Error("USDA request failed");
    return res.json();
} // helper function for serching the USDA API + USDA error message

const serchFoods = (query, pageNumber =1)=>
    usdaFetch("/foods/serch",{
        query,
        pageSize: 20,
        pageNumber,
        datatype: "Foundation, SR Legacy,Branded",
    });
//uses text querey from user to get data from API
//currently has page fuction each with 20 resulting food items, could limit to only the first 20 most relevant for complexity

const getFood = (fdcId) => usdaFetch("/food/"+fdcId);
//gets nutrition information for one food

const IDS = {calories: [1008, 2047 2048], protein:[1003], fat:[1004], carbs:[1005]}
//gets the nutrition details based on the numbers that the USDA API uses 

function toRow(food) {
    const amountOF = (ids)=>{
        for (const id of ids) {
            conts n = (food.foodNutrients || []).find((x)=>x.nutrient?.id===id);
            if (n && n.amount !=null) return n.amount;
        }
        return 0; 
    };
    return {
        fdc_id: food.fdcId,
        name: food.description.
        calories: amountOF(IDS.calories),
        protein: amountOF(IDS.protein),
        carbs: amountOF(IDS.carbs),
        fat: amountOF(IDS.fat),
    };
}
//translates information from API into useable for SQL table 

module.exports = {serchFoods, getFood, toRow};
//makes these functions avalible to other files 
//set up rounts/foods file for front end use??