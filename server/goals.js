const ACTIVITY_FACTOR = 1.4; //Between light and moderate
const GOAL_OFFSET = {lose: -500, maintain: 0, gain: 200};

function calculateGoals({height_cm, weight_kg, age, sex, goal}) {
  let kcal = 10*weight_kg + 6.25 * height_cm - 5 * age;
  kcal += sex === "male" ? 5 : -161;

  const calories = Math.round(kcal * ACTIVITY_FACTOR + GOAL_OFFSET[goal]);
  const protein = Math.round(1.1 * weight_kg * 2.2); //grams: 1.1 g per lb of body weight
  const fat = Math.round(.3 * weight_kg * 2.2); //grams: .3 g per lb of body weight
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);  //grams: whatever calories remain. 4cal/pro 4cal/carb 9cal/fat

  return { calories, protein, fat, carbs };
}

module.exports = {calculateGoals};