const { test } = require("node:test");
const assert = require("node:assert/strict");
const { calculateGoals } = require("../goals");

const jordan = {height_cm: 172, weight_kg: 60, age: 21, sex: "male", goal: "maintain"};

test("maintain: profile gets calories, protein, fat and carbs", () => {
  assert.deepEqual(calculateGoals(jordan), {calories: 2205, protein: 145, fat: 40, carbs: 316});
});

test("lose: 500 calories loss", () => {
  assert.equal(calculateGoals({ ...jordan, goal: "lose" }).calories, 1705);
});

test("gain: 200 calorie gain", () => {
  assert.equal(calculateGoals({ ...jordan, goal: "gain" }).calories, 2405);
});

test("female: (-166*ACTIVITY_FACTOR) calorie swing", () => {
  
  assert.equal(calculateGoals({ ...jordan, sex: "female" }).calories, 1973);
});